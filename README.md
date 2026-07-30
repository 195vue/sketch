# 基于AI识别与规则引导的运营商线路竣工图智能生成系统 - 原型

## 一、项目概述

本原型实现了运营商线路竣工图智能生成系统的核心功能演示，覆盖多租户管理、项目管理、图纸管理、AI识别与图纸生成、并发任务管理、系统管理等全部功能模块。

## 二、快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问系统
# 浏览器打开 http://localhost:5173
```

## 三、登录说明

- 登录页无需验证真实账号密码，任意输入即可登录
- 登录后默认以**超级管理员**身份进入系统，可查看全部页面
- 完整演示所有功能模块（项目管理、图纸管理、AI处理、系统管理等）

## 四、技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI样式**: Tailwind CSS
- **路由**: React Router v6
- **状态管理**: Zustand
- **图标**: Lucide React

## 五、项目结构

```
src/
├── components/
│   ├── layout/          # 布局组件（Header、Sidebar、Layout）
│   ├── Toast.tsx        # 全局通知组件
│   └── ...
├── pages/
│   ├── Login.tsx        # 登录页
│   ├── Projects.tsx     # 项目管理列表
│   ├── ProjectDetail.tsx # 项目详情
│   ├── Drawings.tsx     # 图纸管理
│   ├── Members.tsx      # 项目成员管理
│   ├── AIProcess.tsx    # AI处理流水线
│   ├── SketchPreview.tsx # 草图预览
│   ├── DwgPreview.tsx   # DWG预览
│   ├── Tasks.tsx        # 并发任务管理
│   ├── Tenants.tsx      # 租户管理
│   ├── CompanyUsers.tsx # 公司人员管理
│   ├── Logs.tsx         # 系统日志
│   └── Settings.tsx     # 系统配置
├── store/
│   └── useStore.ts      # 全局状态管理
├── types/
│   └── index.ts         # TypeScript类型定义
├── utils/
│   └── mockData.ts      # 模拟数据
└── App.tsx              # 路由配置
```

## 六、交付文档

- [PRD需求文档](./docs/PRD.md)
- [角色权限矩阵](./docs/PERMISSIONS.md)
- [页面路由清单](./docs/ROUTES.md)
- [数据模型说明](./docs/DATA_MODEL.md)
- [AI处理流程说明](./docs/AI_PIPELINE.md)

## 七、注意事项

1. 本原型为演示原型，所有数据为前端Mock数据
2. 登录无需真实账号密码，任意输入即可登录
3. AI处理流程为模拟动画，展示9阶段流水线
4. 支持表格/卡片视图切换
5. 响应式设计，支持不同屏幕尺寸
