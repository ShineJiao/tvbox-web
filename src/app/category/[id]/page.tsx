'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { TVBoxApi } from '@/lib/api'
import { useHydration } from '@/hooks/useLocalforage'
import type { VideoItem, VideoCategory } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowLeft, Play, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const hydrated = useHydration()
  
  const { sources, currentSourceKey, currentSite } = useAppStore()
  
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [currentCategory, setCurrentCategory] = useState<string>(resolvedParams.id)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)

  // 加载分类
  useEffect(() => {
    if (!hydrated || sources.length === 0 || !currentSourceKey) return

    const loadCategories = async () => {
      for (const source of sources) {
        const site = source.sites.find(s => s.key === currentSourceKey)
        if (site) {
          const api = new TVBoxApi(source, site)
          const cats = await api.getCategories()
          setCategories(cats)
          break
        }
      }
    }

    loadCategories()
  }, [hydrated, sources, currentSourceKey])

  // 加载内容
  useEffect(() => {
    if (!hydrated || sources.length === 0 || !currentSourceKey || !currentCategory) return

    const loadContent = async () => {
      setLoading(true)
      
      for (const source of sources) {
        const site = source.sites.find(s => s.key === currentSourceKey)
        if (site) {
          const api = new TVBoxApi(source, site)
          const result = await api.getCategoryContent(currentCategory, page)
          setVideos(result.list)
          setPageCount(result.pagecount)
          break
        }
      }
      
      setLoading(false)
    }

    loadContent()
  }, [hydrated, sources, currentSourceKey, currentCategory, page])

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId)
    setPage(1)
    router.push(`/category/${categoryId}`)
  }

  // 分页
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pageCount) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          <h2 className="text-xl font-semibold">
            {categories.find(c => c.type_id === currentCategory)?.type_name || '分类'}
          </h2>
        </div>

        {/* 分类标签 */}
        <div className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.type_id}
                onClick={() => handleCategoryChange(category.type_id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  currentCategory === category.type_id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                )}
              >
                {category.type_name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 视频列表 */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">暂无内容</p>
          </div>
        ) : (
          <>
            <div className="video-grid">
              {videos.map((video, index) => (
                <Link
                  key={video.vod_id || index}
                  href={`/detail/${video.vod_id}?source=${currentSourceKey}`}
                  className="video-card group"
                >
                  <div className="aspect-[2/3] bg-dark-800 overflow-hidden">
                    <img
                      src={video.vod_pic || '/placeholder.jpg'}
                      alt={video.vod_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="video-card-overlay flex flex-col justify-end p-3">
                    <span className="text-xs text-primary-400 mb-1">{video.vod_remarks || ''}</span>
                    <h4 className="text-sm font-medium line-clamp-2">{video.vod_name}</h4>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary-500 rounded-full p-2">
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-dark-700 disabled:opacity-50 hover:bg-dark-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-gray-400">
                  {page} / {pageCount}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pageCount}
                  className="p-2 rounded-lg bg-dark-700 disabled:opacity-50 hover:bg-dark-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
