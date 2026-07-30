# 页面路由清单

## 一、路由总览

| 路由路径 | 页面组件 | 访问权限 | 说明 |
|----------|----------|----------|------|
| `/login` | Login | 公开 | 登录页，含角色选择 |
| `/projects` | Projects | 已登录用户 | 项目管理列表（表格/卡片视图） |
| `/projects/:id` | ProjectDetail | 已登录用户 | 项目详情 |
| `/projects/:id/drawings` | Drawings | 已登录用户 | 图纸管理（目录+列表） |
| `/projects/:id/members` | Members | 已登录用户 | 项目成员管理 |
| `/projects/:id/drawings/:fileId/preview` | SketchPreview | 已登录用户 | 草图预览（旋转/缩放/全屏） |
| `/projects/:id/drawings/:fileId/dwg-preview` | DwgPreview | 已登录用户 | DWG在线预览（图层切换） |
| `/projects/:id/drawings/:fileId/ai-process` | AIProcess | 已登录用户(需出图权限) | AI处理9阶段流水线 |
| `/system/users` | CompanyUsers | admin | 公司人员管理 |
| `/system/tenants` | Tenants | super_admin | 租户管理 |
| `/system/tasks` | Tasks | admin | 并发任务管理 |
| `/system/logs` | Logs | admin | 系统日志 |
| `/system/settings` | Settings | super_admin | 系统配置 |

---

## 二、受保护路由守卫

### ProtectedRoute
- **逻辑**: 检查 `isLoggedIn` 状态
- **未登录**: 重定向到 `/login`
- **代码位置**: App.tsx

### AdminRoute
- **逻辑**: 检查 `user.role` 是否为 `super_admin` 或 `tenant_admin`
- **非管理员**: 重定向到 `/projects`
- **代码位置**: App.tsx

---

## 三、动态路由行为

### 项目级子菜单
- 初始状态: 侧边栏仅显示「项目管理」和「系统管理」
- 进入项目后: 侧边栏自动出现「图纸管理」和「项目成员管理」
- 退出项目后: 这两个菜单自动隐藏

### 角色菜单可见性

| 菜单项 | super_admin | tenant_admin | cartographer | auditor |
|--------|:-----------:|:------------:|:------------:|:-------:|
| 项目管理 | ✅ | ✅ | ✅ | ✅ |
| 图纸管理(项目内) | ✅ | ✅ | ✅ | ✅ |
| 成员管理(项目内) | ✅ | ✅ | ✅ | ✅ |
| 公司人员管理 | ✅ | ✅ | ❌ | ❌ |
| 租户管理 | ✅ | ❌ | ❌ | ❌ |
| 并发任务管理 | ✅ | ✅ | ❌ | ❌ |
| 系统日志 | ✅ | ✅ | ❌ | ❌ |
| 系统设置 | ✅ | ❌ | ❌ | ❌ |

---

## 四、路由参数说明

### 项目路由
- `:id` - 项目ID，对应 Project.id (如 p001, p002)
- `:fileId` - 图纸文件ID，对应 Drawing.id (如 f001, f004)

### 示例
```
/projects                    → 项目列表
/projects/p001              → 乌江变电站改造工程详情
/projects/p001/drawings     → 该项目的图纸管理
/projects/p001/members      → 该项目的成员管理
/projects/p001/drawings/f004/preview    → 草图预览
/projects/p001/drawings/f004/ai-process → AI处理流水线
/system/tenants             → 租户管理
```
