# 阶段 1: 依赖安装与构建
FROM node:20-alpine AS builder

WORKDIR /app

# 安装必要的系统库供 Prisma 与 SQLite 使用
RUN apk add --no-cache openssl gcompat libc6-compat

# 复制配置文件
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 安装所有依赖（包含 devDependencies 以用于构建）
RUN npm ci --registry=https://registry.npmmirror.com

# 复制所有源代码
COPY . .

# 生成 Prisma Client (使用内嵌 SQLite) 并构建 Next.js 生产版本
RUN npx prisma generate
RUN npm run build

# 阶段 2: 生产运行环境
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# 挂载数据卷目录的路径：为确保 db 持久化，我们在 Docker 启动时会映射此目录
ENV DATABASE_URL="file:/app/data/dev.db"

RUN apk add --no-cache openssl gcompat libc6-compat

# 只安装生产级依赖
COPY package.json package-lock.json* ./
RUN npm ci --only=production --registry=https://registry.npmmirror.com

# 复制 Next.js 构建产物和公共资源
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# 暴露挂载点：请在启动容器时使用 -v /your/local/path:/app/data 映射
VOLUME ["/app/data"]

EXPOSE 3000

# 启动脚本：先确保映射目录存在并进行可能的数据迁移，然后启动应用
CMD npx prisma db push --accept-data-loss && npx prisma db seed && npm run start
