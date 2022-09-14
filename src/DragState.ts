import { Coordinates, DragListeners, DragOptions, DropListeners as DropZoneListeners, DropZoneOptions } from "./dndLaforce.types";


export class DragState {
    public Options: DragOptions;

    private _isMouseDown: boolean;
    private _isDragging: boolean;   
    private _mouseDownEvent: MouseEvent | null;
    private _dragListeners: DragListeners | null;
    private _dropZoneListeners: DropZoneListeners | null;
    private _deltaCoordinates: Coordinates; 
    private _floatingElement: HTMLElement | null; 

    private _dropZoneSelector: string | null; 
    private _dropZoneElements: HTMLElement[]| null; 
    private _collidingDropZoneElements: HTMLElement[]; 

    constructor(options:DragOptions) {
        this._isMouseDown = false;
        this._isDragging = false;
        this._mouseDownEvent = null;
        this._dragListeners = null;
        this._dropZoneListeners = null;
        this._floatingElement = null;

        this._dropZoneSelector = null;
        this._dropZoneElements = null;
        this._collidingDropZoneElements = [];

        this.Options = options;
        this._deltaCoordinates = {
            X:0,
            Y:0
        }
        this.adddragListeners(this.Options.dragListeners || {});
    }

    public get isMouseDown(): boolean {
        return this._isMouseDown;
    }

    public get isDragging(): boolean {
        return this._isDragging;
    }

    public onMouseDownEvent(mouseEvent: MouseEvent) {
        this._isMouseDown = !!mouseEvent;
        this._mouseDownEvent = mouseEvent;
        if(!this._mouseDownEvent){
            return;
        }
 
        const draggingTarget = this._mouseDownEvent!.target as HTMLElement;
        this._deltaCoordinates.X = this._mouseDownEvent.pageX - draggingTarget.offsetLeft;
        this._deltaCoordinates.Y = this._mouseDownEvent.pageY - draggingTarget.offsetTop; 
    }

    public stopDragging(mouseEvent: MouseEvent) { 
        if (this._isDragging && typeof this._dragListeners?.onDragEnd === "function") {
            this._dragListeners.onDragEnd(mouseEvent, this._mouseDownEvent!); 
        }
        if (this._collidingDropZoneElements && typeof this._dropZoneListeners?.onDrop === "function") {
            const dropEvent = this._dropZoneListeners?.onDrop;
            this._collidingDropZoneElements.forEach(dropZone => {
                dropEvent(mouseEvent,this._mouseDownEvent?.target as HTMLElement, dropZone);
            });
        }
        this._isDragging = false;
        this._isMouseDown = false; 
        this._mouseDownEvent = null; 
        this._collidingDropZoneElements = [];
        this.removeFloatingElement(); 
    }

    private adddragListeners(dragListeners: DragListeners) {
        for (const key in dragListeners) {
            if (dragListeners.hasOwnProperty(key)) {
                if ((typeof dragListeners[key as keyof DragListeners] as any) !== "function") {
                    throw new Error(`${key} is not known`);
                }
            }
        }
        this._dragListeners = {
            ...dragListeners,
        };
    }

    private addDropZoneListeners(dropZoneListeners: DropZoneListeners) {
        for (const key in dropZoneListeners) {
            if (dropZoneListeners.hasOwnProperty(key)) {
                if ((typeof dropZoneListeners[key as keyof DropZoneListeners] as any) !== "function") {
                    throw new Error(`${key} is not known`);
                }
            }
        }
        this._dropZoneListeners = {
            ...dropZoneListeners,
        };
    }
 
    public isDraggingStarted(dragEvent: MouseEvent):boolean {
        if (!this._mouseDownEvent) {
            return false;
        }

        if (this._isDragging) {
            return this._isDragging;
        }

        const deltaX = Math.abs(dragEvent.clientX - this._mouseDownEvent.clientX);
        const deltaY = Math.abs(dragEvent.clientY - this._mouseDownEvent.clientY);
        this._isDragging = deltaX + deltaY >= 5;        
        if(this._isDragging){

            if(this._dropZoneSelector){
                this._dropZoneElements = Array.prototype.slice.call(document.querySelectorAll<HTMLElement>(this._dropZoneSelector));
            }            

            if (typeof this._dragListeners?.onDragStart === "function") {
                this._dragListeners.onDragStart(dragEvent, this._mouseDownEvent);
            }
        }
        return this._isDragging;
    }

    public onDragging(dragEvent: MouseEvent){
        switch (this.Options.mode) {
            case "copy":  
                this.copyElementToCursorPosition(dragEvent)              
                break;
            case "move":
                this.moveElementToCursorPosition(dragEvent);                
                break;
            default:
                console.error(this.Options.mode + " is a not supported dragging mode")
                break;
        }

       this.handleDropZone(dragEvent); 

        if (typeof this._dragListeners?.onDragging === "function") {
            this._dragListeners.onDragging(dragEvent, this._mouseDownEvent!);
        }
    }    

    public addDropZone(domSelector:string, options: DropZoneOptions){
        // this._dropZoneElements = Array.prototype.slice.call(elements);
        this._dropZoneSelector = domSelector;
        this.addDropZoneListeners(options.dropListeners || {});
    }


    private handleDropZone(dragEvent:MouseEvent){
        if(!this._dropZoneElements){            
            return;
        }      
        const collidingDropZoneElements = this.getCollidingDropZoneElements(dragEvent, this._dropZoneElements); 

        this._collidingDropZoneElements.forEach(element => {
            const existing = collidingDropZoneElements.find(item => item.isSameNode(element));
            if(!existing){
                this.onDropZoneLeave(dragEvent, element);   
            }
        });
        
        collidingDropZoneElements.forEach(element => {
            const existing = this._collidingDropZoneElements.find(item => item.isSameNode(element));
            if(!existing){
                this.onDropZoneEntered(dragEvent, element);                
            }
        });

        this._collidingDropZoneElements = collidingDropZoneElements;

    }

    private getCollidingDropZoneElements(dragEvent: MouseEvent, dropzoneElements: HTMLElement[]) : HTMLElement[] {       
       const result = dropzoneElements.filter(element => {
            const {left,top, bottom, right}= element.getBoundingClientRect(); 
            const x = left <= dragEvent.clientX && dragEvent.clientX <= right;
            const y = top <= dragEvent.clientY && dragEvent.clientY <= bottom; 
            return x && y;
        });
        return result; 
    }

    private copyElementToCursorPosition = (dragEvent: MouseEvent) => { 
        const draggingTarget = this._mouseDownEvent?.target as HTMLElement;
        this.removeFloatingElement();
        this._floatingElement = document.createElement("div");
        this._floatingElement.style.border = "5px solid black"
        this._floatingElement.style.position = "absolute"; 
        this._floatingElement.style.opacity = "0.5"; 
        this._floatingElement.style.left = `${dragEvent.clientX - this._deltaCoordinates.X}px`;
        this._floatingElement.style.top = `${dragEvent.clientY - this._deltaCoordinates.Y}px`

        this._floatingElement.innerHTML =draggingTarget.outerHTML;
        document.body.appendChild(this._floatingElement);
         
    }

    private moveElementToCursorPosition = (dragEvent: MouseEvent) => { 
        const draggingTarget = this._mouseDownEvent?.target as HTMLElement;
       
        draggingTarget.style.position = "absolute";
        draggingTarget.style.left = `${dragEvent.clientX - this._deltaCoordinates.X}px`;
        draggingTarget.style.top = `${dragEvent.clientY - this._deltaCoordinates.Y}px`
           
    }

    private removeFloatingElement(){
        if(this._floatingElement){
            document.body.removeChild(this._floatingElement);
            this._floatingElement = null;
        }
    }

    private onDropZoneLeave(dragEvent: MouseEvent, dropZone: HTMLElement){
        if (typeof this._dropZoneListeners?.onDropZoneLeave === "function") {
            this._dropZoneListeners?.onDropZoneLeave(dragEvent, this._mouseDownEvent!.target as HTMLElement,dropZone)
        }
    }

    private onDropZoneEntered(dragEvent: MouseEvent, dropZone: HTMLElement){
        if (typeof this._dropZoneListeners?.onDropZoneEntered === "function") {
            this._dropZoneListeners?.onDropZoneEntered(dragEvent, this._mouseDownEvent!.target as HTMLElement,dropZone)
        }
    }
// does not work all to well
    public chromiumBugFix(){
        if(!!(window as any)["chrome"]){
            // bug in chrome, where if you drag 1 element to place X
            // drag a second element to the same place that ends up behind the first element
            // without moving your mouse and restarting a mousedown event results in an error and the event runs on mouseup instead of down
            const element = this._mouseDownEvent!.target as HTMLElement;
            const parent = element.parentElement!; 
            parent.removeChild(element);
            parent.appendChild(element);
        } 
    }
}
