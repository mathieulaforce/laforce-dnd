import { Coordinates, DragOptions } from "../dndLaforce.types";

export class DragModel {
    private _options: DragOptions;
    private _isMouseDown: boolean;
    private _isDragging: boolean;
    private _mouseDownEvent: MouseEvent | null;
    private _deltaCoordinates: Coordinates;
    private _floatingElement: HTMLElement | null;
    private _dragElement: HTMLElement;

    constructor(dragElement: HTMLElement, options: DragOptions) {
        this._isMouseDown = false;
        this._isDragging = false;
        this._mouseDownEvent = null;
        this._deltaCoordinates = { X: 0, Y: 0 }
        this._floatingElement = null;

        this._dragElement = dragElement;
        this._options = options; 
        this.registerEvents()        
    }
  
    public get isMouseDown(): boolean {
        return this._isMouseDown;
    }

    public get isDragging(): boolean {
        return this._isDragging;
    }

    public onMouseDownEvent(mouseEvent: MouseEvent) {  
        if (this._isDragging) {
            return;
        }
           
        this._isMouseDown = !!mouseEvent;
        this._mouseDownEvent = mouseEvent;
        if (!this._mouseDownEvent) {
            return;
        }
 
        this._deltaCoordinates.X = this._mouseDownEvent.pageX - this._dragElement.offsetLeft;
        this._deltaCoordinates.Y = this._mouseDownEvent.pageY - this._dragElement.offsetTop;
    }

    public calculateDraggingElement(dragEvent: MouseEvent):boolean {
        if (!this._mouseDownEvent) {
            return false;
        }

        if (this._isDragging) {
            return this._isDragging;
        }

        const deltaX = Math.abs(dragEvent.clientX - this._mouseDownEvent.clientX);
        const deltaY = Math.abs(dragEvent.clientY - this._mouseDownEvent.clientY);
        this._isDragging = deltaX >= 5 && deltaY >= 5;        
        if(this._isDragging){             
            const onDragStart = this._options.dragListeners?.onDragStart;
            if (typeof onDragStart === "function") {                
                onDragStart(dragEvent, this._mouseDownEvent);
            }
        }
        return this._isDragging;
    }
 
    public onDragging(dragEvent: MouseEvent){
        if(!this.isDragging){
            return;
        }
        switch (this._options.mode) {
            case "copy":  
                this.copyElementToCursorPosition(dragEvent)              
                break;
            case "move":
                this.moveElementToCursorPosition(dragEvent);                
                break;
            default:
                console.error(this._options.mode + " is a not supported dragging mode")
                break;
        }
 
        const onDragging = this._options.dragListeners?.onDragging;
        if (typeof onDragging === "function") {
            onDragging(dragEvent, this._mouseDownEvent!);
        }
    } 

    public stopDragging(mouseEvent: MouseEvent) {
        const onDragEnd = this._options.dragListeners?.onDragEnd;
        if (this._isDragging && typeof onDragEnd === "function") {
            onDragEnd(mouseEvent, this._mouseDownEvent!);
        }
    
        this._isDragging = false;
        this._isMouseDown = false;
        this._mouseDownEvent = null;
        this.removeFloatingElement();
    }

    private removeFloatingElement(){
        if(this._floatingElement){
            document.body.removeChild(this._floatingElement);
            this._floatingElement = null;
        }
    }

    private copyElementToCursorPosition (dragEvent: MouseEvent) { 
         
        this.removeFloatingElement();
        this._floatingElement = document.createElement("div");
        this._floatingElement.style.border = "5px solid black"
        this._floatingElement.style.position = "absolute"; 
        this._floatingElement.style.opacity = "0.5"; 
        this._floatingElement.style.left = `${dragEvent.clientX - this._deltaCoordinates.X}px`;
        this._floatingElement.style.top = `${dragEvent.clientY - this._deltaCoordinates.Y}px`;

        this._floatingElement.innerHTML = this._dragElement.outerHTML;
        document.body.appendChild(this._floatingElement);
         
    }

    private moveElementToCursorPosition (dragEvent: MouseEvent) {  
        this._dragElement.style.position = "absolute";
        this._dragElement.style.left = `${dragEvent.clientX - this._deltaCoordinates.X}px`;
        this._dragElement.style.top = `${dragEvent.clientY - this._deltaCoordinates.Y}px`;
    }

    private registerEvents() {
        this._dragElement.addEventListener("mousedown",this.onMouseDownEvent.bind(this) )
    }
}