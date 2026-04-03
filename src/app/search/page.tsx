'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/stores'
import { batchSearch } from '@/lib/api'
import { useHydration, useDebounce } from '@/hooks/useLocalforage'
import type { SearchResult } from '@/types'
import { Search, ArrowLeft, Play, Loader2 } from 'lucide-react'
import { generateId, cn } from '@/lib/utils'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useHydration()
  
  const keyword = searchParams.get('keyword') || ''
  const { sources, currentSourceKey } = useAppStore()
  
  const [searchValue, setSearchValue] = useState(keyword)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // 执行搜索
  useEffect(() => {
    if (!hydrated || !keyword || sources.length === 0) return

    const doSearch = async () => {
      setLoading(true)
      setSearched(true)
      
      // 构建搜索站点列表
      const sites = sources.flatMap(source => 
        source.sites
          .filter(site => site.search === 1)
          .map(site => ({ source, site }))
      )

      const searchResults = await batchSearch(sites, keyword)
      setResults(searchResults)
      setLoading(false)
    }

    doSearch()
  }, [hydrated, keyword, sources])

  // 搜索
  const handleSearch = () => {
    if (!searchValue.trim()) return
    router.push(`/search?keyword=${encodeURIComponent(searchValue)}`)
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
      {/* 顶部搜索栏 */}
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur border-b border-dark-700">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="搜索视频..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              搜索
            </button>
          </div>
        </div>
      </header>

      {/* 搜索结果 */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">未找到相关内容</h3>
            <p className="text-gray-500">尝试使用其他关键词搜索</p>
          </div>
        ) : (
          results.map((result) => (
            <div key={result.sourceKey} className="mb-8 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                {result.sourceName}
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({result.items.length} 条结果)
                </span>
              </h3>

              <div className="video-grid">
                {result.items.map((video, index) => (
                  <Link
                    key={video.vod_id || index}
                    href={`/detail/${video.vod_id}?source=${result.sourceKey}`}
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
            </div>
          ))
        )}

        {/* 未搜索状态 */}
        {!searched && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">输入关键词搜索</h3>
            <p className="text-gray-500">搜索所有支持搜索的数据源</p>
          </div>
        )}
      </div>
    </div>
  )
}
