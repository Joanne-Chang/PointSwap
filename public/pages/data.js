// Module['locateFile'] = function(path, prefix) {
//   // if it's a mem init file, use a custom dir
//   if (path.endsWith(".mem")) return "https://mycdn.com/memory-init-dir/" + path;
//   // otherwise, use the default, the prefix (JS file's dir) + the path
//   return prefix + path;
// }

const initSqlJs = require('sql.js');
// or if you are in a browser:
// const initSqlJs = window.initSqlJs;

const SQL = await initSqlJs({
  // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
  // You can omit locateFile completely when running in node
  locateFile: file => `https://sql.js.org/dist/${file}`
});

// Create a database
const db = new SQL.Database();
// NOTE: You can also use new SQL.Database(data) where
// data is an Uint8Array representing an SQLite database file


// Execute a single SQL string that contains multiple statements
let sqlstr = "CREATE TABLE user (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
db.run(sqlstr); // Run the query without returning anything

// Prepare an sql statement
const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

// Bind values to the parameters and fetch the results of the query
const result = stmt.getAsObject({':aval' : 1, ':bval' : 'world'});
console.log(result); // Will print {a:1, b:'world'}

// Bind other values
stmt.bind([0, 'hello']);
while (stmt.step()) console.log(stmt.get()); // Will print [0, 'hello']
// free the memory used by the statement
stmt.free();
// You can not use your statement anymore once it has been freed.
// But not freeing your statements causes memory leaks. You don't want that.

const res = db.exec("SELECT * FROM hello");
/*
[
  {columns:['a','b'], values:[[0,'hello'],[1,'world']]}
]
*/

// You can also use JavaScript functions inside your SQL code
// Create the js function you need
function add(a, b) {return a+b;}
// Specifies the SQL function's name, the number of it's arguments, and the js function to use
db.create_function("add_js", add);
// Run a query in which the function is used
db.run("INSERT INTO hello VALUES (add_js(7, 3), add_js('Hello ', 'world'));"); // Inserts 10 and 'Hello world'

// You can create custom aggregation functions, by passing a name
// and a set of functions to `db.create_aggregate`:
//
// - an `init` function. This function receives no argument and returns
//   the initial value for the state of the aggregate function.
// - a `step` function. This function takes two arguments
//    - the current state of the aggregation
//    - a new value to aggregate to the state
//  It should return a new value for the state.
// - a `finalize` function. This function receives a state object, and
//   returns the final value of the aggregate. It can be omitted, in which case
//   the final value of the state will be returned directly by the aggregate function.
//
// Here is an example aggregation function, `json_agg`, which will collect all
// input values and return them as a JSON array:
db.create_aggregate(
  "json_agg",
  {
    init: () => [],
    step: (state, val) => [...state, val],
    finalize: (state) => JSON.stringify(state),
  }
);

db.exec("SELECT json_agg(column1) FROM (VALUES ('hello'), ('world'))");
// -> The result of the query is the string '["hello","world"]'

// Export the database to an Uint8Array containing the SQLite database file
const binaryArray = db.export();