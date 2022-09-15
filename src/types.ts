export interface DragModel {
    isDragging: boolean,
    isMouseDown: boolean,
    mouseEvent: MouseEvent | null,
  }

  export type onDragStartFunction = (e: MouseEvent, originalMouseDownEvent: MouseEvent) =>void;
  export type onDragEndFunction = (e: MouseEvent, originalMouseDownEvent: MouseEvent) =>void;
  export type onDraggingFunction = (e: MouseEvent, originalMouseDownEvent: MouseEvent) =>void;