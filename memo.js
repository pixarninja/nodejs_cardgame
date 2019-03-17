$(function () {
  "use strict";

  // To avoid searching in DOM.
  var input = $("#input-field-bar");
  var status = $("#status");

  // IP address of the server.
  var serverIP = "54.174.152.202";
  // Port of the socket.
  var socketPort = "1337";

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // If browser doesn't support WebSocket, notify and exit.
  if (!window.WebSocket) {
    status.text("Sorry, but your browser doesn\'t support WebSocket.");
    input.attr("disabled", "disabled");
    input.placeholder = "Unable to display message.";
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
    input.attr("disabled", "disabled");
    input.placeholder = "Unable to display message.";
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

    if(json.type === "color") {
      // Don't need to handle this for memo.js.
      status.text("");
      input.removeAttr("disabled");
    }
    // Entire message history.
    else if(json.type === "history") {
      var i = json.data.length - 1;
      addMessage(json.data[i].author, json.data[i].text, json.data[i].color, new Date(json.data[i].time));
      status.text("");
      input.removeAttr("disabled");
    }
    // Single message.
    else if(json.type === "message") {
      addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
      status.text("");
      input.removeAttr("disabled");
    }
    else {
      console.log("JSON Type ERROR: ", json);
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
      status.text("Error: Unable to communicate with the WebSocket server.");
      input.attr("disabled", "disabled");
      input.placeholder = "Unable to display message.";
    }
  }, 3000);

  /* Add message to the chat window.
   * @param author, the author of the message.
   * @param message, the message text.
   * @param color, the message color.
   * @param dt, the time of the message.
   */
  function addMessage(author, message, color, dt) {
    console.log("addMessage() called!");
    document.getElementById("input-field-bar").placeholder =
        "(" + (dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
        ":" + (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) +
        ") " +
        author + ": " + message +
        "       (Use this textbox to reply or go to Chat)";
  }
});
