import { DragOptions, DropOptions as DropOptions, InitialDragOptions as initialDragOptions, initialDropZoneOptions as initialDropOptions } from "./dndLaforce.types"; 
import { DnDModel } from "./models/dndModel";

const dndModels: DnDModel[] = [];

const mouseUpDragHandler = (e: MouseEvent) => {
    dndModels.forEach(dnd => {
        dnd.stopDragging(e);
    });
}

const mouseMoveDragHandler = (e: MouseEvent) => {
    dndModels.forEach(dnd => {
        dnd.mouseMoved(e);
    }); 
}

const dropBuilder = (domSelector: string, options?: DropOptions | null) => {
    const actualOptions = Object.assign(initialDropOptions, options);
    dndModels.forEach(model => model.addDrop(domSelector, actualOptions))
}
 
const dragBuilder = (domSelector: string, options?: DragOptions | null) => {
    const elements = document.querySelectorAll<HTMLElement>(domSelector);
    const actualOptions = Object.assign(initialDragOptions, options); 
    elements.forEach(element => { 
        const dndModel = new DnDModel(element, actualOptions);
        dndModels.push(dndModel);
    }); 

    return {
        drop: dropBuilder
    }
}
 
const initialize = () => {
    document.addEventListener("mouseup", mouseUpDragHandler);
    document.addEventListener("mousemove", mouseMoveDragHandler);
}

initialize();

export const Laforce = {
    drag: dragBuilder
};