'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/stores'
import { fetchLiveChannels } from '@/lib/api'
import { parseLiveContent } from '@/lib/utils'
import { usePlayer } from '@/hooks/usePlayer'
import { useHydration } from '@/hooks/useLocalforage'
import type { LiveGroup, LiveChannel } from '@/types'
import { cn } from '@/lib/utils'
import { Tv, ArrowLeft, Volume2, VolumeX, Maximize, List } from 'lucide-react'

export default function LivePage() {
  const hydrated = useHydration()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const { initPlayer, destroy, isPlaying, volume, muted, setVolume, toggleMute, toggleFullscreen } = usePlayer()
  const { sources, liveGroups, setLiveGroups, currentLiveChannel, setCurrentLiveChannel } = useAppStore()
  
  const [loading, setLoading] = useState(false)
  const [showChannelList, setShowChannelList] = useState(true)
  const [currentGroup, setCurrentGroup] = useState<string>('')

  // 加载直播源
  useEffect(() => {
    if (!hydrated || sources.length === 0) return

    const loadLiveChannels = async () => {
      setLoading(true)
      
      for (const source of sources) {
        if (source.lives && source.lives.length > 0) {
          for (const live of source.lives) {
            try {
              const content = await fetchLiveChannels(live.url)
              const groups = parseLiveContent(content, live.url)
              setLiveGroups(groups)
              
              if (groups.length > 0 && groups[0].channels.length > 0) {
                setCurrentGroup(groups[0].name)
              }
              break
            } catch (error) {
              console.error('加载直播源失败:', error)
            }
          }
        }
      }
      
      setLoading(false)
    }

    loadLiveChannels()
  }, [hydrated, sources])

  // 播放频道
  const handlePlayChannel = (channel: LiveChannel) => {
    if (!playerContainerRef.current) return
    
    setCurrentLiveChannel(channel.url)
    initPlayer({
      container: playerContainerRef.current,
      url: channel.url,
      type: channel.url.includes('.m3u8') ? 'hls' : 'mp4',
      autoplay: true,
    })
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* 频道列表 */}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-700 z-40 transition-all duration-300',
        showChannelList ? 'w-72' : 'w-0 -translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* 标题 */}
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tv className="w-5 h-5 text-primary-500" />
              直播频道
            </h2>
            <button onClick={() => setShowChannelList(false)} className="p-1 rounded hover:bg-dark-700">
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 分组列表 */}
          <div className="flex-1 overflow-y-auto">
            {liveGroups.map((group) => (
              <div key={group.name} className="border-b border-dark-700">
                <button
                  onClick={() => setCurrentGroup(currentGroup === group.name ? '' : group.name)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-800 transition-colors"
                >
                  <span className="font-medium">{group.name}</span>
                  <span className="text-sm text-gray-400">{group.channels.length}</span>
                </button>
                
                {currentGroup === group.name && (
                  <div className="bg-dark-800/50">
                    {group.channels.map((channel, index) => (
                      <button
                        key={index}
                        onClick={() => handlePlayChannel(channel)}
                        className={cn(
                          'w-full px-6 py-2 text-left text-sm hover:bg-dark-700 transition-colors flex items-center gap-2',
                          currentLiveChannel === channel.url && 'text-primary-400 bg-dark-700'
                        )}
                      >
                        {channel.logo && (
                          <img src={channel.logo} alt="" className="w-5 h-5 rounded" />
                        )}
                        <span>{channel.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 播放器区域 */}
      <main className={cn('flex-1 transition-all duration-300', showChannelList ? 'ml-72' : 'ml-0')}>
        {/* 顶部栏 */}
        <header className="absolute top-0 right-0 left-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showChannelList && (
                <button 
                  onClick={() => setShowChannelList(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <List className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* 播放器 */}
        <div className="w-full h-screen bg-black flex items-center justify-center">
          {currentLiveChannel ? (
            <div 
              ref={playerContainerRef}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center">
              <Tv className="w-20 h-20 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">选择频道开始观看</p>
              <button 
                onClick={() => setShowChannelList(true)}
                className="btn-primary"
              >
                查看频道列表
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
