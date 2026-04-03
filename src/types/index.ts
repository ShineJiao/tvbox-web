// TVBox 数据源配置
export interface SourceConfig {
  spider: string // 爬虫JAR地址
  sites: SiteBean[]
  lives: LiveConfig[]
  flags?: string[]
  ijk?: IjkConfig
}

// 站点配置
export interface SiteBean {
  key: string
  name: string
  type: number // 0: XML, 1: JSON, 3: CMS, 4: Spider
  api: string
  search: number // 0: 不支持搜索, 1: 支持搜索
  quickSearch?: number
  filterable?: number
  ext?: string
  jar?: string
}

// 直播配置
export interface LiveConfig {
  name: string
  type: number // 0: 单链接, 1: 多链接
  url: string
  epg?: string
  logo?: string
}

// IJK播放器配置
export interface IjkConfig {
  ijk: IjkOption[]
}

export interface IjkOption {
  category: number
  name: string
  value: string
}

// 视频分类
export interface VideoCategory {
  type_id: string
  type_name: string
  type_flag?: string
}

// 视频列表项
export interface VideoItem {
  vod_id: string
  vod_name: string
  vod_pic: string
  vod_remarks?: string
  vod_year?: string
  vod_area?: string
  vod_director?: string
  vod_actor?: string
  vod_content?: string
  vod_play_from?: string
  vod_play_url?: string
  type_id?: string
  type_name?: string
}

// 视频详情
export interface VideoDetail extends VideoItem {
  vod_time?: string
  vod_hits?: string
  vod_score?: string
}

// 播放源
export interface PlaySource {
  name: string // 播放源名称
  urls: PlayUrl[] // 播放地址列表
}

export interface PlayUrl {
  name: string // 集数名称
  url: string // 播放地址
}

// 直播频道
export interface LiveChannel {
  name: string
  url: string
  logo?: string
  epg?: string
}

// 直播分组
export interface LiveGroup {
  name: string
  channels: LiveChannel[]
}

// 网盘配置
export interface DriveConfig {
  name: string
  type: 'webdav' | 'alist'
  server: string
  username?: string
  password?: string
  token?: string
}

// 网盘文件
export interface DriveFile {
  name: string
  path: string
  isDir: boolean
  size: number
  modified: string
  mime?: string
}

// 历史记录
export interface HistoryItem {
  id: string
  sourceKey: string
  videoId: string
  videoName: string
  videoPic: string
  episode: string
  episodeUrl: string
  playSource: string
  progress: number // 播放进度 0-100
  duration: number // 总时长
  timestamp: number // 观看时间戳
}

// 收藏记录
export interface CollectItem {
  id: string
  sourceKey: string
  videoId: string
  videoName: string
  videoPic: string
  videoRemarks: string
  timestamp: number
}

// 弹幕数据
export interface DanmakuItem {
  time: number // 播放时间(秒)
  type: 'right' | 'top' | 'bottom'
  color: string
  text: string
}

// 搜索结果
export interface SearchResult {
  sourceKey: string
  sourceName: string
  items: VideoItem[]
}
