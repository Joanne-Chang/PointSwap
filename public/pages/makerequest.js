var mydata = {};
mydata.image = '';

document.querySelector('#submit').addEventListener('click', () => {
  let order = document.getElementById("order");
  // let cost = document.getElementById("cost");
  
  let data = {
      order: order
  }

  console.log(data);
  console.log(JSON.stringify(data));

  var xmlhttp = new XMLHttpRequest();   
  xmlhttp.open("POST", '/saveRequest');
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify(data));

  var submitLink = "https://scu-dining-points-exchange.glitch.me/formsubmit.html";

  window.location.href = submitLink;
});
