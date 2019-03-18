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
  // Name sent to the server.
  var myName = false;
  // Welcome message (first message displayed).
  var welcomeMessage = "Currently there are no active message channels. Use the textbox below to start chatting!";
  // Last recorded message.
  var message = "";
  // Flag to clear content or not on incoming message.
  var clearContent = true;

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
      }
      message = prepareMessage("Server", text, new Date(json.data.time));
      stackMessage(message);

      status.text("");
      input.removeAttr("disabled");
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
});
