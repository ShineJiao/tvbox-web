'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { TVBoxApi, batchSearch } from '@/lib/api'
import { generateId, cn } from '@/lib/utils'
import { useHydration, useDebounce } from '@/hooks/useLocalforage'
import type { VideoCategory, VideoItem, SourceConfig, SiteBean } from '@/types'
import { 
  Search, Menu, X, Settings, History, Heart, Tv, HardDrive, 
  ChevronRight, Play, Star, Clock, Film, Monitor
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const hydrated = useHydration()
  
  const {
    sources,
    currentSourceKey,
    currentSite,
    init,
    setCurrentSource,
    setLoading,
  } = useAppStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [categoryContents, setCategoryContents] = useState<Record<string, VideoItem[]>>({})
  const [loadingCategories, setLoadingCategories] = useState(false)

  // 初始化
  useEffect(() => {
    init()
  }, [init])

  // 加载数据源
  useEffect(() => {
    if (!hydrated || sources.length === 0 || !currentSourceKey) return

    const loadSource = async () => {
      setLoading(true)
      setLoadingCategories(true)
      
      // 找到当前站点
      for (const source of sources) {
        const site = source.sites.find(s => s.key === currentSourceKey)
        if (site) {
          setCurrentSource(currentSourceKey, site)
          
          // 加载分类
          const api = new TVBoxApi(source, site)
          const cats = await api.getCategories()
          setCategories(cats)
          
          // 加载每个分类的内容
          const contents: Record<string, VideoItem[]> = {}
          for (const cat of cats.slice(0, 5)) { // 只加载前5个分类
            const result = await api.getCategoryContent(cat.type_id, 1)
            contents[cat.type_id] = result.list
          }
          setCategoryContents(contents)
          break
        }
      }
      
      setLoading(false)
      setLoadingCategories(false)
    }

    loadSource()
  }, [hydrated, sources, currentSourceKey, setCurrentSource, setLoading])

  // 搜索
  const debouncedKeyword = useDebounce(searchKeyword, 500)
  const handleSearch = async () => {
    if (!debouncedKeyword.trim()) return
    
    router.push(`/search?keyword=${encodeURIComponent(debouncedKeyword)}`)
    setSearchOpen(false)
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-700 z-40 sidebar-transition',
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-700">
            <h1 className="text-2xl font-bold text-primary-500">TVBox Web</h1>
            <p className="text-sm text-gray-400 mt-1">在线视频播放平台</p>
          </div>

          {/* 数据源选择 */}
          <div className="p-4 border-b border-dark-700">
            <label className="text-sm text-gray-400 mb-2 block">数据源</label>
            <select 
              className="input text-sm"
              value={currentSourceKey || ''}
              onChange={(e) => setCurrentSource(e.target.value, 
                sources.flatMap(s => s.sites).find(site => site.key === e.target.value) || null as any
              )}
            >
              <option value="">选择数据源</option>
              {sources.flatMap(source => source.sites).map(site => (
                <option key={site.key} value={site.key}>{site.name}</option>
              ))}
            </select>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-800 text-white">
              <Film className="w-5 h-5" />
              <span>首页</span>
            </Link>
            <Link href="/live" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-800 text-gray-300 transition-colors">
              <Tv className="w-5 h-5" />
              <span>直播</span>
            </Link>
            <Link href="/history" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-800 text-gray-300 transition-colors">
              <Clock className="w-5 h-5" />
              <span>历史记录</span>
            </Link>
            <Link href="/collect" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-800 text-gray-300 transition-colors">
              <Heart className="w-5 h-5" />
              <span>收藏</span>
            </Link>
            <Link href="/drive" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-800 text-gray-300 transition-colors">
              <HardDrive className="w-5 h-5" />
              <span>网盘</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-800 text-gray-300 transition-colors">
              <Settings className="w-5 h-5" />
              <span>设置</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-0')}>
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur border-b border-dark-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-xl font-semibold">首页</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* 搜索框 */}
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input w-64"
                      placeholder="搜索视频..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      autoFocus
                    />
                    <button onClick={handleSearch} className="btn-primary">
                      <Search className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSearchOpen(false)} className="btn-secondary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 分类内容 */}
        <div className="p-6 space-y-8">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-20">
              <div className="loading-spinner w-12 h-12"></div>
            </div>
          ) : (
            categories.slice(0, 5).map(category => (
              <section key={category.type_id} className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                    {category.type_name}
                  </h3>
                  <Link 
                    href={`/category/${category.type_id}`}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    查看更多 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="video-grid">
                  {(categoryContents[category.type_id] || []).map((video, index) => (
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
                        <span className="text-xs text-primary-400 mb-1">{video.vod_remarks || '暂无信息'}</span>
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
              </section>
            ))
          )}

          {/* 空状态 */}
          {categories.length === 0 && !loadingCategories && (
            <div className="text-center py-20">
              <Monitor className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">暂无内容</h3>
              <p className="text-gray-500">请先在设置页面添加数据源配置</p>
              <Link href="/settings" className="btn-primary inline-flex mt-4">
                前往设置
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
