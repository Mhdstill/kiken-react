declare module 'react-beautiful-dnd' {
  import { ComponentType, ReactNode } from 'react';

  export interface DraggableProvided {
    draggableProps: any;
    dragHandleProps: any;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
  }

  export interface DroppableProvided {
    droppableProps: any;
    innerRef: (element: HTMLElement | null) => void;
    placeholder?: ReactNode;
  }

  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    };
  }

  export const DragDropContext: ComponentType<{
    onDragEnd: (result: DropResult) => void;
    children: ReactNode;
  }>;

  export const Droppable: ComponentType<{
    droppableId: string;
    children: (provided: DroppableProvided) => ReactNode;
  }>;

  export const Draggable: ComponentType<{
    draggableId: string;
    index: number;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ReactNode;
  }>;
} 