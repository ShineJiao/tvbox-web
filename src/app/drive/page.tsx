'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAppStore } from '@/stores'
import { useHydration } from '@/hooks/useLocalforage'
import type { DriveConfig, DriveFile } from '@/types'
import { formatFileSize, cn, generateId } from '@/lib/utils'
import { HardDrive, ArrowLeft, Folder, File, Play, Plus, X, ChevronRight, Loader2 } from 'lucide-react'

export default function DrivePage() {
  const router = useRouter()
  const hydrated = useHydration()
  const { drives, addDrive, removeDrive } = useAppStore()
  
  const [currentDrive, setCurrentDrive] = useState<DriveConfig | null>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddDrive, setShowAddDrive] = useState(false)
  
  // 添加网盘表单
  const [newDrive, setNewDrive] = useState<Partial<DriveConfig>>({
    name: '',
    type: 'alist',
    server: '',
    username: '',
    password: '',
  })

  // 加载文件列表
  useEffect(() => {
    if (!hydrated || !currentDrive) return
    
    loadFiles(currentPath)
  }, [hydrated, currentDrive, currentPath])

  const loadFiles = async (path: string) => {
    if (!currentDrive) return
    
    setLoading(true)
    try {
      if (currentDrive.type === 'alist') {
        const response = await axios.post(`${currentDrive.server}/api/fs/list`, {
          path,
          page: 1,
          per_page: 100,
        }, {
          headers: {
            'Authorization': currentDrive.token || '',
          },
        })
        
        if (response.data.code === 200) {
          setFiles(response.data.data.content.map((f: any) => ({
            name: f.name,
            path: `${path}/${f.name}`.replace('//', '/'),
            isDir: f.is_dir,
            size: f.size,
            modified: f.modified,
          })))
        }
      } else if (currentDrive.type === 'webdav') {
        // WebDAV 请求
        const response = await axios.request({
          url: `${currentDrive.server}${path}`,
          method: 'PROPFIND',
          headers: {
            'Depth': '1',
          },
          auth: {
            username: currentDrive.username || '',
            password: currentDrive.password || '',
          },
        })
        
        // 解析 WebDAV 响应 (简化版)
        // 实际需要解析 XML
        setFiles([])
      }
    } catch (error) {
      console.error('加载文件失败:', error)
    }
    setLoading(false)
  }

  // 添加网盘
  const handleAddDrive = () => {
    if (!newDrive.name || !newDrive.server) return
    
    addDrive({
      name: newDrive.name,
      type: newDrive.type as 'webdav' | 'alist',
      server: newDrive.server,
      username: newDrive.username,
      password: newDrive.password,
      token: newDrive.token,
    })
    
    setNewDrive({
      name: '',
      type: 'alist',
      server: '',
      username: '',
      password: '',
    })
    setShowAddDrive(false)
  }

  // 进入文件夹
  const handleEnterFolder = (file: DriveFile) => {
    if (file.isDir) {
      setCurrentPath(file.path)
    }
  }

  // 播放视频
  const handlePlayVideo = (file: DriveFile) => {
    if (!currentDrive) return
    
    const videoUrl = currentDrive.type === 'alist' 
      ? `${currentDrive.server}/d${file.path}` 
      : `${currentDrive.server}${file.path}`
    
    // 跳转到播放页面
    router.push(`/play/0?url=${encodeURIComponent(videoUrl)}&episode=${encodeURIComponent(file.name)}`)
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
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">网盘</h2>
          </div>
          
          <button 
            onClick={() => setShowAddDrive(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加网盘
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* 网盘列表 */}
        <aside className="w-64 bg-dark-900 border-r border-dark-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">已添加的网盘</h3>
            
            {drives.length === 0 ? (
              <p className="text-sm text-gray-500">暂无网盘</p>
            ) : (
              <div className="space-y-2">
                {drives.map((drive) => (
                  <button
                    key={drive.name}
                    onClick={() => {
                      setCurrentDrive(drive)
                      setCurrentPath('/')
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left',
                      currentDrive?.name === drive.name
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-dark-700'
                    )}
                  >
                    <HardDrive className="w-4 h-4" />
                    <span className="flex-1 truncate">{drive.name}</span>
                    <span className="text-xs text-gray-400">{drive.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* 文件列表 */}
        <main className="flex-1 overflow-y-auto">
          {currentDrive ? (
            <>
              {/* 路径导航 */}
              <div className="px-6 py-3 bg-dark-800 border-b border-dark-700 flex items-center gap-2 text-sm">
                <button onClick={() => setCurrentPath('/')} className="text-gray-400 hover:text-white">
                  根目录
                </button>
                {currentPath.split('/').filter(Boolean).map((part, index, arr) => (
                  <span key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <button 
                      onClick={() => setCurrentPath('/' + arr.slice(0, index + 1).join('/'))}
                      className="text-gray-400 hover:text-white"
                    >
                      {part}
                    </button>
                  </span>
                ))}
              </div>

              {/* 文件列表 */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-20">
                    <Folder className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">此文件夹为空</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 px-4 py-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer group"
                        onClick={() => file.isDir ? handleEnterFolder(file) : null}
                      >
                        {file.isDir ? (
                          <Folder className="w-8 h-8 text-yellow-500" />
                        ) : (
                          <File className="w-8 h-8 text-gray-400" />
                        )}
                        
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {file.isDir ? '文件夹' : formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* 播放按钮 (视频文件) */}
                        {!file.isDir && /\.(mp4|mkv|avi|mov|webm|m3u8)$/i.test(file.name) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayVideo(file)
                            }}
                            className="p-2 rounded-lg bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <HardDrive className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">选择或添加一个网盘</p>
              <button onClick={() => setShowAddDrive(true)} className="btn-primary">
                添加网盘
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 添加网盘弹窗 */}
      {showAddDrive && (
        <div className="modal-backdrop flex items-center justify-center">
          <div className="modal-content w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">添加网盘</h3>
              <button onClick={() => setShowAddDrive(false)} className="p-1 rounded hover:bg-dark-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">名称</label>
                <input
                  type="text"
                  className="input"
                  placeholder="我的网盘"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">类型</label>
                <select
                  className="input"
                  value={newDrive.type}
                  onChange={(e) => setNewDrive({ ...newDrive, type: e.target.value as 'alist' | 'webdav' })}
                >
                  <option value="alist">Alist</option>
                  <option value="webdav">WebDAV</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">服务器地址</label>
                <input
                  type="text"
                  className="input"
                  placeholder="http://localhost:5244"
                  value={newDrive.server}
                  onChange={(e) => setNewDrive({ ...newDrive, server: e.target.value })}
                />
              </div>

              {newDrive.type === 'alist' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Token</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="alist-xxx"
                    value={newDrive.token || ''}
                    onChange={(e) => setNewDrive({ ...newDrive, token: e.target.value })}
                  />
                </div>
              )}

              {newDrive.type === 'webdav' && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">用户名</label>
                    <input
                      type="text"
                      className="input"
                      value={newDrive.username || ''}
                      onChange={(e) => setNewDrive({ ...newDrive, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">密码</label>
                    <input
                      type="password"
                      className="input"
                      value={newDrive.password || ''}
                      onChange={(e) => setNewDrive({ ...newDrive, password: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowAddDrive(false)} className="btn-secondary flex-1">
                  取消
                </button>
                <button onClick={handleAddDrive} className="btn-primary flex-1">
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
