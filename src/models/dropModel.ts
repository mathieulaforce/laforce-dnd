import { DropOptions } from "../dndLaforce.types";

export interface IDropModel {
    openDropZones: () => void;
    closeDropZones: () => void;
    handleDropZoneCollisions: (dragEvent: MouseEvent, dragElement: HTMLElement) => void;
    tryDropOnCurrentCursorLocation: (mouseUpEvent: MouseEvent, dragElement: HTMLElement) => void;
    get canDrop(): boolean
}

export class EmptyDropModel implements IDropModel {
    get canDrop() {
        return false;
    }
    public openDropZones() { }
    public closeDropZones() { }
    public handleDropZoneCollisions(dragEvent: MouseEvent, dragElement: HTMLElement) { }
    public tryDropOnCurrentCursorLocation(mouseUpEvent: MouseEvent, dragElement: HTMLElement) { }

}

export class DropModel implements IDropModel {
    private _dropSelector: string;
    private _options: DropOptions;

    private _dropZoneElements: HTMLElement[] | null;
    private _collidingDropZoneElements: HTMLElement[];

    constructor(dropSelector: string, dropOptions: DropOptions) {
        this._options = dropOptions;
        this._dropSelector = dropSelector;
        this._dropZoneElements = null;
        this._collidingDropZoneElements = [];
    }

    get canDrop() {
        return this._dropZoneElements !== null && this._dropZoneElements.length > 0;
    }

    public openDropZones() {
        const dropZones = document.querySelectorAll(this._dropSelector);
        this._dropZoneElements = Array.prototype.slice.call(dropZones)
    }

    public closeDropZones() {
        this._dropZoneElements = null;
    }

    public handleDropZoneCollisions(dragEvent: MouseEvent, dragElement: HTMLElement) {
        if (!this._dropZoneElements) {
            return;
        }
        const collidingDropZoneElements = this.getCollidingDropZoneElements(dragEvent, this._dropZoneElements);

        this._collidingDropZoneElements.forEach(dropZone => {
            const existing = collidingDropZoneElements.find(item => item.isSameNode(dropZone));
            if (!existing) {
                const onDropZoneLeave = this._options.dropListeners?.onDropZoneLeave;
                if (typeof onDropZoneLeave === "function") {
                    onDropZoneLeave(dragEvent, dragElement, dropZone)
                }
            }
        });

        collidingDropZoneElements.forEach(element => {
            const existing = this._collidingDropZoneElements.find(item => item.isSameNode(element));
            if (!existing) {
                const onDropZoneEntered = this._options.dropListeners?.onDropZoneEntered;
                if (typeof onDropZoneEntered === "function") {
                    onDropZoneEntered(dragEvent, dragElement, element)
                }
            }
        });

        this._collidingDropZoneElements = collidingDropZoneElements;
    }

    public tryDropOnCurrentCursorLocation(mouseUpEvent: MouseEvent, dragElement: HTMLElement) {
        const onDrop = this._options.dropListeners?.onDrop;
        if (this._collidingDropZoneElements && typeof onDrop === "function") {
            this._collidingDropZoneElements.forEach(dropZone => {
                onDrop(mouseUpEvent, dragElement, dropZone);
            });
        }

        this._collidingDropZoneElements = [];
    }

    private getCollidingDropZoneElements(dragEvent: MouseEvent, dropzoneElements: HTMLElement[]): HTMLElement[] {
        const result = dropzoneElements.filter(element => {
            const { left, top, bottom, right } = element.getBoundingClientRect();
            const x = left <= dragEvent.clientX && dragEvent.clientX <= right;
            const y = top <= dragEvent.clientY && dragEvent.clientY <= bottom;
            return x && y;
        });
        return result;
    }
}
