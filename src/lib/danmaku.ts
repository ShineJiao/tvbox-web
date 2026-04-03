import Danmaku from 'danmaku'
import type { DanmakuItem } from '@/types'

// 弹幕管理器
export class DanmakuManager {
  private danmaku: Danmaku | null = null
  private container: HTMLElement | null = null

  // 初始化弹幕
  init(container: HTMLElement, video: HTMLVideoElement) {
    this.container = container
    
    this.danmaku = new Danmaku({
      container,
      media: video,
      player: video,
      comments: [],
      speed: 144,
    })
  }

  // 加载弹幕
  load(data: DanmakuItem[]) {
    if (!this.danmaku) return

    const comments = data.map((item) => ({
      time: item.time,
      text: item.text,
      color: item.color,
      type: item.type === 'right' ? 'right' : item.type,
    }))

    this.danmaku.comments = comments
    this.danmaku.reload()
  }

  // 添加弹幕
  add(item: DanmakuItem) {
    if (!this.danmaku) return

    this.danmaku.emit({
      time: item.time,
      text: item.text,
      color: item.color,
      type: item.type === 'right' ? 'right' : item.type,
    })
  }

  // 显示/隐藏
  toggle(visible: boolean) {
    if (!this.danmaku) return
    
    if (visible) {
      this.danmaku.show()
    } else {
      this.danmaku.hide()
    }
  }

  // 播放
  play() {
    this.danmaku?.play()
  }

  // 暂停
  pause() {
    this.danmaku?.pause()
  }

  // 销毁
  destroy() {
    this.danmaku?.destroy()
    this.danmaku = null
  }

  // 显示
  show() {
    this.danmaku?.show()
  }

  // 隐藏
  hide() {
    this.danmaku?.hide()
  }

  // 设置透明度
  setOpacity(opacity: number) {
    if (!this.container) return
    this.container.style.opacity = opacity.toString()
  }

  // 设置速度
  setSpeed(speed: number) {
    if (!this.danmaku) return
    // @ts-ignore
    this.danmaku.speed = speed
  }

  // 设置字体大小
  setFontSize(size: number) {
    if (!this.container) return
    this.container.style.fontSize = `${size}px`
  }
}

// 从弹幕文件解析
export function parseDanmaku(content: string): DanmakuItem[] {
  const items: DanmakuItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // DPlayer 格式: <d p="time,type,color,size">text</d>
    const match = line.match(/<d p="([\d.]+),(\d+),(\d+),(\d+)">(.+?)<\/d>/)
    if (match) {
      const [, time, type, color] = match
      const text = match[5]
      
      items.push({
        time: parseFloat(time),
        type: parseInt(type) === 1 ? 'top' : parseInt(type) === 2 ? 'bottom' : 'right',
        color: `#${parseInt(color).toString(16).padStart(6, '0')}`,
        text,
      })
    }

    // Bilibili 格式
    const biliMatch = line.match(/([\d.]+),(\d+),(\d+),(.+)/)
    if (biliMatch) {
      const [, time, type, color, text] = biliMatch
      items.push({
        time: parseFloat(time),
        type: parseInt(type) === 5 ? 'top' : parseInt(type) === 4 ? 'bottom' : 'right',
        color: `#${parseInt(color).toString(16).padStart(6, '0')}`,
        text,
      })
    }
  }

  return items.sort((a, b) => a.time - b.time)
}

// 获取弹幕（模拟）
export async function fetchDanmaku(url: string): Promise<DanmakuItem[]> {
  try {
    const response = await fetch(url)
    const content = await response.text()
    return parseDanmaku(content)
  } catch (error) {
    console.error('获取弹幕失败:', error)
    return []
  }
}
