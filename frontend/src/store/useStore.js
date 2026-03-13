import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  roomCode: null,
  isBroadcaster: false,
  isConnected: false,
  syncData: {
    playbackTime: 0,
    isPlaying: false,
    latencyMs: 0,
    syncOffsetMs: 0,
    source: '',
  },
  
  // Actions
  setUser: (user) => set({ user }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setIsBroadcaster: (isBroadcaster) => set({ isBroadcaster }),
  setConnectionStatus: (status) => set({ isConnected: status }),
  updateSyncData: (data) => set((state) => ({ 
    syncData: { ...state.syncData, ...data } 
  })),
  resetRoomState: () => set({ 
    roomCode: null, 
    isBroadcaster: false, 
    syncData: { playbackTime: 0, isPlaying: false, latencyMs: 0, syncOffsetMs: 0, source: '' }
  })
}));

export default useStore;
