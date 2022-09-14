import { DragOptions, DropZoneOptions, InitialDragOptions, initialDropZoneOptions } from "./dndLaforce.types";
import { DragState } from "./DragState";

const dragStates: DragState[] = [];

const mouseUpDragHandler = (e: MouseEvent) => {
    dragStates.filter(state => state.isMouseDown).map(state => state.stopDragging(e));
}

const mouseMoveDragHandler = (e: MouseEvent) => {
    dragStates.forEach(state => { 
        if (state.isDraggingStarted(e)) {
            state.onDragging(e); 
        }
    });
}


const DraggableBuilder = (elements: NodeListOf<HTMLElement>, dragState: DragState) => { 
    const addDropZone = DropZone; 
    const onMouseDown = (e: MouseEvent) => { 
        if (dragState.isDragging) {
            return;
        }
        dragState.onMouseDownEvent(e);
    }

    const registerEvents = () => {
        elements.forEach(element => {
            element.addEventListener("mousedown", onMouseDown);
        });
    }

    const initialize = () => {
        registerEvents();
    }

    initialize();

    return {
        addDropZone
    }
}

const initialize = () => {
    document.addEventListener("mouseup", mouseUpDragHandler);
    document.addEventListener("mousemove", mouseMoveDragHandler);
}

initialize();

export const Draggable = (domSelector: string, options?: DragOptions | null) => {
    const elements = document.querySelectorAll<HTMLElement>(domSelector);
    const actualOptions = Object.assign(InitialDragOptions, options);
    const dragState = new DragState(actualOptions);
    dragStates.push(dragState);

    return DraggableBuilder(elements, dragState);
}

const DropZone = (domSelector: string, options?: DropZoneOptions | null) => {
    const actualOptions = Object.assign(initialDropZoneOptions, options);
    dragStates.forEach(dragState => dragState.addDropZone(domSelector, actualOptions))
}