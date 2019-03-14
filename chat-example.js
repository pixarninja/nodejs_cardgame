"use strict";

// Process title.
process.title = 'node-cardgame';

// Port where we'll run the websocket server.
var webSocketsServerPort = 8080;

// Websocket and http servers.
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var counter = 0;

// List of previous data.
var history = [ ];
// List of currently connected clients.
var clients = [ ];

// Input string helper function.
function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors in random order.
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } );

// HTTP server setup.
var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server.

  counter++;
  console.log("Request: " + request.url + " (" + counter + ")");

  // Serve app.html base webpage to client.
  if(request.url == "/app.html") {
    fs.readFile("app.html", function(err, text){
      //response.setHeader("Content-Type", "text/html");
      response.end(text);
    });
    return;
  }

  // Serve frontent.js to client.
  if(request.url == "/frontend.js") {
    fs.readFile("frontend.js", function(err, text){
      response.end(text);
    });
    return;
  }

  response.setHeader("Content-Type", "text/html");
  response.end("<p>Hello World. Request counter: " + counter + ".</p>");
});

// Start HTTP server.
server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

// WebSocket server.
var wsServer = new webSocketServer({
  httpServer: server
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
  var userColor = false;
  console.log((new Date()) + ' Connection accepted.');

  // Send back chat history as JSON.
  if (history.length > 0) {
    connection.sendUTF(
        JSON.stringify({ type: 'history', data: history} ));
  }

  // Send message callback.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
     if (userName === false) {
        // Store username and color
        userName = htmlEntities(message.utf8Data);
        userColor = colors.shift();
        connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
        console.log((new Date()) + ' User is known as: ' + userName + ' with ' + userColor + ' color.');
      } else { // log and broadcast the message
        console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.utf8Data);
        
        // Update history list.
        var obj = {
          time: (new Date()).getTime(),
          text: htmlEntities(message.utf8Data),
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);

        // Broadcast message to all connected clients.
        var json = JSON.stringify({ type:'message', data: obj });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    }
  });

  // Client disconnect callback.
  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
      clients.splice(index, 1);
      colors.push(userColor);
    }
  });
});
