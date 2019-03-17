"use strict";

// Process title.
process.title = 'node-cardgame';

// Port where we'll run the websocket server.
var httpServerPort = 8080;
var socketServerPort = 1337;

// Websocket and http servers.
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var counter = 0;

// List of previous data.
var history = [ ];
// List of currently connected clients.
var clients = [ ];
// Number of current users, used to name a user when one joins.
var numUsers = 0;

// Input string helper function.
function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


// HTTP server setup.
var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server.

  counter++;
  console.log("Request: " + request.url + " (" + counter + ")");

  // Serve HTML to client.
  if(request.url == "/chat.html") {
    fs.readFile("chat.html", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/playmat.html" || request.url === "/playmat.html?") {
    fs.readFile("playmat.html", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/header.html" || request.url == "/header.html?") {
    fs.readFile("header.html", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/footer.html") {
    fs.readFile("footer.html", function(err, text){
      response.end(text);
    });
    return;
  }
  // Serve JavaScript to client.
  else if(request.url == "/chat.js") {
    fs.readFile("chat.js", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/load-shared.js") {
    fs.readFile("load-shared.js", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/memo.js") {
    fs.readFile("memo.js", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/bootstrap.min.js") {
    fs.readFile("bootstrap.min.js", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/jquery.js") {
    fs.readFile("jquery.js", function(err, text){
      response.end(text);
    });
    return;
  }
  // Serve CSS to client.
  else if(request.url == "/css/main.css") {
    fs.readFile("css/main.css", function(err, text){
      response.end(text);
    });
    return;
  }
  else if(request.url == "/css/bootstrap.min.css") {
    fs.readFile("css/bootstrap.min.css", function(err, text){
      response.end(text);
    });
    return;
  }
  // Serve images to client.
  else if(request.url == "/images/wallart.jpg") {
    fs.readFile("images/wallart.jpg", function(err, text){
      response.end(text);
    });
    return;
  }

  response.setHeader("Content-Type", "text/html");
  response.end("<p>Hello World. Request counter: " + counter + ".</p>");
});

// Start HTTP server.
server.listen(httpServerPort, function() {
  console.log((new Date()) + " HTTP Server is listening on port " + httpServerPort);
});

// WebSocket server.
var socketServer = http.createServer(function(request, response) {
  console.log("Socket Server got a request: " + request.url);
});
socketServer.listen(socketServerPort, function() {
  console.log((new Date()) + " Socket Server is listening on port " + socketServerPort);
});
var wsServer = new webSocketServer({
  httpServer: socketServer
});

// WebSocket callback.
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  // Possibly check 'request.origin' to make sure that client is connecting from correct website.
  // (more info at: http://en.wikipedia.org/wiki/Same_origin_policy).
  var connection = request.accept(null, request.origin);

  // Initialize client variables.
  var index = clients.push(connection) - 1;
  var userName = false;
  console.log((new Date()) + ' Connection accepted.');

  // Send message callback.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // Store and broadcast username.
      if (userName === false) {
        // Store username
        numUsers++;
        userName = "User" + numUsers;
        console.log((new Date()) + ' User is known as: ' + userName);

        // Update history list.
        var obj = {
          time: (new Date()).getTime(),
          text: userName + " joined the server!",
          author: "Server",
        };
        history.push(obj);
        history = history.slice(-100);

        // Broadcast message to all connected clients.
        var json = JSON.stringify({ type:'name', data: obj });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }

      // Log and broadcast the message.
      console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.utf8Data);
      
      // Update history list.
      var obj = {
        time: (new Date()).getTime(),
        text: message.utf8Data,
        author: userName,
      };
      history.push(obj);
      history = history.slice(-100);

      // Broadcast message to all connected clients.
      var json = JSON.stringify({ type:'message', data: obj });
      for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(json);
      }
    }
  });

  // Client disconnect callback.
  connection.on('close', function(connection) {
    if (userName !== false) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
      clients.splice(index, 1);
    }
  });

  // Send back chat history as JSON.
  if (history.length > 0) {
    connection.sendUTF(JSON.stringify({ type: 'history', data: history} ));
  }
});
