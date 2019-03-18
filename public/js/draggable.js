$(function() {
  "use strict";

  // Globals variables.
  var box = document.getElementsByClassName("box")[0];
  var containers = document.getElementsByClassName("container");

  for(var container of containers) {
    container.addEventListener("dragover", dragover);
    container.addEventListener("dragenter", dragenter);
    container.addEventListener("drop", drop);
  }

  function dragover(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function dragenter(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function drop() {
    this.append(box);
  }
});
