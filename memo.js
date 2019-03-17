$(function () {
  "use strict";

  // To avoid searching in DOM.
  var content = $("#chat-history");
  var input = $("#input-field-bar");
  var status = $("#status");

  // IP address of the server.
  var serverIP = "54.174.152.202";
  // Port of the socket.
  var socketPort = "1337";
  // Last messages stored.
  var lastMessages = [];

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // If browser doesn't support WebSocket, notify and exit.
  if (!window.WebSocket) {
    content.text(wrapMessage("Sorry, but your browser doesn\'t support WebSocket.", "Server"));
    input.hide();
    return;
  }

  // Open the connection to the server.
  var connection = new WebSocket("ws://" + serverIP + ":" + socketPort);

  /* 
   * Functionality for a user that just joined.
   */ 
  connection.onopen = function () {
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

    // Last 3 messages from history.
    if(json.type === "history") {
      // Clear previous messages.
      content.html("");

      // Load messages.
      var offset = 3;
      if(json.data.length < 3) {
        offset = json.data.length;
      }
      for(var i = json.data.length - offset; i < json.data.length; i++) {
        if(i < 0) {
          continue;
        }
        lastMessages[i - (json.data.length - offset)] = prepareMessage(json.data[i].author, json.data[i].text, new Date(json.data[i].time));
      }
      if(lastMessages.length < 3 && lastMessages.length > 0) {
        if(lastMessages.length === 1) {
          addMessage(lastMessages[0] + "<br>");
        }
        else {
          message = "<span id='opacity-level-2'>" +
              lastMessages[0] + "</span><br>";
          addMessage(message);
          addMessage(lastMessages[1] + "<br>");
        }
      }
      else {
        for(var i = 0; i < lastMessages.length - 1; i++) {
          message = "<span id='opacity-level-" + (i + offset) + "'>" +
              lastMessages[i] + "</span><br>";
          addMessage(message);
        }
        if(lastMessages.length > 0) {
          addMessage(lastMessages[lastMessages.length - 1] + "<br>");
        }
      }
      status.text("");
      input.removeAttr("disabled");
    }

    // Single message.
    else if(json.type === "message") {
      // Clear previous messages.
      content.html("");

      // Load messages.
      if(lastMessages.length < 3) {
        if(lastMessages.length === 1) {
          addMessage(lastMessages[0] + "<br>");
        }
        else {
          message = "<span id='opacity-level-2'>" +
              lastMessages[0] + "</span><br>";
          addMessage(message);
          addMessage(lastMessages[1] + "<br>");
        }
      }
      else {
        for(var i = 1; i < lastMessages.length; i++) {
          if(i > 2) {
            break;
          }
          message = "<span id='opacity-level-" + i + "'>" +
              lastMessages[i] + "</span><br>";
          addMessage(message);
        }
        // Erase first message from lastMessages.
        for(var i = 1; i < lastMessages.length; i++) {
          if(i > 2) {
            break;
          }
          lastMessages[i - 1] = lastMessages[i];
        }
      }

      // Store new message.
      lastMessages[lastMessages.length - 1] = prepareMessage(json.data.author, json.data.text, new Date(json.data.time));

      // Add new message.
      addMessage(lastMessages[lastMessages.length - 1] + "<br>");

      status.text("");
      input.removeAttr("disabled");
    }
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
      status.text("Error: Unable to communicate with the WebSocket server.");
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
    return "<span style='color: #758fff'>" + author + "</span>: <em>" + message + "</em>";
  }
});
