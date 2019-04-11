$(function() {
  $.get("public/socket.xml", function(data, status){
    console.log("Data: " + data + "\nStatus: " + status);
    document.getElementById("port").className = data;
  });
});
