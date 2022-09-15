import { onDragEndFunction, onDraggingFunction, onDragStartFunction } from "./types";

export interface DragListeners{
    onDragStart?: onDragStartFunction;
    onDragEnd?: onDragEndFunction;
    onDragging?:onDraggingFunction;
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

export const initialDropZoneOptions : DropOptions = { 
    dropListeners: null
}
export interface DropOptions{
    dropListeners: DropListeners | null;
}
