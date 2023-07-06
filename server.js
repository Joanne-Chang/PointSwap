// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();

const bodyParser = require('body-parser');
const assets = require('assets');
const sql = require("sqlite3").verbose();
const fs = require('fs');
const multer = require('multer');
const FormData = require("form-data");

const passport = require('passport');
const rq = require('request');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');


const requestsDatabase = new sql.Database("requests.db");



app.use(bodyParser.json());

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back. 
function printIncomingRequest (req, res, next) {
    console.log("Serving",req.url);
    if (req.cookies) {
      console.log("cookies",req.cookies)
    }
    next();
}





// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});









// Database Creation
createRequestsDatabase(); 

//Initialize Lost and Found Table if it does not exist already
function createRequestsDatabase() {

  const request_cmd = 'CREATE TABLE IF NOT EXISTS lost_info(order TEXT, cost TEXT)';
  requestsDatabase.run(request_cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
  
}


// Insert request into table
function insertRequest(order, cost){

    var dbInsertStr = 'INSERT INTO request_info VALUES( "' + order + '", "' + cost + '")';
    console.log(dbInsertStr);

    requestsDatabase.run(dbInsertStr, function(err, val) {
        if (err) {
          console.log("Could not insert into table",err.message);
        } else {
          console.log("Inserted into table");
        }
      });
}



//POST AJAX CALLS for DB INSERT

function getRequest(order, cost){

  let sqlGET = 'SELECT * FROM request_info WHERE order == ' + '"' + order + '" ' + "AND " + "cost == " + '"' + cost;
  // GET data
  
  requestsDatabase.all(sqlGET, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
  });
  
  }


var myData = {};

app.post('/saveRequest', function (req, res) {  
  let order = req.body.order;
  let cost = req.body.cost;

  insertRequest(order, cost)
  res.send(myData.order);
});



app.get('/getRequests', function(req,res){
  var order = req.query.order;
  var cost = req.query.cost;
  
  var myArray = order.split(" ");  
  var myStr = "('%";

  myStr = myStr + myArray[0] + "%'";
  for (var i = 1; i < myArray.length; i++){
      myStr = myStr + ", '%" + myArray[i] + "%'";
  }
  myStr = myStr + ')';
  
  
  var sqlGET = '';
  
  if(order == '' && cost == ''){
    sqlGET = 'SELECT * FROM request_info WHERE order LIKE ' + myStr + " AND "+ "cost == " + '"' + cost + '" ';
  }
  else if(order == '' && cost != ''){
    sqlGET = 'SELECT * FROM request_info WHERE order LIKE ' + myStr;
  }
  else if(order != '' && cost == ''){
    sqlGET = 'SELECT * FROM request_info WHERE ' + "cost == " + '"' + cost + '" ';
  }
  else {
    // sqlGET = 'nothing';
  }

  
  console.log(sqlGET);

  requestsDatabase.all(sqlGET, [], (err, rows) => {
    if (err) {
        throw err;
    }
    res.send(rows);
     
    rows.forEach((row) => {
        console.log(row);
    });
  });
});