'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { sourceStore } from '@/lib/storage'
import { useHydration } from '@/hooks/useLocalforage'
import type { SourceConfig } from '@/types'
import { cn } from '@/lib/utils'
import { Settings, ArrowLeft, Plus, Trash2, Upload, Link, Check, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const hydrated = useHydration()
  const { sources, setSources, init } = useAppStore()
  
  const [activeTab, setActiveTab] = useState<'source' | 'player' | 'about'>('source')
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 添加数据源
  const handleAddSource = async () => {
    if (!sourceUrl.trim()) return
    
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch(sourceUrl)
      const config: SourceConfig = await response.json()
      
      // 验证配置
      if (!config.sites || !Array.isArray(config.sites)) {
        throw new Error('配置格式错误')
      }
      
      await setSources([...sources, config])
      setMessage({ type: 'success', text: '添加成功' })
      setSourceUrl('')
      init()
    } catch (error) {
      console.error('添加数据源失败:', error)
      setMessage({ type: 'error', text: '添加失败，请检查配置地址' })
    }
    
    setLoading(false)
  }

  // 删除数据源
  const handleRemoveSource = async (index: number) => {
    const newSources = sources.filter((_, i) => i !== index)
    await setSources(newSources)
  }

  // 导入配置文件
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const config: SourceConfig = JSON.parse(event.target?.result as string)
        
        if (!config.sites || !Array.isArray(config.sites)) {
          throw new Error('配置格式错误')
        }
        
        await setSources([...sources, config])
        setMessage({ type: 'success', text: '导入成功' })
        init()
      } catch (error) {
        setMessage({ type: 'error', text: '导入失败，请检查文件格式' })
      }
    }
    reader.readAsText(file)
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
          <h2 className="text-xl font-semibold">设置</h2>
        </div>
      </header>

      {/* 标签页 */}
      <div className="border-b border-dark-700">
        <div className="flex px-6">
          {[
            { key: 'source', label: '数据源管理' },
            { key: 'player', label: '播放器设置' },
            { key: 'about', label: '关于' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容 */}
      <div className="p-6 max-w-4xl">
        {/* 数据源管理 */}
        {activeTab === 'source' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 添加数据源 */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">添加数据源</h3>
              
              <div className="space-y-4">
                {/* URL 输入 */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">配置地址</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="https://example.com/config.json"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                    />
                    <button 
                      onClick={handleAddSource}
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {loading ? '添加中...' : '添加'}
                    </button>
                  </div>
                </div>

                {/* 文件导入 */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">或</span>
                  <label className="btn-secondary cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    导入配置文件
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </label>
                </div>

                {/* 消息提示 */}
                {message && (
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* 已添加的数据源 */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">已添加的数据源 ({sources.length})</h3>
              
              {sources.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  暂无数据源，请添加配置
                </div>
              ) : (
                <div className="space-y-4">
                  {sources.map((source, index) => (
                    <div key={index} className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-primary-400" />
                            <span className="font-medium">数据源 #{index + 1}</span>
                            {source.spider && (
                              <span className="tag text-xs">Spider</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {source.sites.length} 个站点
                            {source.lives && source.lives.length > 0 && ` · ${source.lives.length} 个直播源`}
                          </p>
                          
                          {/* 站点列表 */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {source.sites.slice(0, 5).map((site) => (
                              <span key={site.key} className="tag text-xs">
                                {site.name}
                              </span>
                            ))}
                            {source.sites.length > 5 && (
                              <span className="tag text-xs">+{source.sites.length - 5}</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveSource(index)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 配置格式说明 */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">配置文件格式</h3>
              <pre className="bg-dark-900 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`{
  "spider": "https://example.com/spider.jar",
  "sites": [
    {
      "key": "site1",
      "name": "站点名称",
      "type": 3,
      "api": "https://api.example.com",
      "search": 1
    }
  ],
  "lives": [
    {
      "name": "直播源名称",
      "type": 0,
      "url": "https://live.example.com/list.txt"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        )}

        {/* 播放器设置 */}
        {activeTab === 'player' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">播放器设置</h3>
              <p className="text-gray-400">播放器设置功能开发中...</p>
            </div>
          </div>
        )}

        {/* 关于 */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">TVBox Web</h3>
              <p className="text-gray-400 mb-4">版本 1.0.0</p>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>基于 Next.js 构建的 TVBox Web 版本</p>
                <p>支持功能：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>多数据源配置</li>
                  <li>视频分类浏览</li>
                  <li>视频搜索</li>
                  <li>视频播放（点播）</li>
                  <li>直播功能</li>
                  <li>历史记录</li>
                  <li>收藏功能</li>
                  <li>弹幕功能</li>
                  <li>网盘功能（WebDAV/Alist）</li>
                </ul>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">技术栈</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">前端框架：</span>
                  <span>Next.js 14</span>
                </div>
                <div>
                  <span className="text-gray-400">UI样式：</span>
                  <span>Tailwind CSS 3</span>
                </div>
                <div>
                  <span className="text-gray-400">语言：</span>
                  <span>TypeScript 4</span>
                </div>
                <div>
                  <span className="text-gray-400">播放器：</span>
                  <span>ArtPlayer + HLS.js</span>
                </div>
                <div>
                  <span className="text-gray-400">状态管理：</span>
                  <span>Zustand</span>
                </div>
                <div>
                  <span className="text-gray-400">本地存储：</span>
                  <span>LocalForage</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
