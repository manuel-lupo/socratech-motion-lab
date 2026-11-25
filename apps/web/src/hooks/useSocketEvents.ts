import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import type { WsTaskEvent } from '@socratech/contracts';
import { useUiStore } from '../store/ui.store';

export function useSocketEvents(): void {
  const queryClient = useQueryClient();
  const pushEvent = useUiStore((s) => s.pushEvent);
  const setWsConnected = useUiStore((s) => s.setWsConnected);

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_URL ?? '';
    const socket = io(`${wsBase}/ws`, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setWsConnected(true));
    socket.on('disconnect', () => setWsConnected(false));

    socket.on('socratech.event', (event: WsTaskEvent) => {
      pushEvent(event);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (event.projectId) {
        void queryClient.invalidateQueries({ queryKey: ['project', event.projectId] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [pushEvent, queryClient, setWsConnected]);
}
