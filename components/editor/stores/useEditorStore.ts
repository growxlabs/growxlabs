import { create } from "zustand";
import { EditorDocument, EditorSlide, EditorLayer, EditorBootstrapResponse } from "@/types/editorContracts";
import { IEditorCommand, UpdateLayerPropertyCommand } from "../commands/editorCommands";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

interface EditorState {
  // Document data
  document: EditorDocument | null;
  slides: EditorSlide[];
  layersBySlide: Record<string, EditorLayer[]>;
  activeIndex: number;
  selectedElementKey: string | null;
  isFooterSelected: boolean;
  
  // Autosave & versioning
  version: number;
  autosaveStatus: AutosaveStatus;
  pendingOperations: any[];
  
  // Command stack for Undo/Redo
  undoStack: IEditorCommand[];
  redoStack: IEditorCommand[];
  
  // Actions
  loadBootstrap: (documentId: string) => Promise<void>;
  setActiveIndex: (index: number) => void;
  setSelectedElement: (key: string | null) => void;
  setIsFooterSelected: (val: boolean) => void;
  
  updateLayerProperty: (layerKey: string, updates: Record<string, any>) => void;
  updateFooter: (updates: Record<string, any>) => void;
  
  dispatchCommand: (cmd: IEditorCommand) => void;
  undo: () => void;
  redo: () => void;
  flushAutosave: () => Promise<void>;
}

let autosaveTimer: any = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  slides: [],
  layersBySlide: {},
  activeIndex: 0,
  selectedElementKey: null,
  isFooterSelected: false,

  version: 1,
  autosaveStatus: "idle",
  pendingOperations: [],

  undoStack: [],
  redoStack: [],

  loadBootstrap: async (documentId: string) => {
    try {
      set({ autosaveStatus: "saving" });
      const res = await fetch(`/api/v1/editor/documents/${documentId}/bootstrap`);
      const json = await res.json();
      
      if (json.data) {
        const bootstrap: EditorBootstrapResponse = json.data;
        set({
          document: bootstrap.document,
          slides: bootstrap.slides,
          layersBySlide: bootstrap.layersBySlide,
          version: bootstrap.latestVersion,
          autosaveStatus: "saved"
        });
      }
    } catch (err) {
      console.error("Failed to load bootstrap data:", err);
      set({ autosaveStatus: "error" });
    }
  },

  setActiveIndex: (index: number) => set({ activeIndex: index }),
  setSelectedElement: (key: string | null) => set({ selectedElementKey: key, isFooterSelected: false }),
  setIsFooterSelected: (val: boolean) => set({ isFooterSelected: val, selectedElementKey: null }),

  updateLayerProperty: (layerKey: string, updates: Record<string, any>) => {
    const { slides, activeIndex, layersBySlide } = get();
    const activeSlide = slides[activeIndex];
    if (!activeSlide) return;

    const layers = layersBySlide[activeSlide.id] || [];
    const targetLayer = layers.find((l) => l.layerType === layerKey);
    if (!targetLayer) return;

    const prevProps = { ...targetLayer.properties };
    const cmd = new UpdateLayerPropertyCommand(targetLayer.id, updates, prevProps);

    get().dispatchCommand(cmd);
  },

  updateFooter: (updates: Record<string, any>) => {
    const { slides, activeIndex, layersBySlide } = get();
    const activeSlide = slides[activeIndex];
    if (!activeSlide) return;

    const layers = layersBySlide[activeSlide.id] || [];
    const footerLayer = layers.find((l) => l.layerType === "footer");
    if (!footerLayer) return;

    const prevProps = { ...footerLayer.properties };
    const cmd = new UpdateLayerPropertyCommand(footerLayer.id, updates, prevProps);

    get().dispatchCommand(cmd);
  },

  dispatchCommand: (cmd: IEditorCommand) => {
    const op = cmd.execute();
    const { undoStack, pendingOperations, layersBySlide, slides, activeIndex } = get();
    const activeSlide = slides[activeIndex];

    // Optimistically update local layer properties
    if (activeSlide && op.entityId) {
      const currentLayers = layersBySlide[activeSlide.id] || [];
      const updatedLayers = currentLayers.map((l) => {
        if (l.id === op.entityId) {
          return {
            ...l,
            properties: { ...l.properties, ...(op.changes.properties || op.changes) },
            x: op.changes.x !== undefined ? op.changes.x : l.x,
            y: op.changes.y !== undefined ? op.changes.y : l.y,
            width: op.changes.width !== undefined ? op.changes.width : l.width,
            height: op.changes.height !== undefined ? op.changes.height : l.height,
            visible: op.changes.visible !== undefined ? op.changes.visible : l.visible,
            locked: op.changes.locked !== undefined ? op.changes.locked : l.locked
          };
        }
        return l;
      });

      set({
        layersBySlide: {
          ...layersBySlide,
          [activeSlide.id]: updatedLayers
        },
        undoStack: [cmd, ...undoStack],
        redoStack: [],
        pendingOperations: [...pendingOperations, op],
        autosaveStatus: "saving"
      });
    }

    // Schedule debounced backend autosave
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      get().flushAutosave();
    }, 600);
  },

  undo: () => {
    const { undoStack, redoStack, layersBySlide, slides, activeIndex } = get();
    if (undoStack.length === 0) return;

    const [cmdToUndo, ...remainingUndo] = undoStack;
    const inverseCmd = cmdToUndo.getInverse();
    const op = inverseCmd.execute();

    const activeSlide = slides[activeIndex];
    if (activeSlide && op.entityId) {
      const currentLayers = layersBySlide[activeSlide.id] || [];
      const updatedLayers = currentLayers.map((l) => {
        if (l.id === op.entityId) {
          return {
            ...l,
            properties: { ...l.properties, ...(op.changes.properties || op.changes) }
          };
        }
        return l;
      });

      set({
        layersBySlide: { ...layersBySlide, [activeSlide.id]: updatedLayers },
        undoStack: remainingUndo,
        redoStack: [cmdToUndo, ...redoStack],
        pendingOperations: [...get().pendingOperations, op],
        autosaveStatus: "saving"
      });
    }

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      get().flushAutosave();
    }, 600);
  },

  redo: () => {
    const { redoStack, undoStack, layersBySlide, slides, activeIndex } = get();
    if (redoStack.length === 0) return;

    const [cmdToRedo, ...remainingRedo] = redoStack;
    const op = cmdToRedo.execute();

    const activeSlide = slides[activeIndex];
    if (activeSlide && op.entityId) {
      const currentLayers = layersBySlide[activeSlide.id] || [];
      const updatedLayers = currentLayers.map((l) => {
        if (l.id === op.entityId) {
          return {
            ...l,
            properties: { ...l.properties, ...(op.changes.properties || op.changes) }
          };
        }
        return l;
      });

      set({
        layersBySlide: { ...layersBySlide, [activeSlide.id]: updatedLayers },
        undoStack: [cmdToRedo, ...undoStack],
        redoStack: remainingRedo,
        pendingOperations: [...get().pendingOperations, op],
        autosaveStatus: "saving"
      });
    }

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      get().flushAutosave();
    }, 600);
  },

  flushAutosave: async () => {
    const { document, version, pendingOperations } = get();
    if (!document || pendingOperations.length === 0) return;

    const opsToSave = [...pendingOperations];
    set({ pendingOperations: [] });

    try {
      const res = await fetch(`/api/v1/editor/documents/${document.id}/operations/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseVersion: version,
          operations: opsToSave
        })
      });

      if (res.status === 409) {
        set({ autosaveStatus: "conflict" });
        return;
      }

      if (!res.ok) {
        set({ autosaveStatus: "error" });
        return;
      }

      const json = await res.json();
      set({
        version: json.data.newVersion,
        autosaveStatus: "saved"
      });
    } catch (err) {
      console.error("Autosave flush failed:", err);
      set({ autosaveStatus: "error" });
    }
  }
}));
