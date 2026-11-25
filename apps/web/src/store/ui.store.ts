import { create } from 'zustand';
import type { AgentRuntimeId, WsTaskEvent } from '@socratech/contracts';

interface UiState {
  preferredRuntime: AgentRuntimeId;
  setPreferredRuntime: (runtime: AgentRuntimeId) => void;
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
  events: WsTaskEvent[];
  pushEvent: (event: WsTaskEvent) => void;
}

export const useUiStore = create<UiState>((set) => ({
  preferredRuntime: 'codex-cli',
  setPreferredRuntime: (preferredRuntime) => set({ preferredRuntime }),
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected }),
  events: [],
  pushEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 30),
    })),
}));
