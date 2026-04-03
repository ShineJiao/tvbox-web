import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TVBox Web - 在线视频播放平台',
  description: '基于 Next.js 构建的 TVBox Web 版本，支持多数据源、直播、历史记录、收藏、弹幕等功能',
  keywords: ['TVBox', '视频播放', '直播', '在线观看'],
  authors: [{ name: 'TVBox' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-dark-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
