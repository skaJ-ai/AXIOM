import { create } from 'zustand';

interface CanvasStoreState {
  activeRightTab: string;
  dismissedGuidanceIds: string[];
  isResizing: boolean;
  panelWidth: number;
  dismissGuidance: (guidanceId: string) => void;
  setActiveRightTab: (tab: string) => void;
  setIsResizing: (isResizing: boolean) => void;
  setPanelWidth: (panelWidth: number) => void;
}

const DEFAULT_PANEL_WIDTH = 480;

const useCanvasStore = create<CanvasStoreState>((set) => ({
  activeRightTab: 'overview',
  dismissedGuidanceIds: [],
  isResizing: false,
  panelWidth: DEFAULT_PANEL_WIDTH,
  dismissGuidance: (guidanceId) =>
    set((state) => ({
      dismissedGuidanceIds: state.dismissedGuidanceIds.includes(guidanceId)
        ? state.dismissedGuidanceIds
        : [...state.dismissedGuidanceIds, guidanceId],
    })),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setIsResizing: (isResizing) => set({ isResizing }),
  setPanelWidth: (panelWidth) => set({ panelWidth }),
}));

export { DEFAULT_PANEL_WIDTH, useCanvasStore };
