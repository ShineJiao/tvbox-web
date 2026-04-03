import axios from 'axios'
import type { SourceConfig, SiteBean, VideoCategory, VideoItem, VideoDetail, SearchResult } from '@/types'

// 创建 axios 实例
const request = axios.create({
  timeout: 15000,
})

// TVBox API 服务
export class TVBoxApi {
  private source: SourceConfig
  private site: SiteBean
  private spiderUrl: string

  constructor(source: SourceConfig, site: SiteBean) {
    this.source = source
    this.site = site
    this.spiderUrl = source.spider || ''
  }

  // 获取首页分类
  async getCategories(): Promise<VideoCategory[]> {
    try {
      const url = this.site.api
      
      // Spider 类型
      if (this.site.type === 4 && this.spiderUrl) {
        const response = await request.get(this.spiderUrl, {
          params: {
            api: url,
            ac: 'list',
          },
        })
        return this.parseCategories(response.data)
      }

      // CMS 类型
      if (this.site.type === 3 || this.site.type === 1) {
        const response = await request.get(url, {
          params: { ac: 'list' },
        })
        return this.parseCategories(response.data)
      }

      return []
    } catch (error) {
      console.error('获取分类失败:', error)
      return []
    }
  }

  // 获取分类内容
  async getCategoryContent(
    typeId: string,
    page: number = 1,
    filters?: Record<string, string>
  ): Promise<{ list: VideoItem[]; page: number; pagecount: number }> {
    try {
      const url = this.site.api

      // Spider 类型
      if (this.site.type === 4 && this.spiderUrl) {
        const response = await request.get(this.spiderUrl, {
          params: {
            api: url,
            ac: 'list',
            t: typeId,
            pg: page,
            ...filters,
          },
        })
        return this.parseVideoList(response.data)
      }

      // CMS 类型
      const response = await request.get(url, {
        params: {
          ac: 'list',
          t: typeId,
          pg: page,
          ...filters,
        },
      })
      return this.parseVideoList(response.data)
    } catch (error) {
      console.error('获取分类内容失败:', error)
      return { list: [], page: 1, pagecount: 1 }
    }
  }

  // 获取详情
  async getDetail(ids: string[]): Promise<VideoDetail[]> {
    try {
      const url = this.site.api

      // Spider 类型
      if (this.site.type === 4 && this.spiderUrl) {
        const response = await request.get(this.spiderUrl, {
          params: {
            api: url,
            ac: 'detail',
            ids: ids.join(','),
          },
        })
        return this.parseVideoDetail(response.data)
      }

      // CMS 类型
      const response = await request.get(url, {
        params: {
          ac: 'detail',
          ids: ids.join(','),
        },
      })
      return this.parseVideoDetail(response.data)
    } catch (error) {
      console.error('获取详情失败:', error)
      return []
    }
  }

  // 搜索
  async search(keyword: string, page: number = 1): Promise<VideoItem[]> {
    try {
      if (this.site.search === 0) {
        return []
      }

      const url = this.site.api

      // Spider 类型
      if (this.site.type === 4 && this.spiderUrl) {
        const response = await request.get(this.spiderUrl, {
          params: {
            api: url,
            ac: 'detail',
            wd: keyword,
            pg: page,
          },
        })
        const result = this.parseVideoDetail(response.data)
        return result
      }

      // CMS 类型
      const response = await request.get(url, {
        params: {
          ac: 'detail',
          wd: keyword,
          pg: page,
        },
      })
      const result = this.parseVideoDetail(response.data)
      return result
    } catch (error) {
      console.error('搜索失败:', error)
      return []
    }
  }

  // 获取播放地址
  async getPlayUrl(flag: string, id: string): Promise<{ url: string; parse: number; jx: string }> {
    try {
      const url = this.site.api

      // Spider 类型
      if (this.site.type === 4 && this.spiderUrl) {
        const response = await request.get(this.spiderUrl, {
          params: {
            api: url,
            ac: 'player',
            flag,
            id,
          },
        })
        return response.data
      }

      return { url: id, parse: 0, jx: '' }
    } catch (error) {
      console.error('获取播放地址失败:', error)
      return { url: '', parse: 0, jx: '' }
    }
  }

  // 解析分类
  private parseCategories(data: any): VideoCategory[] {
    if (data.class && Array.isArray(data.class)) {
      return data.class.map((item: any) => ({
        type_id: item.type_id?.toString() || '',
        type_name: item.type_name || '',
        type_flag: item.type_flag,
      }))
    }
    return []
  }

  // 解析视频列表
  private parseVideoList(data: any): { list: VideoItem[]; page: number; pagecount: number } {
    const list: VideoItem[] = []
    
    if (data.list && Array.isArray(data.list)) {
      for (const item of data.list) {
        list.push({
          vod_id: item.vod_id?.toString() || '',
          vod_name: item.vod_name || '',
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks,
          vod_year: item.vod_year,
          vod_area: item.vod_area,
          type_id: item.type_id?.toString(),
          type_name: item.type_name,
        })
      }
    }

    return {
      list,
      page: data.page || 1,
      pagecount: data.pagecount || 1,
    }
  }

  // 解析视频详情
  private parseVideoDetail(data: any): VideoDetail[] {
    const list: VideoDetail[] = []
    
    if (data.list && Array.isArray(data.list)) {
      for (const item of data.list) {
        list.push({
          vod_id: item.vod_id?.toString() || '',
          vod_name: item.vod_name || '',
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks,
          vod_year: item.vod_year,
          vod_area: item.vod_area,
          vod_director: item.vod_director,
          vod_actor: item.vod_actor,
          vod_content: item.vod_content,
          vod_play_from: item.vod_play_from,
          vod_play_url: item.vod_play_url,
          type_id: item.type_id?.toString(),
          type_name: item.type_name,
          vod_time: item.vod_time,
          vod_hits: item.vod_hits,
          vod_score: item.vod_score,
        })
      }
    }

    return list
  }
}

// 直播源解析
export async function fetchLiveChannels(url: string): Promise<string> {
  const response = await request.get(url)
  return response.data
}

// 批量搜索
export async function batchSearch(
  sites: Array<{ source: SourceConfig; site: SiteBean }>,
  keyword: string
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  await Promise.all(
    sites.map(async ({ source, site }) => {
      if (site.search === 0) return

      try {
        const api = new TVBoxApi(source, site)
        const items = await api.search(keyword)
        
        if (items.length > 0) {
          results.push({
            sourceKey: site.key,
            sourceName: site.name,
            items,
          })
        }
      } catch (error) {
        console.error(`搜索 ${site.name} 失败:`, error)
      }
    })
  )

  return results
}
