export interface DragListeners{
    onDragStart?: (e: MouseEvent, originalMouseDownEvent: MouseEvent) => void;
    onDragEnd?: (e: MouseEvent, originalMouseDownEvent: MouseEvent) => void;
    onDragging?: (dragEvent: MouseEvent, originalMouseDownEvent: MouseEvent) => void;
}

export interface DropListeners{
    onDropZoneEntered?: (e: MouseEvent, dragElement: HTMLElement, dropZone: HTMLElement) => void;
    onDropZoneLeave?: (e: MouseEvent, dragElement: HTMLElement, dropZone: HTMLElement) => void;    
    onDrop?: (e: MouseEvent, dragElement: HTMLElement, dropZone: HTMLElement) => void;    
}

export type DraggingMode = "move" | "copy";

export interface DragOptions{
    mode: DraggingMode;
    dragListeners: DragListeners | null;
}

export const InitialDragOptions : DragOptions = {
    mode: "move",
    dragListeners: null
}

export interface Coordinates {
    X: number;
    Y: number;
}

export const initialDropZoneOptions : DropZoneOptions = { 
    dropListeners: null
}
export interface DropZoneOptions{
    dropListeners: DropListeners | null;
}
