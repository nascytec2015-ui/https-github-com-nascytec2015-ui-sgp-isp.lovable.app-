import { createContext, useContext, useState } from "react";

type DragType = string | null;

interface DnDContextType {
  draggedType: DragType;
  setDraggedType: (type: DragType) => void;
}

const DnDContext = createContext<DnDContextType>({
  draggedType: null,
  setDraggedType: () => {},
});

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const [draggedType, setDraggedType] = useState<DragType>(null);

  return (
    <DnDContext.Provider
      value={{
        draggedType,
        setDraggedType,
      }}
    >
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  return useContext(DnDContext);
}
