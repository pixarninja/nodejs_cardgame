"use strict";

// Process title.
process.title = "node-cardgame";

// Modules.
var webSocketServer = require("websocket").server;
var http = require("http");
var fs = require("fs");
var express = require("express");
var path = require('path');
var FormData = require('form-data');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Host and websocket servers variables.
var httpServerPort = 80;
var socketServerPort = 9000;
var serverIP = "54.174.152.202";

// HTTP Server Express implementation.
var httpServer = express();

// Statically host files from public/ directory.
process.env.PWD = process.cwd();
httpServer.use(express.static(path.join(process.env.PWD, 'public')));

// Handle serving non-static content.
httpServer.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
  // Use port in request, if within range.
  if(req.query.port != null && req.query.port > 8000 && req.query.port < 9000) {
    socketServerPort = req.query.port;
    console.log("Set port: " + req.query.port);

    // Update socket.xml file with port.
    fs.writeFile("public/socket.xml", socketServerPort, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });

    // Restart websocket.
    setupWebSocket();
  }
  // Select socket server port.
  else {
    socketServerPort = 9000;

    // Update socket.dat file with port.
    fs.writeFile("public/socket.xml", socketServerPort, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });

    // Restart websocket.
    setupWebSocket();
  }
});
httpServer.get('/help.html', function (req, res) {
  res.sendFile(__dirname + '/help.html');
});
httpServer.get('/header.html', function (req, res) {
  res.sendFile(__dirname + '/header.html');
});
httpServer.get('/footer.html', function (req, res) {
  res.sendFile(__dirname + '/footer.html');
});
httpServer.get('/card.css', function (req, res) {
  res.sendFile(__dirname + '/card.css');
});

// Handle serving card images.
httpServer.get('/images/card-blank.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-blank.jpg');
});
httpServer.get('/images/card-1c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-1c.jpg');
});
httpServer.get('/images/card-2c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-2c.jpg');
});
httpServer.get('/images/card-3c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-3c.jpg');
});
httpServer.get('/images/card-4c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-4c.jpg');
});
httpServer.get('/images/card-5c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-5c.jpg');
});
httpServer.get('/images/card-6c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-6c.jpg');
});
httpServer.get('/images/card-7c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-7c.jpg');
});
httpServer.get('/images/card-8c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-8c.jpg');
});
httpServer.get('/images/card-9c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-9c.jpg');
});
httpServer.get('/images/card-10c.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-10c.jpg');
});
httpServer.get('/images/card-jc.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-jc.jpg');
});
httpServer.get('/images/card-qc.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-qc.jpg');
});
httpServer.get('/images/card-kc.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-kc.jpg');
});
httpServer.get('/images/card-1d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-1d.jpg');
});
httpServer.get('/images/card-2d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-2d.jpg');
});
httpServer.get('/images/card-3d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-3d.jpg');
});
httpServer.get('/images/card-4d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-4d.jpg');
});
httpServer.get('/images/card-5d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-5d.jpg');
});
httpServer.get('/images/card-6d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-6d.jpg');
});
httpServer.get('/images/card-7d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-7d.jpg');
});
httpServer.get('/images/card-8d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-8d.jpg');
});
httpServer.get('/images/card-9d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-9d.jpg');
});
httpServer.get('/images/card-10d.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-10d.jpg');
});
httpServer.get('/images/card-jd.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-jd.jpg');
});
httpServer.get('/images/card-qd.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-qd.jpg');
});
httpServer.get('/images/card-kd.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-kd.jpg');
});
httpServer.get('/images/card-1h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-1h.jpg');
});
httpServer.get('/images/card-2h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-2h.jpg');
});
httpServer.get('/images/card-3h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-3h.jpg');
});
httpServer.get('/images/card-4h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-4h.jpg');
});
httpServer.get('/images/card-5h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-5h.jpg');
});
httpServer.get('/images/card-6h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-6h.jpg');
});
httpServer.get('/images/card-7h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-7h.jpg');
});
httpServer.get('/images/card-8h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-8h.jpg');
});
httpServer.get('/images/card-9h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-9h.jpg');
});
httpServer.get('/images/card-10h.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-10h.jpg');
});
httpServer.get('/images/card-jh.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-jh.jpg');
});
httpServer.get('/images/card-qh.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-qh.jpg');
});
httpServer.get('/images/card-kh.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-kh.jpg');
});
httpServer.get('/images/card-1s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-1s.jpg');
});
httpServer.get('/images/card-2s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-2s.jpg');
});
httpServer.get('/images/card-3s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-3s.jpg');
});
httpServer.get('/images/card-4s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-4s.jpg');
});
httpServer.get('/images/card-5s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-5s.jpg');
});
httpServer.get('/images/card-6s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-6s.jpg');
});
httpServer.get('/images/card-7s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-7s.jpg');
});
httpServer.get('/images/card-8s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-8s.jpg');
});
httpServer.get('/images/card-9s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-9s.jpg');
});
httpServer.get('/images/card-10s.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-10s.jpg');
});
httpServer.get('/images/card-js.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-js.jpg');
});
httpServer.get('/images/card-qs.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-qs.jpg');
});
httpServer.get('/images/card-ks.jpg', function (req, res) {
  res.type('image/jpg');
  res.sendFile(__dirname + '/images/card-ks.jpg');
});

// Start HTTP Server.
httpServer.listen(httpServerPort, function () {
   console.log((new Date()) + " HTTP Server listening on port " + httpServerPort);
})

// Start websocket.
setupWebSocket();

// WebSocket server setup.
function setupWebSocket() {
  // List of previous data.
  var history = [ ];
  // List of currently connected clients.
  var clients = [ ];
  // Number of current users, used to name a user when one joins.
  var numUsers = 0;
  // Request counter.
  var counter = 0;

  var socketServer = http.createServer(function(request, response) {
    console.log("Socket Server got a request: " + request.url);
  });
  socketServer.listen(socketServerPort, function() {
    console.log((new Date()) + " Socket Server is listening on port " + socketServerPort);
  }).on('error', console.log);;
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
    var userName = null;
    console.log((new Date()) + ' Connection accepted.');

    // Send message callback.
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        // Attempt to parse as JSON.
        try {
          var json = JSON.parse(message.utf8Data);

          if(json.cardName != null && json.position != null) {
            // Update history list.
            if(json.position.includes("draw")) {
              var obj = {
                time: (new Date()).getTime(),
                text: userName + " drew a card.",
                author: "Server",
              };
            }
            else if(json.position.includes("discard")) {
              var obj = {
                time: (new Date()).getTime(),
                text: userName + " discarded " + json.cardName + ".",
                author: "Server",
              };
            }
            else {
              var obj = {
                time: (new Date()).getTime(),
                text: userName + " dropped " + json.cardName + " at " + json.position + ".",
                author: "Server",
              };
            }
            history.push(obj);
            history = history.slice(-100);

            // Broadcast message to all connected clients.
            var message = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(message);
            }
          }

          var obj = {
            player: json.player,
            field: json.field,
          };

          // Broadcast message to all connected clients.
          var message = JSON.stringify({ type:'field', data: obj });
          for (var i=0; i < clients.length; i++) {
            clients[i].sendUTF(message);
          }
        } catch(e) {
          // Store and broadcast username.
          if (userName == null) {
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

            // Broadcast message to all connected clients.
            var json = JSON.stringify({ type:'name', data: obj });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }

            // Drop if this is a handshake (it should be)
            if(message.utf8Data === "Handshake") {
              return;
            }
          }

          // Possibly update name.
          if(message.utf8Data.includes("My name is ")) {
            // Undo preparation of string.
            console.log(message.utf8Data);
            var parsedName = message.utf8Data.split("My name is");
            var newName = parsedName[parsedName.length - 1].replace("My name is ", "").replace("<span style='color: #758fff'><b>", "").replace("</b></span>: ", "").replace("<b><em>", "").replace("</em></b>", "").replace(/^\s+|\s+$/g, "").substring(0, 16);

            // Update history list.
            var obj = {
              time: (new Date()).getTime(),
              text: userName + " changed their name to " + newName,
              author: "Server",
            };
            history.push(obj);

            // Update server's history with name change.
            for(var i = 0; i < history.length; i++) {
              if(history[i].author == "Server" && history[i].text.includes(userName) && !history[i].text.includes(" changed their name to ")) {
                console.log("Old: " + history[i].text);
                history[i].text = history[i].text.replace(userName, newName);
                console.log("New: " + history[i].text);
              }
              if(history[i].author == userName) {
                history[i].author = newName;
              }
            }

            // Broadcast updated history to all connected clients.
            var json = JSON.stringify({ type:'history', data: history });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }

            // Broadcast message to all connected clients.
            var json = JSON.stringify({ type:'name', data: obj });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }

            // Finally update name.
            userName = newName;
            console.log("Changed name to " + newName);
          }
          else {
            // Log and broadcast the message.
            console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.utf8Data);
            
            // Update history list.
            var obj = {
              time: (new Date()).getTime(),
              text: message.utf8Data,
              author: userName,
            };
            history.push(obj);

            // Broadcast message to all connected clients.
            var json = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }
          }
        }
      }
    });

    // Client disconnect callback.
    connection.on('close', function(connection) {
      if (userName != null) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        clients.splice(index, 1);

        // Update history by removing client's data.
        for(var i = history.length - 1; i >= 0; i--) {
          if(history[i].author == userName || (history[i].author == "Server" && history[i].text.includes(userName))) {
            history.splice(i, 1);
          }
        }
        var obj = {
          time: (new Date()).getTime(),
          text: userName + " left the server!",
          author: "Server",
        };
        history.push(obj);

        // Broadcast new history to all connected clients.
        var json = JSON.stringify({ type:'history', data: history });
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    });

    // Send back chat history as JSON.
    if (history.length > 0) {
      console.log(history);
      connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
    }
  });
}
