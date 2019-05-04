$(function() {
  $.get("public/socket.dat", function(data, status){
    console.log("Data: " + data + "\nStatus: " + status);
    document.getElementById("port").className = data;
  });
});
