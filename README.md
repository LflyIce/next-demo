# Next Demo - 卖品统计系统

TEMU 电商卖品利润统计与管理工具，支持商品录入、利润计算、分类管理等功能。

> **最近更新：2026-04-14**

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.0 | 全栈框架（App Router） |
| React | 19.2.3 | UI 框架 |
| Ant Design | 6.1.1 | UI 组件库 |
| Tailwind CSS | 4.x | 样式 |
| TypeScript | 5.x | 类型安全 |
| PostgreSQL (Vercel Postgres) | - | 数据库 |

## 功能模块

### 📊 统计表格 (`/statisticalTable`)
- 商品列表展示（分页、筛选、搜索）
- 可编辑表格：行内编辑商品信息
- 利润自动计算：输入售价/成本后自动计算利润、最低售价、折扣价
- 商品图片上传（支持粘贴图片）
- 商品分类管理
- 状态管理（在售/下架）
- 时间筛选（今天/昨天/近三天）

### 🔐 登录注册 (`/login`)
- 用户登录/注册（卡片翻转动画）
- Token 认证（24小时有效期）
- 统计表格页面受登录保护（未登录自动跳转）
- 默认账号：`admin` / `admin123`

### 📄 其他页面
- `/` — 首页
- `/about` — 关于页
- `/home` — 测试页面
- `/test` — 测试页面

## API 接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 用户登录 |
| `/api/register` | POST | 用户注册 |
| `/api/auth` | GET | 验证 Token |
| `/api/auth` | DELETE | 登出 |
| `/api/updateData` | GET | 查询商品（分页+筛选） |
| `/api/updateData` | POST | 新增/更新商品 |
| `/api/updateData` | DELETE | 删除商品 |
| `/api/itemClass` | GET | 获取商品类别 |
| `/api/itemClass` | POST | 新增商品类别 |
| `/api/addProduct` | POST | 添加商品（JSON 文件方式） |
| `/api/upload` | POST | 图片上传 |

## 数据库表结构

### `info_item` — 商品表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR | 商品ID |
| name | VARCHAR | 品名 |
| image_url | VARCHAR | 图片地址 |
| skc | VARCHAR | SKC编码 |
| model | VARCHAR | 型号/颜色 |
| link | VARCHAR | 商品链接 |
| price | NUMERIC | 申报价 |
| min_price | NUMERIC | 最低售价 |
| shipping | NUMERIC | 运费 |
| platform_subsidy | NUMERIC | 平台补贴 |
| new_discount | NUMERIC | 83折价 |
| flash_discount | NUMERIC | 85折价 |
| purchase_cost | NUMERIC | 采购成本 |
| packing_cost | NUMERIC | 打包费 |
| profit | NUMERIC | 利润 |
| status | INTEGER | 状态（1=在售, 0=下架） |
| create_time | TIMESTAMP | 创建时间 |
| class_id | INTEGER | 类别ID |

### `info_item_class` — 商品类别表
| 字段 | 类型 | 说明 |
|------|------|------|
| class_id | SERIAL | 类别ID |
| class_name | VARCHAR | 类别名称 |

### `users` — 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 用户ID |
| username | VARCHAR(50) | 用户名 |
| email | VARCHAR(100) | 邮箱 |
| password_hash | VARCHAR(64) | 密码哈希（SHA-256） |
| created_at | TIMESTAMP | 创建时间 |

### `user_tokens` — 用户令牌表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 令牌ID |
| user_id | INTEGER | 用户ID |
| token | VARCHAR(64) | 令牌 |
| expires_at | TIMESTAMP | 过期时间 |
| created_at | TIMESTAMP | 创建时间 |

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 Vercel Postgres 连接字符串

# 启动开发服务器
npm run dev
```

### 环境变量

| 变量名 | 说明 |
|--------|------|
| `POSTGRES_URL` | PostgreSQL 连接字符串 |
| `POSTGRES_URL_NON_POOLING` | 非池化连接（推荐） |

## 部署

项目部署在 [Vercel](https://vercel.com)，自动关联 GitHub 仓库，push 后自动部署。

## 更新日志

### 2026-04-14
- ✨ 新增登录/注册页面（卡片翻转动画，Vercel 风格 UI）
- ✨ 新增 Token 认证系统
- ✨ 统计表格页面登录保护（中间件）
- ✨ 用户表/令牌表自动建表
- ✨ 商品数据按用户隔离（company_id 关联 users.id）
- ✨ 新增商品导出功能（支持勾选导出，Excel/CSV 格式）
- 🔧 新增商品默认运费改为 17
- 🔧 导出图片列宽加大，图片不遮挡链接数据
- 🔧 导出按钮改为点击触发下拉，修复下拉消失问题

### 2025-12-25
- 🎉 项目初始化
- 📊 统计表格基础功能
- 🗃️ 商品 CRUD + 分类管理
