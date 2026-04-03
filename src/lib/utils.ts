import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import CryptoJS from 'crypto-js'
import type { PlaySource, LiveGroup } from '@/types'

// 合并 Tailwind 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 格式化日期
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 解析播放URL字符串
export function parsePlayUrl(playUrl: string): PlaySource[] {
  if (!playUrl) return []
  
  const sources: PlaySource[] = []
  const lines = playUrl.split('#').filter(Boolean)
  
  let currentSource: PlaySource | null = null
  
  for (const line of lines) {
    const [name, url] = line.split('$')
    if (name && url) {
      // 判断是否为播放源名称（不包含$）
      if (!url.includes('http') && !url.includes('magnet')) {
        // 新的播放源
        if (currentSource) {
          sources.push(currentSource)
        }
        currentSource = { name, urls: [] }
      } else {
        // 播放地址
        if (!currentSource) {
          currentSource = { name: '默认', urls: [] }
        }
        currentSource.urls.push({ name, url })
      }
    }
  }
  
  if (currentSource) {
    sources.push(currentSource)
  }
  
  return sources
}

// 解析直播源
export function parseLiveContent(content: string, url: string): LiveGroup[] {
  const groups: LiveGroup[] = []
  const lines = content.split('\n').filter(Boolean)
  
  let currentGroup: LiveGroup | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 分组名称
    if (trimmed.startsWith('#genre#') || trimmed.includes(',#genre#')) {
      const groupName = trimmed.replace('#genre#', '').replace(',', '').trim()
      if (currentGroup) {
        groups.push(currentGroup)
      }
      currentGroup = { name: groupName, channels: [] }
      continue
    }
  
    // 频道
    const [name, channelUrl] = trimmed.split(',')
    if (name && channelUrl && currentGroup) {
      currentGroup.channels.push({
        name: name.trim(),
        url: channelUrl.trim(),
      })
    }
  }
  
  if (currentGroup) {
    groups.push(currentGroup)
  }
  
  return groups
}

// 加密解密工具
export function encrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString()
}

export function decrypt(ciphertext: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Base64 编解码
export function base64Encode(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
  }
  return Buffer.from(str).toString('base64')
}

export function base64Decode(str: string): string {
  if (typeof window !== 'undefined') {
    return decodeURIComponent(escape(atob(str)))
  }
  return Buffer.from(str, 'base64').toString()
}
