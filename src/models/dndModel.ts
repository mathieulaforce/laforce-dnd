import { DragListeners, DragOptions, DropOptions } from "../dndLaforce.types";
import { onDragEndFunction, onDraggingFunction, onDragStartFunction } from "../types";
import { DragModel } from "./dragModel";
import { DropModel, EmptyDropModel, IDropModel } from "./dropModel";

export class DnDModel {
    private _dragModel: DragModel;
    private _dropModel: IDropModel;
    private _dragElement: HTMLElement;

    constructor(dragElement: HTMLElement, dragOptions: DragOptions) {
        this._dragElement = dragElement;
        this._dropModel = new EmptyDropModel();
        const newOptions = {...dragOptions};
        newOptions.dragListeners =  this.addFunctionDecoratorsToDragEvents(newOptions.dragListeners);
        this._dragModel = new DragModel(dragElement, newOptions);
    }

    public stopDragging(mouseUpEvent: MouseEvent) {
        this._dragModel.stopDragging(mouseUpEvent);
    }

    public mouseMoved(mouseMovedEvent: MouseEvent) {
        this._dragModel.calculateDraggingElement(mouseMovedEvent);
        this._dragModel.onDragging(mouseMovedEvent);
    }

    public addDrop(dropSelector: string, dropOptions: DropOptions) {
        this._dropModel = new DropModel(dropSelector, dropOptions);
    }

    private addFunctionDecoratorsToDragEvents(dragListeners?: DragListeners | null): DragListeners { 
        if (!dragListeners) {
            throw new Error("could not extend drop listeners to drag listeners");
        } 

        return {
            onDragStart: this.registerDropElementsOnDragStartDecorator(dragListeners.onDragStart).bind(this), 
            onDragging: this.registerDraggingDecorator(dragListeners.onDragging).bind(this), 
            onDragEnd: this.registerDropElementOnDragEndDecorator(dragListeners.onDragEnd).bind(this),
        } 
    }

    private registerDropElementsOnDragStartDecorator(onDragStart?: onDragStartFunction): onDragStartFunction {
        return (e: MouseEvent, originalMouseDownEvent: MouseEvent) => {
            this._dropModel.openDropZones();
            if (typeof onDragStart === "function") {
                onDragStart(e, originalMouseDownEvent)
            }
        }
    }

    private registerDraggingDecorator(onDragging?: onDraggingFunction): onDraggingFunction {
        return (e: MouseEvent, originalMouseDownEvent: MouseEvent) => {
            this._dropModel.handleDropZoneCollisions(e, this._dragElement);
            if (typeof onDragging === "function") {
                onDragging(e, originalMouseDownEvent)
            }
        }
    }

    private registerDropElementOnDragEndDecorator(onDragEnd?: onDragEndFunction): onDragEndFunction {
        return (e: MouseEvent, originalMouseDownEvent: MouseEvent) => { 
            if (typeof onDragEnd === "function") { 
                onDragEnd(e, originalMouseDownEvent)
            } 
            this._dropModel.tryDropOnCurrentCursorLocation(e, this._dragElement);
        }
    }
}