# The Academic Monolith (2027 考研敏捷复习打卡系统)

基于极致“Mint on Stone”风格与 MD3 响应式规范构建的模块化事件驱动考研打卡系统。专为目标B区211考研设计。

## 最简极速本地运行 (秒级启动)

如果你在本地普通笔记本克隆了此代码，只需要执行以下两条命令即可实现包含独立 SQLite 数据库在内的零配置秒级运行：

```bash
# 1. 安装依赖、推送表结构并全自动播种高数、408等核心科目种子数据
npm install --registry=https://registry.npmmirror.com && npx prisma db push && npm run prisma:seed

# 2. 启动本地热更新服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

## 核心架构方案
- **All-in-One 全栈**: Next.js (App Router) + React
- **数据库**: 完全零配置 SQLite 单文件数据库，数据文件直接存于 `/prisma/dev.db`
- **ORM 管理**: Prisma
- **视觉系统**: Tailwind CSS v4 + Lucide React 图标 + Framer Motion (可选集成方案)
- **字体**: Manrope (数字标题) + Inter (数据正文)

## 一键容器化 (平滑上云) - Docker 部署

在具有 Docker 环境的轻量应用服务器上，你可以通过以下命令一件构建运行，并安全挂载数据！

```bash
# 构建镜像
docker build -t kaoyan-tracker .

# 运行容器 (暴露 3000 端口，并映射容器内的数据卷 /app/data 到宿主机绝对路径确保 DB 永久保存)
docker run -d -p 3000:3000 -v /your/absolute/host/path/data:/app/data --name kaoyantracker kaoyan-tracker
```
*(注意替换宿主机绝对路径。启动后系统会自动检测数据变化并初始化数据库)*
