'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { useHydration } from '@/hooks/useLocalforage'
import { formatDate, cn } from '@/lib/utils'
import { Heart, Trash2, ArrowLeft } from 'lucide-react'

export default function CollectPage() {
  const router = useRouter()
  const hydrated = useHydration()
  const { collects, removeCollect } = useAppStore()

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
        <div className="flex items-center px-6 py-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-dark-700 transition-colors mr-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">我的收藏</h2>
          <span className="ml-2 text-sm text-gray-400">({collects.length})</span>
        </div>
      </header>

      {/* 收藏列表 */}
      <div className="p-6">
        {collects.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">暂无收藏</h3>
            <p className="text-gray-500">收藏的视频将在这里显示</p>
          </div>
        ) : (
          <div className="video-grid">
            {collects.map((item) => (
              <div key={item.id} className="video-card group relative">
                <Link 
                  href={`/detail/${item.videoId}?source=${item.sourceKey}`}
                  className="block"
                >
                  <div className="aspect-[2/3] bg-dark-800 overflow-hidden rounded-lg">
                    <img 
                      src={item.videoPic || '/placeholder.jpg'} 
                      alt={item.videoName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium line-clamp-1">{item.videoName}</h4>
                    <p className="text-xs text-gray-400 mt-1">{item.videoRemarks}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
                  </div>
                </Link>
                
                {/* 删除按钮 */}
                <button
                  onClick={() => removeCollect(item.videoId)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-dark-800/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
