# TVBox Web

基于 Next.js 构建的 TVBox Web 版本，支持多数据源、直播、历史记录、收藏、弹幕等功能。

## ✨ 功能特性

- 🎬 **视频分类浏览** - 支持多分类展示和分页
- 🔍 **视频搜索** - 批量搜索多个数据源
- 📺 **视频播放** - 支持 HLS/MP4 等多种格式
- 📡 **直播功能** - 支持 M3U 直播源
- 📝 **历史记录** - 自动保存观看进度
- ❤️ **收藏功能** - 收藏喜欢的视频
- 💬 **弹幕功能** - 发送和显示弹幕
- 🔄 **多数据源** - 支持 TVBox JSON 配置格式
- 📁 **网盘功能** - 支持 WebDAV/Alist

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| UI 样式 | Tailwind CSS 3 |
| 语言 | TypeScript 4 |
| 播放器 | ArtPlayer + HLS.js |
| 状态管理 | Zustand |
| 本地存储 | LocalForage |
| 代码质量 | ESLint + Prettier + Jest |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
cd tvbox-web
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run start
```

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
docker-compose up -d
```

### 使用 Docker

```bash
docker build -t tvbox-web .
docker run -p 3000:3000 tvbox-web
```

## ☁️ Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/tvbox-web)

1. 点击上方按钮
2. 授权 Vercel
3. 点击 Deploy
4. 等待部署完成

## 📖 使用说明

### 添加数据源

1. 进入「设置」页面
2. 输入 TVBox 配置地址或导入配置文件
3. 点击「添加」

### 配置格式

```json
{
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
}
```

## 📁 项目结构

```
tvbox-web/
├── src/
│   ├── app/                 # Next.js 页面
│   │   ├── page.tsx         # 首页
│   │   ├── search/          # 搜索
│   │   ├── detail/          # 详情
│   │   ├── play/            # 播放
│   │   ├── live/            # 直播
│   │   ├── history/         # 历史
│   │   ├── collect/         # 收藏
│   │   ├── drive/           # 网盘
│   │   └── settings/        # 设置
│   ├── components/          # 组件
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具库
│   ├── stores/              # 状态管理
│   └── types/               # 类型定义
├── public/                  # 静态资源
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

## 📝 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动
npm run start

# 代码检查
npm run lint

# 格式化
npm run format

# 测试
npm run test
```

## 📄 License

MIT License
