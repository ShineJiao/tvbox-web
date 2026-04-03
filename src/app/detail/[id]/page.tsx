'use client'

import { useEffect, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/stores'
import { TVBoxApi } from '@/lib/api'
import { useHydration } from '@/hooks/useLocalforage'
import type { VideoDetail, PlaySource } from '@/types'
import { parsePlayUrl, formatDate, cn, generateId } from '@/lib/utils'
import { ArrowLeft, Play, Heart, Clock, User, Calendar, Star, ChevronRight } from 'lucide-react'

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useHydration()
  
  const sourceKey = searchParams.get('source') || ''
  const { sources, addCollect, removeCollect, collects, addHistory } = useAppStore()
  
  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [playSources, setPlaySources] = useState<PlaySource[]>([])
  const [currentSource, setCurrentSource] = useState<PlaySource | null>(null)
  const [currentEpisode, setCurrentEpisode] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 检查是否收藏
  const isCollected = detail ? collects.some(c => c.videoId === detail.vod_id) : false

  // 加载详情
  useEffect(() => {
    if (!hydrated || !sourceKey || sources.length === 0) return

    const loadDetail = async () => {
      setLoading(true)
      
      for (const source of sources) {
        const site = source.sites.find(s => s.key === sourceKey)
        if (site) {
          const api = new TVBoxApi(source, site)
          const details = await api.getDetail([resolvedParams.id])
          
          if (details.length > 0) {
            const videoDetail = details[0]
            setDetail(videoDetail)
            
            // 解析播放源
            const sources = parsePlayUrl(videoDetail.vod_play_url || '')
            setPlaySources(sources)
            
            if (sources.length > 0) {
              setCurrentSource(sources[0])
              if (sources[0].urls.length > 0) {
                setCurrentEpisode(sources[0].urls[0].name)
              }
            }
            break
          }
        }
      }
      
      setLoading(false)
    }

    loadDetail()
  }, [hydrated, sourceKey, sources, resolvedParams.id])

  // 播放
  const handlePlay = (source: PlaySource, episodeName: string, url: string) => {
    setCurrentSource(source)
    setCurrentEpisode(episodeName)
    
    // 添加历史记录
    if (detail) {
      addHistory({
        id: generateId(),
        sourceKey,
        videoId: detail.vod_id,
        videoName: detail.vod_name,
        videoPic: detail.vod_pic,
        episode: episodeName,
        episodeUrl: url,
        playSource: source.name,
        progress: 0,
        duration: 0,
        timestamp: Date.now(),
      })
    }
    
    router.push(`/play/${resolvedParams.id}?source=${sourceKey}&episode=${encodeURIComponent(episodeName)}&url=${encodeURIComponent(url)}`)
  }

  // 收藏/取消收藏
  const toggleCollect = () => {
    if (!detail) return
    
    if (isCollected) {
      removeCollect(detail.vod_id)
    } else {
      addCollect({
        id: generateId(),
        sourceKey,
        videoId: detail.vod_id,
        videoName: detail.vod_name,
        videoPic: detail.vod_pic,
        videoRemarks: detail.vod_remarks || '',
        timestamp: Date.now(),
      })
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">视频不存在</p>
        <button onClick={() => router.back()} className="btn-primary">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur border-b border-dark-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold truncate max-w-md">{detail.vod_name}</h2>
          </div>
          
          <button 
            onClick={toggleCollect}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isCollected ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            )}
          >
            <Heart className={cn('w-4 h-4', isCollected && 'fill-current')} />
            {isCollected ? '已收藏' : '收藏'}
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* 视频信息 */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 animate-fadeIn">
          {/* 海报 */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[2/3] bg-dark-800 rounded-lg overflow-hidden">
              <img 
                src={detail.vod_pic || '/placeholder.jpg'} 
                alt={detail.vod_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 信息 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">{detail.vod_name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {detail.vod_remarks && (
                <span className="tag bg-primary-500/20 text-primary-400">{detail.vod_remarks}</span>
              )}
              {detail.vod_year && (
                <span className="tag">{detail.vod_year}</span>
              )}
              {detail.vod_area && (
                <span className="tag">{detail.vod_area}</span>
              )}
              {detail.type_name && (
                <span className="tag">{detail.type_name}</span>
              )}
            </div>

            <div className="space-y-3 text-sm">
              {detail.vod_director && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">导演：</span>
                  <span>{detail.vod_director}</span>
                </div>
              )}
              {detail.vod_actor && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">演员：</span>
                  <span>{detail.vod_actor}</span>
                </div>
              )}
              {detail.vod_score && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">{detail.vod_score}</span>
                </div>
              )}
            </div>

            {detail.vod_content && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">简介</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{detail.vod_content}</p>
              </div>
            )}
          </div>
        </div>

        {/* 播放源选择 */}
        {playSources.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary-500" />
              选择播放源
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {playSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSource(source)}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors',
                    currentSource?.name === source.name
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  )}
                >
                  {source.name}
                </button>
              ))}
            </div>

            {/* 集数列表 */}
            {currentSource && (
              <div className="bg-dark-800 rounded-lg p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {currentSource.urls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handlePlay(currentSource, url.name, url.url)}
                      className={cn(
                        'px-3 py-2 text-sm rounded transition-colors truncate',
                        currentEpisode === url.name
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      )}
                    >
                      {url.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 无播放源 */}
        {playSources.length === 0 && (
          <div className="text-center py-12">
            <Play className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">暂无播放源</p>
          </div>
        )}
      </div>
    </div>
  )
}
