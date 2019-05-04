$(function () {
  "use strict";

  // Global vaiables
  var card = null; // Placeholder.
  var containers = $(".container");
  var content = $("#chat-history");
  var input = $("#input-field-bar");
  var status = $("#status");
  var fieldSelect = $("#field-select")[0];
  var deck = [ "card-1c", "card-2c",  "card-3c", "card-4c", "card-5c", "card-6c", "card-7c", "card-8c", "card-9c", "card-10c", "card-jc", "card-qc", "card-kc",
      "card-1d", "card-2d",  "card-3d", "card-4d", "card-5d", "card-6d", "card-7d", "card-8d", "card-9d", "card-10d", "card-jd", "card-qd", "card-kd",
      "card-1h", "card-2h",  "card-3h", "card-4h", "card-5h", "card-6h", "card-7h", "card-8h", "card-9h", "card-10h", "card-jh", "card-qh", "card-kh",
      "card-1s", "card-2s",  "card-3s", "card-4s", "card-5s", "card-6s", "card-7s", "card-8s", "card-9s", "card-10s", "card-js", "card-qs", "card-ks"];
  deck.sort(function(a,b) { return Math.random() > 0.5; } );
  var drawIndex = 0;
  var drawCount = 52;
  var discardCount = 0;

  // IP address of the server.
  var serverIP = "wharris2-multi-socket.myuccs.net";
  // Port of the socket.
  var socketPort = 9000;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      socketPort = xhttp.responseText;
    }
  };
  xhttp.open("GET", "http://" + serverIP + "/socket.dat", false);
  xhttp.send();
  // Name flag and username sent.
  var myName = false;
  var userName = "Unknown";
  // Welcome message (first message displayed).
  var welcomeMessage = "Currently there are no active message channels. Use the textbox below to start chatting!";
  // Last recorded message.
  var message = "";
  // Flag to clear content or not on incoming message.
  var clearContent = true;
  // Field object.
  var fields = [];

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
  console.log("Set port: " + socketPort);

  // Add static listeners.
  fieldSelect.addEventListener("change", changeFieldOptions);

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
        text = "Welcome to the server! Your username is: " + message + ". To rename yourself, type 'My name is' followed by your name.";
        userName = message;
        initializeNewField(userName);
        loadField(userName);
        console.log("Loaded Field:");
        console.log(fields[userName]);
        fieldSelect.selectedIndex = 0;
        myName = true;

        // Replace name in header.
        document.getElementById("user-id").innerHTML = userName;

        // Display message.
        message = prepareMessage("Server", text, new Date(json.data.time));
        stackMessage(message);
      }
      else {
        if(text.includes(" changed their name to ")) {
          // Handled via history, which is sent at the same time.
        }
        else {
          var player = text.replace(" joined the server!", "");

          // Initialize new field for the joined player.
          if(text.includes(" joined the server!") && player != userName) {
            initializeNewField(player);

            // Send player's field data to the joined player.
            console.log("Sending field!");
            message = JSON.stringify({ field: fields[userName], player: userName });
            connection.send(message);

            // Display message.
            message = prepareMessage("Server", text, new Date(json.data.time));
            stackMessage(message);
          }
        }
      }

      /*Display message.
      message = prepareMessage("Server", text, new Date(json.data.time));
      stackMessage(message);*/

      status.text("");
      input.removeAttr("disabled");
    }

    // Update to a field.
    else if (json.type === "field") {
      console.log(json.data.field)
      configureField(json.data.player, json.data.field);

      // Load the field to the screen if it's currently being viewed.
      var i, option;
      for(i = 0; i < fieldSelect.length; i++) {
        option = fieldSelect[i];
        if (option.selected && option.value == json.data.player) {
          loadField(option.value);
        }
      }
    }

    // Single message.
    else if (json.type === "message") {
      // Don't write messages that are name assignments.
      if(!json.data.text.includes("My name is")) {
        message = prepareMessage(json.data.author, json.data.text, new Date(json.data.time));
        stackMessage(message);
        status.text("");
        input.removeAttr("disabled");
      }
    }

    // Entire message history.
    else if (json.type === "history") {
      // Clear current history.
      content.html("");
      var i;
      for(i = fieldSelect.options.length - 1 ; i >= 0 ; i--)
      {
        if(!fieldSelect.options[i].text.includes("Your Field")) {
          fieldSelect.remove(i);
        }
      }
      fieldSelect.selectedIndex = 0;
      loadField(userName);

      for (i = json.data.length - 1; i >= 0; i--) {
        var text = json.data[i].text;
        if(text.includes(" changed their name to ")) {
          var filteredName = text.replace("<span style='color: #758fff'><b>", "").replace("</b></span>: ", "").replace("<b><em>", "").replace("</em></b>", "").replace(/^\s+|\s+$/g, "").replace("Server", "");
          console.log("Filtered name: " + filteredName);
          var parsedName = filteredName.split(" changed their name to ");
          var newName = parsedName[parsedName.length - 1];
          var oldName = parsedName[0];
          updateFieldName(oldName, newName);

          if(oldName === userName) {
            // Replace name in header.
            document.getElementById("user-id").innerHTML = newName;
            userName = newName;
          }
        }
        else if(text.includes(" joined the server!")) {
          var player = text.replace(" joined the server!", "");

          // Initialize a new field for the joined player.
          if(player != userName) {
            initializeNewField(player);
          }
        }

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
   * Changes field options shown in field selector
   */
  function changeFieldOptions() {
    var i, option;
    for(i = 0; i < fieldSelect.length; i++) {
      option = fieldSelect[i];
      if (option.selected) {
        loadField(option.value);
      }
    }
  }

  /* 
   * Provide click callback for draw pile.
   */
  function click() {
    console.log(this.id);
    if(this.id == "draw") {
      // If there is no card to draw, return without changing anything.
      if(document.getElementById("draw").childNodes[0] == null) {
        return;
      }

      // Create base card div.
      var newCard = document.createElement("div");
      newCard.setAttribute("class", "card");
      newCard.setAttribute("id", "card");
      newCard.setAttribute("draggable", "true");

      // Create child for image.
      var img = document.createElement("img");
      img.setAttribute("id", deck[52 - drawCount]);
      img.setAttribute("src", "");

      // Build tree.
      newCard.appendChild(img);

      // Find the first empty hand slot and add the card.
      var found = false;
      var handContainers = $("div[id*='hand']");
      for(var container of handContainers) {
        if(!container.firstChild) {
          container.appendChild(newCard);
          found = true;
          break;
        }
      }

      // If no spot exists, return without changing anything.
      if(!found) {
        return;
      }

      drawCount -= 1;

      try{
        // Store field data as JSON
        var field = {};
        var child;
        for(var container of containers) {
          // Process child (the card image parent).
          child = container.childNodes[0];
          if(child != null) {
            var entry = {};
            if(container.id == "discard") {
              entry['count'] = discardCount;
            }
            else if(container.id == "draw") {
              if(drawCount < 0) {
                entry['count'] = 0;
              }
              else {
                entry['count'] = drawCount;
              }
            }

            // Process grandchild (the card image).
            child = child.childNodes[0];
            if(child != null) {
              entry['id'] = child.id;
              field[container.id] = entry;
            }
          }
        }
        fields[userName] = field;

        // Send updated JSON through WebSocket.
        var message = {};
        if(!this.id.includes("hand")) {
          message['position'] = this.id.replace("-", " ").replace("slot", "Mat Slot");
          message['cardName'] = deck[52 - drawCount + 1];
        }
        else {
          message['position'] = this.id.replace("-", " ").replace("hand", "Hand Slot");
          message['cardName'] = "card-blank";
        }
        message['field'] = field;
        message['player'] = userName;

        connection.send(JSON.stringify(message));
      } catch(e) {
        console.log('Error: ' + e);
      }
    }
    // Discard the card.
    else if(this.id != "discard") {
      // If there is no card to discard, return without changing anything.
      if(this.childNodes[0] == null) {
        return;
      }
      card = this.childNodes[0];

      // Create base card div.
      var newCard = document.createElement("div");
      newCard.setAttribute("class", "card");
      newCard.setAttribute("id", "card");
      newCard.setAttribute("draggable", "true");

      // Create child for image.
      var img = document.createElement("img");
      img.setAttribute("id", card.childNodes[0].id);
      img.setAttribute("src", "");

      // Build tree.
      newCard.appendChild(img);

      // Discard the card.
      var discardContainer = document.getElementById("discard");

      // Clear all descendents of card's parent.
      while(discardContainer.firstChild) {
        discardContainer.removeChild(discardContainer.firstChild);
      }

      // Clear all descendents of slot.
      while(this.firstChild) {
        this.removeChild(this.firstChild);
      }

      // Append card.
      discardContainer.appendChild(newCard);
      discardCount += 1;
      console.log("Appended card!");

      try{
        // Store field data as JSON
        var field = {};
        var child;
        for(var container of containers) {
          // Process child (the card image parent).
          child = container.childNodes[0];
          if(child != null) {
            var entry = {};
            if(container.id == "discard") {
              entry['count'] = discardCount;
            }
            else if(container.id == "draw") {
              entry['count'] = drawCount;
            }

            // Process grandchild (the card image).
            child = child.childNodes[0];
            if(child != null) {
              entry['id'] = child.id;
              field[container.id] = entry;
            }
          }
        }
        fields[userName] = field;

        // Send updated JSON through WebSocket.
        var message = {};
        message['position'] = "discard";
        message['cardName'] = parseCardName(card.childNodes[0].id);
        message['field'] = field;
        message['player'] = userName;

        connection.send(JSON.stringify(message));
      } catch(e) {
        console.log('Error: ' + e);
      }
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
    if(e.target.parentNode.id == "container-parent") {
      e.target.parentNode.style.background = "#24282c";
    }
  }

  /*
   * Provide dragenter callback.
   */
  function dragleave(e) {
    e.preventDefault();
    e.stopPropagation();
    if(e.target.parentNode.id == "container-parent") {
      e.target.parentNode.style.background = "";
    }
  }

  /*
   * Provide dragstart callback.
   */
  function dragstart(e) {
    card = document.getElementById(e.target.id);
    console.log(card.id);
    card = card.parentNode;
  }

  /*
   * Provide dragend callback.
   */
  function dragend(e) {
    card = null;
    if(e.target.parentNode.parentNode.parentNode.id == "container-parent") {
      e.target.parentNode.parentNode.parentNode.style.background = "";
    }
  }
  
  /*
   * Provide drop callback.
   */
  function drop() {
    for(var container of containers) {
      // Ensure background was changed back.
      container.parentNode.style.background = "";
    }

    // Return without changing anything if the discard or draw piles are dragged from.
    if(card == null || card.parentNode == null) {
      return;
    }
    var parentNode = card.parentNode;

    // Clear all descendents of card's parent.
    while(this.firstChild) {
      this.removeChild(this.firstChild);
    }

    // Append the card node as new child.
    this.append(card);

    try{
      // Store field data as JSON
      var field = {};
      var child;
      console.log(parentNode.id);
      for(var container of containers) {
        // Process child (the card image parent).
        child = container.childNodes[0];
        if(child != null) {
          var entry = {};
          if(container.id == "discard") {
            if(this.id == "discard") {
              discardCount++;
            }
            entry['count'] = discardCount;
          }
          else if(container.id == "draw") {
            entry['count'] = drawCount;
          }

          // Process grandchild (the card image).
          child = child.childNodes[0];
          if(child != null) {
            entry['id'] = child.id;
            field[container.id] = entry;
          }
        }
      }
      fields[userName] = field;
      console.log(field);

      // Send updated JSON through WebSocket.
      var message = {};
      if(!this.id.includes("hand")) {
        message['position'] = this.id.replace("-", " ").replace("slot", "Mat Slot");
        message['cardName'] = parseCardName(this.childNodes[0].childNodes[0].id);
      }
      else {
        message['position'] = this.id.replace("-", " ").replace("hand", "Hand Slot");
        message['cardName'] = parseCardName("");
      }
      message['field'] = field;
      message['player'] = userName;

      connection.send(JSON.stringify(message));
    } catch(e) {
      console.log('Error: ' + e);
    }
  }

  function parseCardName(cardName) {
    if(cardName == "") {
      return "a card";
    }
    if(cardName == "card-1c") {
      return "\"Ace of Clubs\"";
    }
    if(cardName == "card-1d") {
      return "\"Ace of Diamonds\"";
    }
    if(cardName == "card-1h") {
      return "\"Ace of Hearts\"";
    }
    if(cardName == "card-1s") {
      return "\"Ace of Spades\"";
    }
    return cardName.replace("card-", "\"")
                   .replace("c", " of Club")
                   .replace("d", " of Diamond")
                   .replace("h", " of Heart")
                   .replace("s", " of Spade")
                   .replace("k", "King")
                   .replace("j", "Jack")
                   .replace("q", "Queen")
                   + "s\"";
  }

  /*
   * Load field information to screen
   * @param player, the indexed player for the field that should be loaded.
   */
  function loadField(player) {
    var field = fields[player];
    for(var container of containers) {
      // Reset draw and discard counts.
      if(container.id == "discard") {
        document.getElementById("discard-count").innerHTML = "(0)";
      }
      else if(container.id == "draw") {
        document.getElementById("draw-count").innerHTML = "(0)";
      }

      // Initialize listeners if the field is yours.
      if(player != userName) { // Remove all interaction.
        container.removeEventListener("click", click);
        container.removeEventListener("dragover", dragover);
        container.removeEventListener("dragenter", dragenter);
        container.removeEventListener("dragleave", dragleave);
        container.removeEventListener("dragstart", dragstart);
        container.removeEventListener("dragend", dragend);
        container.removeEventListener("drop", drop);
      }
      else if(container.id == "discard") { // Only drag into.
        container.removeEventListener("click", click);
        container.addEventListener("dragover", dragover);
        container.addEventListener("dragenter", dragenter);
        container.addEventListener("dragleave", dragleave);
        container.removeEventListener("dragstart", dragstart);
        container.addEventListener("dragend", dragend);
        container.addEventListener("drop", drop);
      }
      else if(container.id == "draw") { // TODO: Only click.
        container.addEventListener("click", click);
        container.removeEventListener("dragover", dragover);
        container.removeEventListener("dragenter", dragenter);
        container.removeEventListener("dragleave", dragleave);
        container.removeEventListener("dragstart", dragstart);
        container.removeEventListener("dragend", dragend);
        container.removeEventListener("drop", drop);
      }
      else { // All.
        container.addEventListener("click", click);
        container.addEventListener("dragover", dragover);
        container.addEventListener("dragenter", dragenter);
        container.addEventListener("dragleave", dragleave);
        container.addEventListener("dragstart", dragstart);
        container.addEventListener("dragend", dragend);
        container.addEventListener("drop", drop);
      }

      if(field != null && field[container.id] != null) {
        // Clear all descendents of card's parent.
        while(container.firstChild) {
          container.removeChild(container.firstChild);
        }

        // Check if the deck card should not be recreated.
        if(container.id == "draw" && field[container.id]['count'] <= 0) {
          continue;
        }

        // Create base card div.
        var entry = document.createElement("div");
        entry.setAttribute("class", "card");
        entry.setAttribute("id", "card");
        entry.setAttribute("draggable", "true");

        // Create child for image.
        var img = document.createElement("img");
        if(player != userName && container.id.includes("hand")) {
          img.setAttribute("id", "card-blank");
        }
        else {
          img.setAttribute("id", field[container.id]['id']);
        }
        img.setAttribute("src", "");

        // Build tree.
        entry.appendChild(img);
        container.appendChild(entry);

        // Find label and possibly update it.
        if(container.id == "discard") {
          document.getElementById("discard-count").innerHTML = "(" + field[container.id]['count'] + ")";
        }
        else if(container.id == "draw") {
          document.getElementById("draw-count").innerHTML = "(" + field[container.id]['count'] + ")";
        }
      }
      else {
        // Clear child nodes.
        while(container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    }
  }

  /*
   * Overwrite a field with new data.
   * @param player, index of the field to overwrite.
   * @param field, the data for the field.
   */
  function configureField(player, data) {
    var field = {};
    try {
      for(var container of containers) {
        if(data[container.id] != null) {
          field[container.id] = data[container.id];
        }
      }
    } catch(e) {
      console.log('Error: ' + e);
    }
    
    fields[player] = field;
    console.log(fields);
  }

  /*
   * Replace the name of a player of a field.
   * @param player, index of the field to overwrite.
   * @param newName, the new name to use.
   */
  function updateFieldName(oldName, newName) {
    var field = fields[oldName];
    fields[newName] = field;

    var i, option;
    for(i = 0; i < fieldSelect.length; i++) {
      option = fieldSelect[i];
      if (oldName == userName) {
        option.value = newName;
      }
      else if (option.value == oldName) {
        option.value = newName;
        option.text = newName + "'s Field";
      }
    }
  }

  /*
   * Initialize field data for a given player index.
   * @param player, index of the field to overwrite.
   */
  function initializeNewField(player) {
    var field = {};
    var entry = { id: 'card-blank', count: drawCount };
    field['draw'] = entry;
    fields[player] = field;

    // Update field selection.
    var option = document.createElement("option");
    if(player === userName) {
      option.text += "Your Field";
    }
    else {
      option.text += player + "'s Field";
    }
    option.value = player;
    if(player === userName) {
      // Prepend option.
      fieldSelect.options.add(option, fieldSelect.options[0]);
    }
    else {
      // Add option after first.
      fieldSelect.options.add(option, fieldSelect.options[1]);
    }
  }
});
