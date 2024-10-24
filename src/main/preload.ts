// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';

import type { AppState } from './store/types';

export type Channels = 'ipc-example' | string; // Allow any string for more channels

const electronHandler = {
  ipcRenderer: {
    // Allow sendMessage to handle any channel
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    // Allow on to handle any channel
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    // Allow once to handle any channel
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    // Expose the send method directly for flexibility
    send: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
  },
  // Add window controls
  windowControls: {
    minimize: () => ipcRenderer.invoke('minimize-window'),
    maximize: () => ipcRenderer.invoke('maximize-window'),
    close: () => ipcRenderer.invoke('close-window'),
  },
};

// Initialize Zutron bridge
const { handlers } = preloadZustandBridge<AppState>(ipcRenderer);

// Expose both electron and zutron handlers
contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('zutron', handlers);

export type ElectronHandler = typeof electronHandler;