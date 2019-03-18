"use strict";

// Process title.
process.title = "node-cardgame";

// Port where we'll run the websocket server.
var httpServerPort = 80;
var socketServerPort = 1337;

// Websocket and http servers.
var webSocketServer = require("websocket").server;
var http = require("http");
var fs = require("fs");
var express = require("express");
var ws = require('./node_modules/ws');

// List of previous data.
var history = [ ];
// List of currently connected clients.
var clients = [ ];
// Number of current users, used to name a user when one joins.
var numUsers = 0;
// Request counter.
var counter = 0;

// Input string helper function.
function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Express implementation.
var app = express()

// HTML
app.get('/', function (req, res) {
   res.sendFile(__dirname + '/playmat.html');
});
app.get('/playmat.html', function (req, res) {
   res.sendFile(__dirname + '/playmat.html');
});
app.get('/playmat.html?', function (req, res) {
   res.sendFile(__dirname + '/playmat.html');
});
app.get('/header.html', function (req, res) {
   res.sendFile(__dirname + '/header.html');
});
app.get('/footer.html', function (req, res) {
   res.sendFile(__dirname + '/footer.html');
});
// JS
app.get('/chat.js', function (req, res) {
   res.sendFile(__dirname + '/chat.js');
});
app.get('/load-shared.js', function (req, res) {
   res.sendFile(__dirname + '/load-shared.js');
});
app.get('/draggable.js', function (req, res) {
   res.sendFile(__dirname + '/draggable.js');
});
app.get('/bootstrap.min.js', function (req, res) {
   res.sendFile(__dirname + '/bootstrap.min.js');
});
app.get('/jquery.js', function (req, res) {
   res.sendFile(__dirname + '/jquery.js');
});
// CSS
app.get('/css/main.css', function (req, res) {
   res.sendFile(__dirname + '/css/main.css');
});
app.get('/css/bootstrap.min.css', function (req, res) {
   res.sendFile(__dirname + '/css/bootstrap.min.css');
});
// Images
app.get('/images/card.jpg', function (req, res) {
   res.sendFile(__dirname + '/images/card.jpg');
});

app.listen(httpServerPort, function () {
   console.log((new Date()) + " HTTP Server listening on port " + httpServerPort);
})

// WebSocket server setup.
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
      // Possibly update name.
      if(message.utf8Data.includes("I am ")) {
        // Undo preparation of string.
        console.log(message.utf8Data);
        var newName = message.utf8Data.replace("I am ", "").replace("<span style='color: #758fff'><b>", "").replace("</b></span>: ", "").replace("<b><em>", "").replace("</em></b>", "").replace(/^\s+|\s+$/g, "").substring(0, 16);

        // Update history list.
        var obj = {
          time: (new Date()).getTime(),
          text: userName + " changed their name to " + newName,
          author: "Server",
        };
        history.push(obj);
        history = history.slice(-100);

        // Broadcast message to all connected clients.
        var json = JSON.stringify({ type:'message', data: obj });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }

        // Finally update name.
        userName = newName;
        console.log("Changed name to " + newName);
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
