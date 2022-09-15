import { Laforce } from "./dndLaforce";

Laforce.drag(".toolbox .box",{
  mode: "copy",
  dragListeners: {
    onDragStart: (e) => {
      console.log("start the drag sir ")
    },
    onDragging: (e) => {
      console.log("we are dragging")
    },
    onDragEnd: (e) => {
      console.log("stop the drag good sir");
    }
  }
})
.drop(".dropzone .box", {
  dropListeners: {
    onDropZoneLeave: (drag, dragElement, drop) => { 
      drop.classList.remove("green");
    },
    onDropZoneEntered: (drag, dragElement, drop) => { 
      drop.classList.add("green");
    },
    onDrop: (drag, dragElement, drop) => {
      drop.classList.remove("green");
      drop.classList.remove("blue");
      drop.classList.add("yellow");
      dragElement.classList.remove("red");
      dragElement.classList.add("yellow");
    },
  }
});
  