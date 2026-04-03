import { create } from 'zustand'
import type { SourceConfig, SiteBean, LiveGroup, HistoryItem, CollectItem, DriveConfig } from '@/types'
import { sourceStore, currentSourceStore, historyStore, collectStore, driveStore } from '@/lib/storage'

// 应用状态
interface AppState {
  // 数据源
  sources: SourceConfig[]
  currentSourceKey: string | null
  currentSite: SiteBean | null
  
  // 直播
  liveGroups: LiveGroup[]
  currentLiveChannel: string | null
  
  // 历史记录
  history: HistoryItem[]
  
  // 收藏
  collects: CollectItem[]
  
  // 网盘
  drives: DriveConfig[]
  
  // UI状态
  loading: boolean
  sidebarOpen: boolean
  playerSettings: PlayerSettings
  
  // Actions
  init: () => Promise<void>
  setSources: (sources: SourceConfig[]) => Promise<void>
  addSource: (source: SourceConfig) => Promise<void>
  removeSource: (index: number) => Promise<void>
  setCurrentSource: (key: string, site: SiteBean) => Promise<void>
  
  setLiveGroups: (groups: LiveGroup[]) => void
  setCurrentLiveChannel: (url: string | null) => void
  
  addHistory: (item: HistoryItem) => Promise<void>
  removeHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  
  addCollect: (item: CollectItem) => Promise<void>
  removeCollect: (videoId: string) => Promise<void>
  
  addDrive: (drive: DriveConfig) => Promise<void>
  removeDrive: (name: string) => Promise<void>
  
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setPlayerSettings: (settings: Partial<PlayerSettings>) => void
}

// 播放器设置
interface PlayerSettings {
  autoplay: boolean
  defaultQuality: string
  defaultSpeed: number
  danmakuEnabled: boolean
  danmakuOpacity: number
  danmakuSpeed: number
  danmakuFontSize: number
}

const defaultPlayerSettings: PlayerSettings = {
  autoplay: true,
  defaultQuality: 'auto',
  defaultSpeed: 1.0,
  danmakuEnabled: true,
  danmakuOpacity: 0.9,
  danmakuSpeed: 144,
  danmakuFontSize: 25,
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  sources: [],
  currentSourceKey: null,
  currentSite: null,
  liveGroups: [],
  currentLiveChannel: null,
  history: [],
  collects: [],
  drives: [],
  loading: false,
  sidebarOpen: true,
  playerSettings: defaultPlayerSettings,

  // 初始化
  init: async () => {
    const sources = await sourceStore.get()
    const currentSourceKey = await currentSourceStore.get()
    const history = await historyStore.get()
    const collects = await collectStore.get()
    const drives = await driveStore.get()
    
    set({
      sources,
      currentSourceKey,
      history,
      collects,
      drives,
    })
  },

  // 数据源操作
  setSources: async (sources) => {
    await sourceStore.set(sources)
    set({ sources })
  },

  addSource: async (source) => {
    await sourceStore.add(source)
    const sources = await sourceStore.get()
    set({ sources })
  },

  removeSource: async (index) => {
    await sourceStore.remove(index)
    const sources = await sourceStore.get()
    set({ sources })
  },

  setCurrentSource: async (key, site) => {
    await currentSourceStore.set(key)
    set({ currentSourceKey: key, currentSite: site })
  },

  // 直播操作
  setLiveGroups: (groups) => set({ liveGroups: groups }),
  setCurrentLiveChannel: (url) => set({ currentLiveChannel: url }),

  // 历史记录操作
  addHistory: async (item) => {
    await historyStore.add(item)
    const history = await historyStore.get()
    set({ history })
  },

  removeHistory: async (id) => {
    await historyStore.remove(id)
    const history = await historyStore.get()
    set({ history })
  },

  clearHistory: async () => {
    await historyStore.clear()
    set({ history: [] })
  },

  // 收藏操作
  addCollect: async (item) => {
    await collectStore.add(item)
    const collects = await collectStore.get()
    set({ collects })
  },

  removeCollect: async (videoId) => {
    await collectStore.remove(videoId)
    const collects = await collectStore.get()
    set({ collects })
  },

  // 网盘操作
  addDrive: async (drive) => {
    await driveStore.add(drive)
    const drives = await driveStore.get()
    set({ drives })
  },

  removeDrive: async (name) => {
    await driveStore.remove(name)
    const drives = await driveStore.get()
    set({ drives })
  },

  // UI操作
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPlayerSettings: (settings) =>
    set((state) => ({
      playerSettings: { ...state.playerSettings, ...settings },
    })),
}))
