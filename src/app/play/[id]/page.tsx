'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/stores'
import { usePlayer } from '@/hooks/usePlayer'
import { useHydration } from '@/hooks/useLocalforage'
import type { VideoDetail, PlaySource, DanmakuItem } from '@/types'
import { parsePlayUrl, cn } from '@/lib/utils'
import { ArrowLeft, Settings, MessageCircle, SkipForward, SkipBack } from 'lucide-react'

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useHydration()
  
  const sourceKey = searchParams.get('source') || ''
  const episodeName = searchParams.get('episode') || ''
  const playUrl = searchParams.get('url') || ''
  
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const { initPlayer, destroy, isPlaying, currentTime, duration, sendDanmaku } = usePlayer()
  const { sources, addHistory, playerSettings } = useAppStore()
  
  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [playSources, setPlaySources] = useState<PlaySource[]>([])
  const [currentSource, setCurrentSource] = useState<PlaySource | null>(null)
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([])
  const [danmakuInput, setDanmakuInput] = useState('')
  const [showDanmakuInput, setShowDanmakuInput] = useState(false)
  const [danmakuColor, setDanmakuColor] = useState('#ffffff')

  // 初始化播放器
  useEffect(() => {
    if (!hydrated || !playerContainerRef.current || !playUrl) return

    const init = async () => {
      await initPlayer({
        container: playerContainerRef.current!,
        url: playUrl,
        autoplay: playerSettings.autoplay,
        danmaku: danmakuList,
        onProgress: (time, dur) => {
          // 保存进度
          if (detail && dur > 0) {
            addHistory({
              id: Date.now().toString(),
              sourceKey,
              videoId: detail.vod_id,
              videoName: detail.vod_name,
              videoPic: detail.vod_pic,
              episode: episodeName,
              episodeUrl: playUrl,
              playSource: currentSource?.name || '',
              progress: (time / dur) * 100,
              duration: dur,
              timestamp: Date.now(),
            })
          }
        },
      })
    }

    init()

    return () => {
      destroy()
    }
  }, [hydrated, playUrl])

  // 发送弹幕
  const handleSendDanmaku = () => {
    if (!danmakuInput.trim()) return
    
    sendDanmaku(danmakuInput, danmakuColor)
    setDanmakuInput('')
    setShowDanmakuInput(false)
  }

  // 切换集数
  const handleSwitchEpisode = (direction: 'prev' | 'next') => {
    if (!currentSource) return
    
    const currentIndex = currentSource.urls.findIndex(u => u.name === episodeName)
    if (direction === 'prev' && currentIndex > 0) {
      const prev = currentSource.urls[currentIndex - 1]
      router.push(`/play/${resolvedParams.id}?source=${sourceKey}&episode=${encodeURIComponent(prev.name)}&url=${encodeURIComponent(prev.url)}`)
    } else if (direction === 'next' && currentIndex < currentSource.urls.length - 1) {
      const next = currentSource.urls[currentIndex + 1]
      router.push(`/play/${resolvedParams.id}?source=${sourceKey}&episode=${encodeURIComponent(next.name)}&url=${encodeURIComponent(next.url)}`)
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部控制栏 */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold">{detail?.vod_name || '播放中'}</h2>
              <p className="text-sm text-gray-400">{episodeName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 播放器容器 */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          ref={playerContainerRef}
          className="w-full h-full max-h-[80vh] aspect-video bg-black relative"
        >
          {/* 加载中 */}
          {!playUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="loading-spinner w-12 h-12"></div>
            </div>
          )}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 集数切换 */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSwitchEpisode('prev')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSwitchEpisode('next')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* 弹幕控制 */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDanmakuInput(!showDanmakuInput)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                showDanmakuInput ? 'bg-primary-500' : 'bg-white/10 hover:bg-white/20'
              )}
            >
              <MessageCircle className="w-4 h-4" />
              发弹幕
            </button>
          </div>
        </div>

        {/* 弹幕输入框 */}
        {showDanmakuInput && (
          <div className="flex items-center gap-2 mt-4 bg-dark-800 rounded-lg p-2">
            {/* 颜色选择 */}
            <div className="flex gap-1">
              {['#ffffff', '#ff0000', '#00ff00', '#ffff00', '#00ffff'].map(color => (
                <button
                  key={color}
                  onClick={() => setDanmakuColor(color)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2',
                    danmakuColor === color ? 'border-white' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <input
              type="text"
              className="flex-1 bg-dark-700 rounded px-3 py-2 text-sm"
              placeholder="发送弹幕..."
              value={danmakuInput}
              onChange={(e) => setDanmakuInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDanmaku()}
              autoFocus
            />
            
            <button onClick={handleSendDanmaku} className="btn-primary text-sm">
              发送
            </button>
          </div>
        )}
      </div>

      {/* 侧边集数列表 */}
      <div className="absolute right-0 top-16 bottom-16 w-64 bg-dark-900/95 backdrop-blur overflow-y-auto hidden lg:block">
        <div className="p-4">
          <h3 className="font-semibold mb-4">选集</h3>
          {currentSource && (
            <div className="space-y-1">
              {currentSource.urls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/play/${resolvedParams.id}?source=${sourceKey}&episode=${encodeURIComponent(url.name)}&url=${encodeURIComponent(url.url)}`)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm rounded transition-colors truncate',
                    episodeName === url.name
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-dark-700'
                  )}
                >
                  {url.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
