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
  // Color assigned by the server.
  var myColor = false;
  // Name sent to the server.
  var myName = false;

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
    input.removeAttr("disabled");
    status.text("Choose name:");
  };

  /*
   * Functionality when server returns an error.
   * @param error, the error from the server.
   */
  connection.onerror = function (error) {
    content.html($("<p>", {
      text: "Sorry, but there\'s some problem with your "
         + "connection or the server is down. Error: " + error
    }));
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

    // First response from server.
    if (json.type === "color") { 
      myColor = json.data;
      status.text(myName + ": ").css("color", myColor);
      input.removeAttr("disabled").focus();
    }
    // Entire message history.
    else if (json.type === "history") {
      for (var i = 0; i < json.data.length; i++) {
      addMessage(json.data[i].author, json.data[i].text,
          json.data[i].color, new Date(json.data[i].time));
      }
    }
    // Single message.
    else if (json.type === "message") {
      input.removeAttr("disabled"); 
      addMessage(json.data.author, json.data.text,
          json.data.color, new Date(json.data.time));
    }
    else {
      console.log("JSON Type ERROR: ", json);
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

      if (myName === false) {
        myName = msg;
      }
    }
  });

  /* 
   * Notify user if a connection is unable to be made within 3 seconds.
   */
  setInterval(function() {
    if (connection.readyState !== 1) {
      status.text("Error");
      input.attr("disabled", "disabled").val(
          "Unable to communicate with the WebSocket server.");
    }
  }, 3000);

  /* Add message to the chat window.
   * @param author, the author of the message.
   * @param message, the message text.
   * @param color, the message color.
   * @param dt, the time of the message.
   */
  function addMessage(author, message, color, dt) {
    content.prepend(
        "<p>" +
          "(" + (dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
          ":" + (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) +
          ") " +
          "<span style='color:" + color + "'>" + author + "</span>" +
          ": " + message +
        "</p>");
  }
});
