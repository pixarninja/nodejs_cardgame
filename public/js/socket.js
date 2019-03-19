$(function () {
  "use strict";

  // Globals variables.
  var card = document.getElementsByClassName("card")[0];
  var containers = document.getElementsByClassName("container");

  // To avoid searching in DOM.
  var content = $("#chat-history");
  var input = $("#input-field-bar");
  var status = $("#status");

  // IP address of the server.
  var serverIP = "54.174.152.202";
  // Port of the socket.
  var socketPort = "1337";
  // Name flag and username sent.
  var myName = false;
  var userName = "Unkown";
  // Welcome message (first message displayed).
  var welcomeMessage = "Currently there are no active message channels. Use the textcard below to start chatting!";
  // Last recorded message.
  var message = "";
  // Flag to clear content or not on incoming message.
  var clearContent = true;
  var myField = "";

  // Initialize listeners for container objects.
  for(var container of containers) {
    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("drop", drop);
  }

  // Setup WebSocket.
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // If browser doesn"t support WebSocket, notify and exit.
  if (!window.WebSocket) {
    content.html($("<p>",
      { text:"Sorry, but your browser doesn\'t support WebSocket."}
    ));
    input.hide();
    $("span").hide();
    return;
  }

  // Open the connection to the server.
  var connection = new WebSocket("ws://" + serverIP + ":" + socketPort);

  /* 
   * Functionality for a user that just joined.
   */ 
  connection.onopen = function () {
    // Send handshake to server.
    connection.send("Handshake");

    // Show welcome message.
    message = prepareMessage("Server", welcomeMessage, new Date());
    content.html(message);
    status.text("");
    input.removeAttr("disabled");
  };

  /*
   * Functionality when server returns an error.
   * @param error, the error from the server.
   */
  connection.onerror = function (error) {
    console.log("Error: " + error);
    status.text("Error: There\'s a problem with your connection or the server is down.);");
    content.text("");
    input.hide();
  };

  /*
   * Functionality when receiving a message.
   * @param message, the JSON message received.
   */
  connection.onmessage = function (message) {
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log("Invalid JSON ERROR: ", message.data);
      return;
    }

    // Clear content.
    if(clearContent) {
      content.html("");
      clearContent = false;
    }

    // Name assignment.
    if (json.type === "name") {
      var text = json.data.text;
      if (myName === false) {
        var message = text.replace(" joined the server!", "");
        text = "Welcome to the server! Your username is: " + message + ".";
        userName = message;
        myName = true;
      }
      message = prepareMessage("Server", text, new Date(json.data.time));
      stackMessage(message);

      status.text("");
      input.removeAttr("disabled");
    }

    // Update to a field.
    else if (json.type === "field") {
      // Write field to screen.
      configureField(json.data.player, json.data.field);
    }

    // Single message.
    else if (json.type === "message") {
      message = prepareMessage(json.data.author, json.data.text, new Date(json.data.time));
      stackMessage(message);
      status.text("");
      input.removeAttr("disabled");
    }

    // Entire message history.
    else if (json.type === "history") {
      for (var i = json.data.length - 1; i > 0; i--) {
        message = prepareMessage(json.data[i].author, json.data[i].text, new Date(json.data[i].time));
        addMessage(message);
      }
      status.text("");
      input.removeAttr("disabled");
    }

    // Other type of content.
    else {
      console.log("JSON Type ERROR: ", json);
      content.text("");
      status.text("Error: Encountered error in JSON.");
      input.removeAttr("disabled");
    }
  };

  /*
   * Send message when user presses Enter key.
   * @param e, the key code pressed.
   */
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }

      // Send the message as text.
      connection.send(msg);
      $(this).val("");

      // Disable the input field and wait for response of server.
      input.attr("disabled", "disabled");
    }
  });

  /* 
   * Notify user if a connection is unable to be made within 3 seconds.
   */
  setInterval(function() {
    if (connection.readyState !== 1) {
      content.text("");
      status.text("Error: Request timed out, unable to communicate with the WebSocket server.");
      input.hide();
    }
  }, 3000);

  /* 
   * Add message to the chat window text.
   * @param message, the message text.
   */
  function addMessage(message) {
    content.html(content.html() + message);
  }

  /* 
   * Stack message on top of the chat window text.
   * @param message, the message text.
   */
  function stackMessage(message) {
    content.html(message + content.html());
  }

  /* 
   * Prepare message to add to the chat window.
   * @param author, the author of the message.
   * @param message, the message text.
   * @param dt, the time of the message.
   */
  function prepareMessage(author, message, dt) {
    return(
        "(@" + (dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
        ":" + (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) +
        ") " +
        wrapMessage(message, author) + "<br>");
  }

  /* 
   * Return a message wrapped by the global header and footer strings.
   * @param message, the message to be wrapped.
   * @param author, the author of the message.
   */
  function wrapMessage(message, author) {
    if(author === "Server") {
      return "<span style='color: #758fff'><b>" + author + "</b></span>: <b><em>" + message + "</em></b>";
    }
    else {
      return "<span style='color: #758fff'><b>" + author + "</b></span>: " + message;
    }
  }

  /*
   * Provide dragover callback.
   */
  function dragover(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  /*
   * Provide dragenter callback.
   */
  function dragenter(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  /*
   * Provide drop callback.
   */
  function drop() {
    // Clear child nodes and find card again.
    card = document.getElementsByClassName("card")[0]; // TODO: add more cards...
    var parentNode = card.parentNode;
    while(parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }

    // Append the card node.
    this.append(card);

    try{
      // Store field data as JSON
      var field = {};
      for(var container of containers) {
        var child = container.childNodes[0];
        if(child != null) {
          console.log(child);
          field[container.id] = child.id;
        }
      }

      // Send updated JSON through WebSocket.
      var message = {};
      if(!this.id.includes("hand")) {
        message['position'] = this.id.replace("-", " ").replace("slot", "Slot");
        message['cardName'] = this.childNodes[0].id;
      }
      message['field'] = field;

      connection.send(JSON.stringify(message));
    } catch(e) {
      console.log('Error: ' + e);
    }
  }

  /*
   * Overwrite a field with new data.
   * @param player, the field to overwrite.
   * @param field, the data for the field.
   */
  function configureField(player, data) {
    try {
      for(var container of containers) {
        if(data[container.id] != null) {
          // Clear child nodes.
          while(container.firstChild) {
            container.removeChild(container.firstChild);
          }

          // Create base card div.
          var card = document.createElement("div");
          card.setAttribute("class", "card");
          card.setAttribute("id", data[container.id]);
          card.setAttribute("draggable", "true");

          // Create child for image.
          var img = document.createElement("img");
          img.setAttribute("src", "");
          img.setAttribute("id", "playing-card");

          // Build tree.
          card.appendChild(img);
          container.appendChild(card);

          console.log(container);
        }
        else {
          // Clear child nodes.
          while(container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }
      }
    } catch(e) {
      console.log('Error: ' + e);
    }
  }
});
