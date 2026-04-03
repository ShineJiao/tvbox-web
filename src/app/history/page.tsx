'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { useHydration } from '@/hooks/useLocalforage'
import { formatDate, formatDuration, cn } from '@/lib/utils'
import { Clock, Trash2, Play, ArrowLeft } from 'lucide-react'

export default function HistoryPage() {
  const router = useRouter()
  const hydrated = useHydration()
  const { history, removeHistory, clearHistory } = useAppStore()

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
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
            <h2 className="text-xl font-semibold">历史记录</h2>
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空记录
            </button>
          )}
        </div>
      </header>

      {/* 记录列表 */}
      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">暂无观看记录</h3>
            <p className="text-gray-500">观看的视频将在这里显示</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="flex gap-4 bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors group"
              >
                {/* 缩略图 */}
                <Link 
                  href={`/detail/${item.videoId}?source=${item.sourceKey}`}
                  className="relative w-40 aspect-video bg-dark-700 rounded overflow-hidden flex-shrink-0"
                >
                  <img 
                    src={item.videoPic || '/placeholder.jpg'} 
                    alt={item.videoName}
                    className="w-full h-full object-cover"
                  />
                  {/* 进度条 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
                    <div 
                      className="h-full bg-primary-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </Link>

                {/* 信息 */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link 
                      href={`/detail/${item.videoId}?source=${item.sourceKey}`}
                      className="font-medium hover:text-primary-400 transition-colors"
                    >
                      {item.videoName}
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.episode} · {item.playSource}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        已观看 {Math.round(item.progress)}%
                      </span>
                      <button
                        onClick={() => removeHistory(item.id)}
                        className="p-1 rounded hover:bg-dark-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 继续播放按钮 */}
                <div className="flex items-center">
                  <Link
                    href={`/play/${item.videoId}?source=${item.sourceKey}&episode=${encodeURIComponent(item.episode)}&url=${encodeURIComponent(item.episodeUrl)}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    继续播放
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
