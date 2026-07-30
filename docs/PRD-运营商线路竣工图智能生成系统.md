# 运营商线路竣工图智能生成系统 — 产品需求文档（PRD）

> 版本：v2.1  
> 撰写日期：2026-07-30  
> 产品经理：易裕丰  
> 状态：**开发交付版**

---

## 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| v1.0 | 2026-07-29 | 初始版本 |
| v2.0 | 2026-07-30 | 完善审核流程、角色权限分离、登录角色选择、UI改进、权限控制细化 |
| v2.1 | 2026-07-30 | AI处理改为弹窗、新增未出图Tab、引入租户管理员角色、完善数据隔离 |

### v2.0 主要变更

1. **角色权限分离**：审核员不可上传/出图，制图员不可审核，避免自审漏洞
2. **审批流程**：图纸生成后进入"待审核"状态，需审核通过才能下载
3. **登录页改进**：增加角色选择功能，支持5种角色登录
4. **图纸管理页改进**：增加状态Tab切换（全部/待审核/已完成/已驳回/处理中）
5. **项目列表改进**：显示"X待审"标签，可快速跳转到待审核图纸
6. **字典管理改进**：字典数据管理改为弹窗形式
7. **UI优化**：移除全局搜索框、缩短筛选框宽度、优化页面布局
8. **权限控制细化**：明确每个按钮的显示条件（状态+权限双重控制）
9. **系统设置完善**：补充完整的配置项、操作交互、状态逻辑
10. **审批流程独立说明**：新增4.5节详细描述图纸审批流程、权限规则、异常处理

### v2.1 主要变更

1. **AI处理改为弹窗**：单张和批量AI处理统一改为弹窗形式，移除独立处理页面，前端不再展示9步流水线
2. **新增"未出图"Tab**：图纸管理页状态Tab新增"未出图"筛选
3. **引入租户管理员角色**：新增tenant_admin角色，实现租户级数据隔离，租户管理员可管理本租户人员、任务、日志
4. **路由守卫完善**：新增TenantRoute守卫，区分系统级和租户级管理权限
5. **查看AI图权限收紧**：待审核状态仅审核员可见，已驳回状态不可见
6. **权限控制完善**：查看草图按钮添加view权限控制，成员管理操作添加configure权限控制

---

## 第一章：系统概述

### 1.1 业务背景

运营商（中国移动/中国联通/中国电信）在通信线路工程竣工阶段，需要将现场勘测草图转化为符合通信竣工图标准的DWG格式图纸。传统人工绘制方式存在以下痛点：

- **效率低**：单张图纸从草图到成品需数小时，一个项目往往涉及数百张图纸
- **标准不统一**：不同工程师绘制风格差异大，难以符合统一的出图规范
- **质量不稳定**：人工操作易出现编号重复、标注遗漏、图层混乱等问题
- **成本高**：需要大量熟练的CAD工程师

**解决方案**：基于AI识别与规则引导的运营商线路竣工图智能生成系统，通过深度学习自动识别草图中的杆位、光缆路由、分纤点等要素，自动矢量化、语义标注、分层配置，最终生成符合通信竣工图标准的DWG文件，实现"上传草图 → AI全自动出图 → 在线预览 → 一键下载"的全流程自动化。

### 1.2 用户角色定义

系统采用**系统级 + 项目级**双层权限模型：

#### 系统级角色（控制菜单访问和全局数据范围）

| 角色 | 角色标识 | 描述 |
|------|---------|------|
| 超级管理员 | `super_admin` | 系统最高权限，可管理所有租户、用户、项目、查看全部数据、配置系统设置 |
| 租户管理员 | `tenant_admin` | 仅能管理所属租户范围内的用户和项目，数据被租户隔离 |
| 普通用户 | `user` | 基础用户，无系统管理权限，需在项目中被分配具体角色 |

#### 项目级角色（控制项目内的具体操作权限）

| 角色 | 角色标识 | 描述 |
|------|---------|------|
| 项目管理员 | `project_admin` | 项目内最高权限，全流程管理：可管理成员、配置权限、上传/出图/审核/下载 |
| 制图员 | `cartographer` | 生产角色：可上传草图、提交AI出图、下载、删除、查看，**不可审核** |
| 审核员 | `auditor` | 质量把关角色：**专门负责审核图纸**，可查看、下载，**不可上传和出图**（避免自审漏洞） |
| 浏览员 | `browser` | 只读角色：仅可查看项目内图纸 |

**角色权限分离原则**：
- 制图员和审核员职责严格分离，避免自审漏洞
- 制图员负责"生产"（上传+出图），不能自己审核自己
- 审核员负责"把关"（只能审，不能出图），确保审核独立性
- 项目管理员全流程管理，可兼任两个角色

### 1.3 技术边界

| 层次 | 技术选型 | 备注 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript | 函数式组件 + Hooks |
| UI框架 | Tailwind CSS + 自定义组件库 | 无第三方组件库 |
| 路由 | React Router DOM v6 | 嵌套路由 + 路由守卫 |
| 状态管理 | Zustand | 轻量级全局状态管理 |
| 图标库 | Lucide React | 开源图标集 |
| 后端服务 | 待定（建议：Spring Boot / Node.js） | 提供RESTful API |
| AI服务 | 待定（建议：Python + PyTorch） | 9阶段AI处理流水线 |
| 数据库 | 待定（建议：PostgreSQL） | 关系型数据存储 |
| 文件存储 | 待定（建议：对象存储OSS） | 草图和DWG文件存储 |

**前端需实现的核心功能**：
- 登录状态管理（含路由守卫）
- 租户数据隔离（前端store过滤）
- 项目级权限控制（按钮/功能显隐）
- 文件上传进度展示
- AI处理流水线可视化
- DWG在线预览（需集成第三方DWG预览库）
- 全局Toast通知

---

## 第二章：全局规则

### 2.1 权限体系

#### 2.1.1 系统级权限矩阵（菜单可见性）

| 菜单 | super_admin | tenant_admin | user |
|------|-------------|-------------|------|
| 项目管理 | ✅ 可见 | ✅ 可见（限本租户） | ✅ 可见 |
| → 图纸管理（选项目后） | ✅ 可见 | ✅ 可见 | ✅ 可见（限项目成员） |
| → 项目成员管理（选项目后） | ✅ 可见 | ✅ 可见 | ❌ 不可见 |
| 系统管理 | ✅ 可见 | ✅ 可见（限本租户） | ❌ 不可见 |
| → 公司人员管理 | ✅ 可见 | ✅ 可见 | ❌ 不可见 |
| → 租户管理 | ✅ 可见 | ❌ 不可见 | ❌ 不可见 |
| → 并发任务管理 | ✅ 可见 | ✅ 可见 | ❌ 不可见 |
| → 系统日志 | ✅ 可见 | ✅ 可见（限本租户） | ❌ 不可见 |
| → 字典管理 | ✅ 可见 | ❌ 不可见 | ❌ 不可见 |
| → 系统设置 | ✅ 可见 | ❌ 不可见 | ❌ 不可见 |
| 个人中心（右上角头像） | ✅ 可见 | ✅ 可见 | ✅ 可见 |
| 消息通知（右上角铃铛） | ✅ 可见 | ✅ 可见 | ✅ 可见 |
| 退出项目按钮 | ✅ 显示 | ✅ 显示 | ✅ 显示（选项目后） |
| 退出登录按钮 | ✅ 显示 | ✅ 显示 | ✅ 显示 |

#### 2.1.2 项目级权限矩阵（功能操作）

| 功能权限 | project_admin | cartographer | auditor | browser |
|---------|:---:|:---:|:---:|:---:|
| 查看图纸（view） | ✅ | ✅ | ✅ | ✅ |
| 上传草图（upload） | ✅ | ✅ | ❌ | ❌ |
| 提交出图（generate） | ✅ | ✅ | ❌ | ❌ |
| 审核图纸（review） | ✅ | ❌ | ✅ | ❌ |
| 下载DWG（download） | ✅ | ✅ | ✅ | ❌ |
| 删除文件（delete） | ✅ | ✅ | ❌ | ❌ |
| 配置权限（configure） | ✅ | ❌ | ❌ | ❌ |
| 添加/移除成员 | ✅ | ❌ | ❌ | ❌ |
| 修改成员角色 | ✅ | ❌ | ❌ | ❌ |

**审核权限说明**：
- 图纸AI处理完成后进入"待审核"状态（status=5）
- 拥有`review`权限的角色（project_admin、auditor）可执行审核操作
- **审核员（auditor）不可上传草图和提交出图**，避免自审漏洞
- **制图员（cartographer）不可审核**，确保审核独立性
- 审核通过：图纸状态变为"已完成"（status=3），允许下载
- 审核驳回：图纸状态变为"已驳回"（status=6），需填写驳回原因
- 驳回后需重新提交AI处理才能再次进入审核流程
- 审核完成后系统自动通知提交人

### 2.2 路由守卫规则

| 守卫类型 | 适用路由 | 规则 |
|---------|---------|------|
| `ProtectedRoute` | 所有业务页面 | 未登录用户 → 重定向至 `/login` |
| `AdminRoute` | 系统级管理页面 | 仅super_admin可访问，其他角色 → 重定向至 `/projects` |
| `TenantRoute` | 租户级管理页面 | super_admin和tenant_admin可访问，其他角色 → 重定向至 `/projects` |
| 项目访问守卫 | `/projects/:id/*` | 非项目成员 → 提示无权限 |
| 动态菜单守卫 | 图纸管理/成员管理菜单 | 未选择项目时隐藏 |

**路由表**：

| 路径 | 页面 | 守卫 |
|------|------|------|
| `/login` | 登录页 | 无 |
| `/projects` | 项目管理（列表） | ProtectedRoute |
| `/projects/:id` | 项目详情 | ProtectedRoute + 项目成员校验 |
| `/projects/:id/drawings` | 图纸管理 | ProtectedRoute + 项目成员校验 |
| `/projects/:id/members` | 项目成员管理 | ProtectedRoute + project_admin校验 |
| `/projects/:id/drawings/:fileId/preview` | 草图预览 | ProtectedRoute + 项目成员校验 |
| `/projects/:id/drawings/:fileId/dwg-preview` | DWG预览 | ProtectedRoute + 项目成员校验 + view权限 |
| `/system/users` | 公司人员管理 | TenantRoute |
| `/system/tenants` | 租户管理 | AdminRoute（仅super_admin） |
| `/system/tasks` | 并发任务管理 | TenantRoute |
| `/system/logs` | 系统日志 | TenantRoute |
| `/system/dictionary` | 字典管理 | AdminRoute（仅super_admin） |
| `/system/settings` | 系统设置 | AdminRoute（仅super_admin） |
| `/profile` | 个人中心 | ProtectedRoute（所有登录用户） |
| `/notifications` | 消息通知 | ProtectedRoute（所有登录用户） |
| `*` | 其他路径 | 重定向至 `/login` |

**说明**：
- AI处理已改为弹窗形式，不再使用独立路由页面
- `AdminRoute`：仅超级管理员可访问（租户管理、字典管理、系统设置）
- `TenantRoute`：超级管理员和租户管理员均可访问（公司人员管理、并发任务管理、系统日志），租户管理员仅能看到本租户数据

### 2.3 数据隔离规则

#### 2.3.1 租户隔离

- **super_admin**：可查看所有租户的所有数据
- **tenant_admin**：仅可查看本租户下的数据（项目、任务、用户、日志）
- **隔离方式**：在Store的filteredProjects/filteredTasks中通过tenantId过滤

#### 2.3.2 项目隔离

- 每个项目独立存储草图、DWG、任务、日志、成员数据
- 非项目成员不可访问项目数据
- 退出项目后，前端清除currentProject状态，隐藏项目专属菜单

### 2.4 通用状态说明

#### 2.4.1 项目状态

| 状态值 | 状态名 | 标识色 | 说明 |
|-------|--------|--------|------|
| 1 | 进行中 | 蓝色 | 项目正在实施中 |
| 2 | 已完成 | 绿色 | 项目已通过验收 |
| 3 | 已归档 | 灰色 | 项目已归档封存 |
| 4 | 已作废 | 红色 | 项目已废弃 |

#### 2.4.2 图纸状态

| 状态值 | 状态名 | 标识色 | 说明 |
|-------|--------|--------|------|
| 1 | 未出图 | 灰色 | 草图已上传，未提交AI处理 |
| 2 | 处理中 | 蓝色（带旋转动画） | 正在AI处理流水线中 |
| 5 | 待审核 | 橙色（带时钟图标） | DWG文件已生成，等待审核员审核 |
| 3 | 已完成 | 绿色（带勾选图标） | 审核通过，DWG文件可下载 |
| 6 | 已驳回 | 红色（带拒绝图标） | 审核驳回，需修改后重新提交 |
| 4 | 异常 | 红色（带警告图标） | AI处理失败 |

#### 2.4.3 任务状态

| 状态值 | 状态名 | 标识色 | 说明 |
|-------|--------|--------|------|
| 1 | 待处理 | 灰色 | 任务已创建，排队等待执行 |
| 2 | 处理中 | 蓝色（旋转动画） | 正在AI处理中 |
| 3 | 已完成 | 绿色（勾选图标） | 任务执行成功 |
| 4 | 异常 | 红色（警告图标） | 任务执行失败 |

#### 2.4.4 在线状态

| 状态值 | 状态名 | 标识色 |
|-------|--------|--------|
| 0 | 离线 | 灰色 |
| 1 | 在线 | 绿色（带脉冲动画） |
| 2 | 忙碌 | 橙色 |

### 2.5 通用枚举值表

#### 2.5.1 操作类型枚举（ActionTypeMap）

| 标识 | 中文名 |
|------|--------|
| login | 登录 |
| logout | 登出 |
| upload | 上传草图 |
| export | 提交出图 |
| download | 下载DWG |
| delete | 删除文件 |
| add_member | 添加成员 |
| remove_member | 移除成员 |
| change_role | 角色变更 |
| update_project | 项目修改 |
| update_settings | 配置变更 |
| rename | 重命名文件 |
| config_permission | 权限配置 |
| create_tenant | 创建租户 |
| toggle_tenant | 启停用租户 |
| review_pass | 审核通过 |
| review_reject | 审核驳回 |

#### 2.5.2 项目权限枚举（PermissionMap）

| 标识 | 中文名 | 说明 |
|------|--------|------|
| upload | 上传草图 | 上传草图到项目指定目录 |
| generate | 提交出图 | 提交草图进行AI出图处理 |
| review | 审核图纸 | 审核AI生成的DWG图纸 |
| download | 下载DWG | 下载审核通过的DWG图纸文件 |
| delete | 删除文件 | 删除草图或图纸文件 |
| view | 查看图纸 | 查看、预览项目图纸 |
| configure | 配置权限 | 修改项目权限和配置 |

#### 2.5.3 AI处理阶段枚举（TaskStageMap）

| 标识 | 中文名 |
|------|--------|
| preprocessing | 预处理中 |
| ai_recognition | AI识别中 |
| vectorization | 矢量化中 |
| annotation | 标注中 |
| dwg_generation | DWG生成中 |

#### 2.5.4 图纸分类枚举

| 值 | 名称 |
|----|------|
| 1 | 干线图纸 |
| 2 | 配线图纸 |
| 3 | 引入图纸 |
| 4 | 交接箱图纸 |

#### 2.5.5 支持的文件格式

| 格式 | 说明 | 最大文件大小 |
|------|------|-------------|
| JPG | JPEG图片 | 50MB |
| PNG | PNG图片 | 50MB |
| BMP | 位图 | 50MB |
| PDF | PDF文档 | 50MB |
| TIFF | TIFF图片 | 50MB |

#### 2.5.6 字典类型枚举（DictionaryTypeMap）

| 标识 | 名称 | 说明 |
|------|------|------|
| project_status | 项目状态 | 进行中/已完成/已归档/已作废 |
| drawing_status | 图纸状态 | 未出图/处理中/已完成/异常 |
| task_status | 任务状态 | 待处理/处理中/已完成/异常 |
| task_stage | 任务阶段 | 预处理/AI识别/矢量化/标注/DWG生成 |
| drawing_category | 图纸分类 | 干线/配线/引入/交接箱 |
| file_format | 文件格式 | JPG/PNG/BMP/PDF/TIFF |
| laying_method | 敷设方式 | 架空/管道/直埋/墙上 |
| annotation_type | 标注类型 | 杆号/路由编号/分纤类型 |
| online_status | 在线状态 | 离线/在线/忙碌 |
| notification_type | 通知类型 | 出图完成/任务异常/成员变更/系统公告 |
| user_status | 用户状态 | 启用/停用 |
| permission | 项目权限 | 上传/出图/下载/删除/查看/配置 |

#### 2.5.7 通知类型枚举（NotificationTypeMap）

| 标识 | 名称 | 触发场景 |
|------|------|---------|
| drawing_pending_review | 待审核 | AI处理完成，等待审核员审核 |
| drawing_completed | 出图完成 | 审核通过，图纸可用 |
| drawing_rejected | 出图驳回 | 审核驳回，需修改重新提交 |
| drawing_failed | 出图失败 | AI处理流水线异常失败 |
| task_exception | 任务异常 | 任务执行异常，需要人工干预 |
| member_added | 成员添加 | 被添加到项目时 |
| member_removed | 成员移除 | 被移出项目时 |
| role_changed | 角色变更 | 项目角色被修改时 |
| system_notice | 系统公告 | 管理员发布系统通知 |

#### 2.5.8 字典数据结构

字典类型（DictType）：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 字典类型ID |
| code | string | 字典类型编码（唯一） |
| name | string | 字典类型名称 |
| description | string | 描述说明 |
| status | number | 状态（0-停用/1-启用） |
| itemCount | number | 字典项数量 |
| updatedAt | string | 更新时间 |

字典数据项（DictItem）：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 字典项ID |
| typeCode | string | 所属字典类型编码 |
| label | string | 显示标签 |
| value | string | 实际值 |
| sort | number | 排序值 |
| status | number | 状态（0-停用/1-启用） |
| remark | string | 备注 |

---

## 第三章：页面详细说明

### 3.1 登录页

- **路由**: `/login`
- **访问权限**: 无限制（公开页面）
- **页面组成**:
  - 顶部：系统Logo + 系统名称 + 副标题
  - 中部：登录表单
    - 用户名输入框
    - 密码输入框 + 密码可见/隐藏切换
    - **角色选择区**（5个角色选项卡片）
      - 超级管理员（紫色）：拥有所有权限
      - 项目管理员（蓝色）：本项目全权限
      - 审核员（橙色）：专门负责审核，可查看、下载，不可出图
      - 制图员（绿色）：上传草图、AI出图、下载，不可审核
      - 浏览者（灰色）：仅可查看
  - 底部：登录按钮、提示文字"任意输入用户名和密码即可登录体验，请选择对应角色"
  - 页脚：版权信息

- **数据来源**: 无（本地状态）

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击角色选项 | 选中该角色，显示角色描述 | `selectedRole`状态 |
  | 切换密码可见图标 | 切换密码显示/隐藏 | `showPassword`状态 |
  | 填写用户名/密码 | 输入内容 | `username`/`password`状态 |
  | 点击登录按钮 | 显示加载动画（Loader图标旋转） | `isLoading` → 调用`useStore.login()` → 跳转至`/projects` |
  | 任意输入提交 | 以选中的角色登录 | 设置用户信息 + `isLoggedIn=true` |

- **状态逻辑**:
  - 角色选中：选项卡片显示蓝色边框 + 浅蓝背景 + 下方显示角色描述
  - 登录中：按钮显示"登录中..."，带旋转Loader图标，按钮禁用
  - 登录失败：显示红色错误提示框（预留，当前为简化登录不验证）
  - 未登录访问其他页面：自动重定向回登录页

- **与其他页面的关联**:
  - 登录成功 → 跳转至 `/projects`（项目管理页面）
  - 已登录用户访问 `/login` → 直接重定向至 `/projects`

---

### 3.2 项目管理页

- **路由**: `/projects`
- **访问权限**: 所有已登录用户可访问
- **页面组成**:
  - **页面头部**：标题"项目管理" + 副标题 + "新建项目"按钮
  - **筛选工具栏**：搜索框 + 状态筛选下拉框 + 视图切换（表格/卡片）
  - **内容区**：根据视图模式显示项目列表
    - **表格视图**：展示项目名称、工程地址、负责人、工期、图纸数（含待审核标签）、成员数、状态、创建时间、操作列
    - **卡片视图（默认）**：上方缩略图 + 项目名称（含待审核标签） + 项目信息 + 下方操作图标组
  - **分页区**：页码、每页条数选择
  - **弹窗**：新建项目弹窗、编辑项目弹窗、删除确认弹窗

- **数据来源**:
  ```typescript
  interface Project {
    id: string;           // 项目唯一标识
    tenantId: string;     // 所属租户ID
    name: string;         // 项目名称
    address: string;      // 工程地址
    managerId: string;    // 负责人ID
    managerName: string;  // 负责人姓名
    startDate: string;    // 开始日期
    endDate: string;      // 结束日期
    status: number;       // 状态（1-4）
    remark: string;       // 备注
    drawingCount: number; // 图纸数量
    memberCount: number;  // 成员数量
    pendingReviewCount: number; // 待审核图纸数量（动态计算）
    createdAt: string;    // 创建时间
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 输入搜索关键词 | 实时过滤项目列表 | `searchKeyword` → 前端过滤 | 所有用户 |
  | 选择状态筛选 | 按状态过滤项目 | `statusFilter` → 前端过滤 | 所有用户 |
  | 切换表格视图 | 显示表格列表 | `viewMode='table'` | 所有用户 |
  | 切换卡片视图 | 显示卡片网格 | `viewMode='grid'`（默认） | 所有用户 |
  | 点击项目名称/缩略图 | 进入项目，跳转图纸管理页 | `setCurrentProject(project)` → 跳转`/projects/:id/drawings` | 所有用户 |
  | 点击"X待审"标签 | 进入项目的图纸管理页，自动筛选"待审核"状态 | 跳转`/projects/:id/drawings?filter=pending_review` | 所有用户 |
  | 点击"查看详情"图标 | 进入项目 | 同上 | 所有用户 |
  | 点击"新建项目" | 弹出新建项目弹窗 | `showModal=true` | super_admin/tenant_admin |
  | 填写新建表单 | 输入项目信息 | `formData` | - |
  | 提交新建 | 调用创建接口 → 关闭弹窗 → 刷新列表 → Toast"创建成功" | 新增项目记录 | super_admin/tenant_admin |
  | 点击编辑图标 | 弹出编辑弹窗（预填数据） | `editingProject` + `showEditModal=true` | super_admin/tenant_admin |
  | 提交编辑 | 调用更新接口 → 关闭弹窗 → 刷新列表 → Toast"修改成功" | 更新项目信息 | super_admin/tenant_admin |
  | 点击删除图标 | 弹出删除确认弹窗（显示删除影响） | `deletingProject` + `showDeleteModal=true` | super_admin/tenant_admin |
  | 确认删除 | 调用删除接口 → 关闭弹窗 → 刷新列表 → Toast"删除成功" | 删除项目及关联数据 | super_admin/tenant_admin |
  | 取消删除 | 关闭弹窗，不执行删除 | `showDeleteModal=false` | 所有用户 |

- **状态逻辑**:
  - 空数据：显示"暂无项目"空状态
  - 加载中：显示骨架屏/加载动画
  - 搜索无结果：显示"未找到匹配的项目"
  - 待审核图纸标签：当项目有待审核图纸时，显示橙色"X待审"标签（卡片视图在项目名称旁，表格视图在图纸数列内）

- **与其他页面的关联**:
  - 点击项目 → 跳转至 `/projects/:id/drawings`（图纸管理），同时侧边栏显示图纸管理和项目成员管理二级菜单
  - 点击"X待审"标签 → 跳转至 `/projects/:id/drawings?filter=pending_review`，自动筛选待审核图纸
  - 退出项目（侧边栏底部按钮）→ 返回 `/projects`，清除`currentProject`，隐藏二级菜单

---

### 3.3 图纸管理页

- **路由**: `/projects/:id/drawings`
- **访问权限**: 项目成员可访问（需`view`权限）
- **页面组成**:
  - **页面头部**：返回按钮 + 标题"图纸管理" + 项目名 + 操作按钮组
    - AI加强按钮（仅`generate`权限可见）
    - 批量出图按钮（仅`generate`权限可见，需先选择图纸）
    - 上传草图按钮（仅`upload`权限可见）
  - **状态Tab切换**（核心功能区）：
    - 全部 | 待审核(N) | 已完成(N) | 已驳回(N) | 处理中(N)
    - 每个Tab显示对应状态的图纸数量
    - "待审核"Tab用橙色高亮，方便审核员快速识别
  - **上传进度区**：显示上传进度条（上传中时显示）
  - **左侧目录区**（w-64）：目录树 + 新建目录按钮
  - **右侧内容区**：
    - 工具栏：搜索框 + 高级筛选按钮 + 视图切换
    - 高级筛选面板（展开时）：上传时间范围 + 上传人
    - 图纸列表（表格/卡片）
    - 分页区
  - **弹窗**：上传草图弹窗、新建目录弹窗、AI加强弹窗、重命名弹窗、审核弹窗

- **数据来源**:
  ```typescript
  interface Drawing {
    id: string;             // 图纸ID
    projectId: string;      // 所属项目ID
    directoryId: string;    // 所属目录ID
    name: string;           // 图纸名称
    originalName: string;   // 原始文件名
    format: string;         // 文件格式（JPG/PNG/BMP/PDF）
    size: number;           // 文件大小（字节）
    status: number;         // 状态（1-6）：1-未出图 2-处理中 5-待审核 3-已完成 6-已驳回 4-异常
    uploaderId: string;     // 上传人ID
    uploaderName: string;   // 上传人姓名
    uploadedAt: string;     // 上传时间
    dwgPath?: string;       // DWG文件路径（生成后）
    generatedAt?: string;   // DWG生成时间
    reviewedAt?: string;    // 审核时间
    reviewerId?: string;    // 审核人ID
    reviewerName?: string;  // 审核人姓名
    rejectReason?: string;  // 驳回原因（驳回时填写）
  }

  interface Directory {
    id: string;           // 目录ID
    projectId: string;    // 项目ID
    parentId: string;     // 父目录ID（根目录为空）
    name: string;         // 目录名称
    createdAt: string;    // 创建时间
    children?: Directory[]; // 子目录
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 点击返回按钮 | 返回项目管理页 | 跳转`/projects` | 所有用户 |
  | 点击"全部"Tab | 显示所有状态图纸 | `statusFilter='all'` | 所有用户 |
  | 点击"未出图"Tab | 筛选显示所有未出图状态图纸 | `statusFilter='1'` | 所有用户 |
  | 点击"处理中"Tab | 筛选显示所有处理中状态图纸 | `statusFilter='2'` | 所有用户 |
  | 点击"待审核"Tab | 筛选显示所有待审核状态图纸（橙色高亮） | `statusFilter='5'` | 所有用户 |
  | 点击"已完成"Tab | 筛选显示所有已完成状态图纸 | `statusFilter='3'` | 所有用户 |
  | 点击"已驳回"Tab | 筛选显示所有已驳回状态图纸 | `statusFilter='6'` | 所有用户 |
  | 输入搜索关键词 | 按名称过滤图纸 | `searchKeyword` → 前端过滤 | 所有用户 |
  | 点击高级筛选 | 展开/收起筛选面板 | `showAdvancedFilter` | 所有用户 |
  | 设置筛选条件 | 按时间/上传人过滤 | 各filter状态 | 所有用户 |
  | 点击"清除筛选" | 重置筛选条件 | 清空所有filter | 所有用户 |
  | 选择目录 | 过滤该目录下的图纸 | `selectedDirectory` | 所有用户 |
  | 点击"新建目录" | 弹出新建目录弹窗 | `showNewDirModal=true` | project_admin |
  | 输入目录名称 | 实时更新 | `newDirName` | - |
  | 确认创建目录 | 调用创建接口 → Toast"创建成功" | 新增目录 | project_admin |
  | 切换表格/卡片视图 | 切换列表展示方式 | `viewMode` | 所有用户 |
  | 选择单个图纸 | 勾选复选框 | `selectedDrawings` | 所有用户 |
  | 全选/反选 | 点击表头复选框 | `selectedDrawings`全量替换 | 所有用户 |
  | 点击"上传草图" | 弹出上传弹窗 | `showUploadModal=true` | upload权限 |
  | 上传弹窗-选择目录 | 下拉选择目标目录 | - | - |
  | 上传弹窗-勾选格式 | 选择允许的文件格式（JPG/PNG/PDF/BMP/TIFF/DWG参考） | - | - |
  | 上传弹窗-点击上传区 | 模拟选择文件 | `uploadFileName` | - |
  | 上传弹窗-选择图纸分类 | 下拉选择（干线/配线/引入/交接箱） | - | - |
  | 上传弹窗-自动填充上传人 | 读取当前用户 | 只读 | - |
  | 上传弹窗-填写备注 | 选填 | - | - |
  | 点击"开始上传" | 关闭弹窗 → 显示上传进度条 → 进度自动增长到100% → Toast"上传成功" | 新增图纸（status=1） | upload权限 |
  | 点击"AI加强" | 弹出AI加强弹窗 | `showAIEnhanceModal=true` | generate权限 |
  | AI加强-上传图例文件 | 支持JPG/PNG/PDF | - | - |
  | AI加强-上传规则文件 | 支持JSON/XML | - | - |
  | AI加强-填写训练描述 | 文本输入 | - | - |
  | AI加强-开始训练 | 调用训练接口 → Toast"训练已开始" | 更新模型版本 | super_admin |
  | 点击"AI处理"按钮（单张） | 弹出AI处理弹窗（显示草图信息+开始处理按钮） | `showSingleProcessModal=true` | generate权限 |
  | AI处理弹窗-点击"开始AI处理" | 调用后台AI接口 → 显示加载状态（进度条+处理时间） → 完成后显示结果图预览 | 图纸状态变为5(待审核) | generate权限 |
  | AI处理弹窗-处理成功 | 显示结果图 + "处理完成，等待审核"提示 + "前往审核"按钮 | `singleProcessStatus='success'` | - |
  | AI处理弹窗-处理失败 | 显示错误信息 + "重试"按钮 | `singleProcessStatus='error'` | - |
  | AI处理弹窗-点击"前往审核" | 关闭弹窗 → 跳转到待审核Tab | `statusFilter='5'` | - |
  | 点击"批量出图" | 弹出批量处理弹窗（显示待处理列表） | `showBatchProcessModal=true` | generate权限 |
  | 批量弹窗-点击"开始批量处理" | 逐张调用AI接口，显示每行处理状态（待处理/处理中/成功/失败） | 逐张更新状态 | generate权限 |
  | 批量弹窗-处理完成 | 显示成功/失败统计 + "前往审核"按钮 | `batchProcessStatus='completed'` | - |
  | 点击"查看草图"按钮 | 跳转草图预览页 | 跳转`/projects/:id/drawings/:fileId/preview` | view权限 |
  | 点击"查看AI图"按钮 | 跳转DWG预览页 | 跳转`/projects/:id/drawings/:fileId/dwg-preview` | view权限（按状态区分见下方规则） |
  | 点击"审核"按钮（待审核状态） | 弹出审核弹窗，显示DWG预览 + 审核表单 | `showReviewModal=true` + 预填图纸信息 | review权限（project_admin/auditor） |
  | 审核弹窗-选择审核结果 | 单选：通过/驳回 | `reviewResult` | - |
  | 审核弹窗-填写审核意见 | 文本输入框 | `reviewComment`（审核通过时选填） | - |
  | 审核弹窗-填写驳回原因 | 文本输入框（必填） | `rejectReason`（审核驳回时必填） | - |
  | 审核弹窗-确认审核通过 | 调用接口 → 图纸状态变为3(已完成) → Toast"审核通过" | `status=3` + `reviewedAt` + `reviewerName` | review权限 |
  | 审核弹窗-确认审核驳回 | 校验驳回原因非空 → 调用接口 → 图纸状态变为6(已驳回) → Toast"已驳回" | `status=6` + `rejectReason` | review权限 |
  | 点击"重新提交"按钮（已驳回状态） | 确认后重新提交AI处理 → Toast"已重新提交" | `status=2` + 清空`rejectReason`、`reviewedAt` | generate权限 |
  | 点击"重命名"按钮 | 弹出重命名弹窗 | `showRenameModal=true` + `renameValue` | generate/upload权限 |
  | 确认重命名 | 调用更新接口 → Toast"重命名成功" | 更新图纸名称 | generate/upload权限 |
  | 点击"下载"按钮 | 触发DWG文件下载（仅status=3已完成时可用）→ Toast"下载中" | - | download权限 |
  | 点击"删除"按钮 | 确认后调用删除接口 → Toast"删除成功" | 删除图纸记录 | delete权限 |

- **状态逻辑**:
  - 图纸状态为"未出图"（1）：显示AI处理按钮（需`generate`权限）+ 重命名按钮（需`generate`或`upload`权限）+ 删除按钮（需`delete`权限）
  - 图纸状态为"处理中"（2）：隐藏大部分操作按钮，显示进度提示（仅保留查看草图、重命名、删除等基础操作）
  - 图纸状态为"待审核"（5）：显示查看AI图按钮 + 审核按钮（需`review`权限）+ 重命名按钮 + 删除按钮
  - 图纸状态为"已完成"（3）：显示查看AI图按钮 + 下载按钮（需`download`权限）+ 重命名按钮 + 删除按钮
  - 图纸状态为"已驳回"（6）：显示重新提交按钮（需`generate`权限）+ 重命名按钮 + 删除按钮（显示驳回原因，**不可查看AI图**）
  - 图纸状态为"异常"（4）：隐藏大部分操作按钮，显示异常提示（仅保留查看草图、重命名、删除等基础操作）
  - **按钮权限控制规则**：
    - 审核按钮：仅当`drawing.status === 5`且用户有`review`权限（project_admin/auditor/super_admin）时显示
    - 重新提交按钮：仅当`drawing.status === 6`且用户有`generate`权限（project_admin/cartographer/super_admin）时显示
    - 下载按钮：仅当`drawing.status === 3`且用户有`download`权限时显示
    - AI处理按钮：仅当`drawing.status === 1`且用户有`generate`权限时显示
    - 查看AI图按钮：
      - `status === 5`（待审核）：仅`review`权限可见（审核员用于审核）
      - `status === 3`（已完成）：所有`view`权限可见
      - `status === 6`（已驳回）：**不可见**（驳回后需重新提交AI处理）
    - 查看草图按钮：所有`view`权限可见（不受状态限制）
    - 重命名按钮：当用户有`generate`或`upload`权限时显示（不受状态限制）
    - 删除按钮：仅当用户有`delete`权限时显示（不受状态限制）
  - 空数据：显示"暂无图纸，请先上传草图"
  - 目录为空：显示"该目录下暂无图纸"

- **与其他页面的关联**:
  - → AI处理弹窗：点击AI处理按钮（弹窗形式，不再跳转独立页面）
  - → 草图预览页：点击查看草图
  - → DWG预览页：点击查看AI处理后图纸（仅待审核/已完成状态）
  - 选中图纸 + 批量出图 → 批量处理弹窗（弹窗形式，显示每张处理状态）
  - 上传进度条完成 → 图纸状态为"未出图"，需手动点击AI处理

---

### 3.4 AI智能图纸生成（弹窗）

- **形式**: 弹窗（Modal），非独立页面
- **触发方式**: 
  - 单张：图纸列表点击"AI处理"按钮
  - 批量：选中多张后点击"批量出图"按钮
- **访问权限**: 项目成员（需`generate`权限）

#### 3.4.1 单张AI处理弹窗

- **弹窗组成**:
  - **弹窗头部**：标题"AI 智能图纸生成" + 关闭按钮（处理中不可关闭）
  - **草图信息区**：缩略图 + 图纸名称 + 文件格式和大小
  - **处理状态区**（4种状态）：
    - `idle`（待处理）：AI图标 + 说明文字 + "开始AI处理"按钮
    - `processing`（处理中）：加载动画 + 进度条（0-95%）+ 已处理时间
    - `success`（成功）：结果图预览 + "处理完成，等待审核"提示 + "关闭"/"前往审核"按钮
    - `error`（失败）：错误图标 + 错误信息 + "关闭"/"重试"按钮

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击"开始AI处理" | 调用`POST /api/ai/process` → 显示加载状态 | `singleProcessStatus='processing'` |
  | 处理中-进度更新 | 每100ms更新进度条 | `singleProcessProgress`递增 |
  | 处理成功 | 显示结果图 + 更新图纸状态为5(待审核) | `singleProcessStatus='success'` + `status=5` |
  | 处理失败 | 显示错误信息 | `singleProcessStatus='error'` |
  | 点击"重试" | 重新调用AI接口 | 重置为processing状态 |
  | 点击"前往审核" | 关闭弹窗 → 跳转待审核Tab | `statusFilter='5'` |
  | 点击"关闭" | 关闭弹窗 | 重置所有状态 |

- **状态逻辑**:
  - 处理中状态不可关闭弹窗（防止误操作）
  - 处理时间：3-5秒（模拟后台AI模型处理）
  - 处理成功率：95%（5%概率失败用于演示异常流程）
  - 处理完成后图纸状态自动变为`5`（待审核）
  - 系统自动通知审核员有新图纸待审核

#### 3.4.2 批量AI处理弹窗

- **弹窗组成**:
  - **弹窗头部**：标题"批量AI处理" + 关闭按钮
  - **待处理列表区**：显示所有选中图纸，每行包含缩略图、名称、状态标签
  - **处理状态区**（3种阶段）：
    - `idle`（待处理）：显示待处理列表 + "开始批量处理"按钮
    - `processing`（处理中）：逐张处理，每行显示状态（待处理/处理中/成功/失败）
    - `completed`（已完成）：显示成功/失败统计 + "前往审核"按钮

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击"开始批量处理" | 逐张调用AI接口 | `batchProcessStatus='processing'` |
  | 单张处理完成 | 更新该行状态为成功/失败 | 图纸状态变为5(待审核) |
  | 全部处理完成 | 显示统计结果 | `batchProcessStatus='completed'` |
  | 点击"前往审核" | 关闭弹窗 → 跳转待审核Tab | `statusFilter='5'` |
  | 点击"关闭" | 关闭弹窗 | 重置所有状态 |

- **状态逻辑**:
  - 批量处理按顺序逐张执行（非并发）
  - 每张处理时间：3-5秒
  - 单张失败不影响其他图纸继续处理
  - 处理完成后显示"成功X张，失败X张"统计

- **与其他页面的关联**:
  - ← 图纸管理页：来源页
  - → 图纸管理页（待审核Tab）：处理完成后点击"前往审核"
  - 处理完成 → 图纸状态更新为`5`（待审核）→ 通知审核员

---

### 3.5 项目成员管理页

- **路由**: `/projects/:id/members`
- **访问权限**: 项目`project_admin`角色
- **页面组成**:
  - **页面头部**：标题"项目成员管理" + 项目名 + 批量移除按钮 + 添加成员按钮
  - **统计卡片区**：总成员数、在线成员、管理员数、操作日志数
  - **Tab切换**：成员列表 / 权限配置 / 操作日志
  - **成员列表Tab**：
    - 工具栏：搜索框 + 角色筛选
    - 成员表格：复选框 + 头像 + 姓名 + 账号 + 角色Tag + 权限标签 + 在线状态（脉冲动画） + 当前操作 + 加入时间 + 操作（角色分配/编辑/移除）
  - **权限配置Tab**：
    - 角色权限矩阵表格（6权限 × 4角色，可勾选）
    - 权限说明卡片
    - 变更提示卡片（黄色警告）
    - 恢复默认/保存配置按钮
  - **操作日志Tab**：
    - 工具栏：搜索框
    - 日志表格：操作人 + 操作类型 + 操作对象 + 结果 + 时间
  - **弹窗**：添加成员弹窗（左组织树 + 右已选列表）、角色与权限设置弹窗

- **数据来源**:
  ```typescript
  interface Member {
    id: string;             // 成员记录ID
    projectId: string;      // 项目ID
    userId: string;         // 用户ID
    userName: string;       // 用户姓名
    role: string;           // 项目角色
    permissions: string[];  // 权限列表
    joinedAt: string;       // 加入时间
    onlineStatus: number;   // 在线状态（0-2）
    currentAction?: string; // 当前操作描述
  }

  interface OperationLog {
    id: string;
    projectId: string;
    projectName: string;
    userId: string;
    userName: string;
    actionType: string;     // 参考ActionTypeMap
    targetType: string;
    targetId: string;
    targetName: string;
    result: number;         // 0-失败 1-成功
    ipAddress: string;
    createdAt: string;
    detail?: string | Record<string, unknown>;
    errorMessage?: string;
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 搜索成员 | 按姓名/账号过滤 | `searchKeyword` | project_admin |
  | 按角色筛选 | 下拉选择角色 | `roleFilter` | project_admin |
  | 选择单个成员 | 勾选复选框 | `selectedMembers` | project_admin |
  | 全选/反选 | 点击表头复选框 | `selectedMembers`全量替换 | project_admin |
  | 批量移除 | 确认后调用移除接口 → Toast | 移除选中成员 | project_admin |
  | 点击"添加成员" | 弹出添加弹窗 | `showAddModal=true` | project_admin |
  | 添加弹窗-勾选成员 | 从组织树选择 | `selectedUsers` | - |
  | 添加弹窗-确认添加 | 调用添加接口 → Toast"添加N名成员" | 新增成员记录（默认browser角色） | project_admin |
  | 点击角色分配图标 | 弹出角色与权限弹窗 | `showRoleModal=true` | project_admin |
  | 选择项目角色 | 单选（project_admin/cartographer/auditor/browser） | `editingRole` | - |
  | 勾选权限 | 6项权限可多选 | `editingPermissions` | - |
  | 保存角色设置 | 调用更新接口 → Toast"角色已更新" | 更新成员角色和权限 | project_admin |
  | 点击移除图标 | 确认后调用移除接口 → Toast | 移除成员 | project_admin |
  | 切换到权限配置Tab | 显示权限矩阵 | `activeTab='permissions'` | project_admin |
  | 勾选/取消权限矩阵 | 修改角色默认权限 | `permissionMatrix` | - |
  | 恢复默认权限 | 重置为系统默认 → Toast"已恢复" | `permissionMatrix`重置 | project_admin |
  | 保存权限配置 | 调用保存接口 → Toast"已保存" | 持久化权限矩阵 | project_admin |
  | 切换到操作日志Tab | 显示操作日志列表 | `activeTab='logs'` | project_admin |

- **状态逻辑**:
  - 成员在线状态：绿色脉冲点=在线，灰色=离线，橙色=忙碌
  - 无成员：显示"暂无成员，请添加"
  - 已选成员为0时，批量移除按钮禁用

---

### 3.6 公司人员管理页

- **路由**: `/system/users`
- **访问权限**: super_admin、tenant_admin
- **页面组成**:
  - **页面头部**：标题"公司人员管理" + 新建用户按钮
  - **统计卡片**：用户总数、启用用户、管理员数量
  - **左侧组织架构区**（w-64）：部门树 + 部门人数 + 全部按钮
  - **右侧用户列表区**：
    - 工具栏：搜索框 + 角色筛选 + 状态筛选
    - 用户表格：姓名+头像 + 账号 + 所属部门 + 角色Tag + 联系方式（邮箱+电话） + 启用/停用状态 + 操作（编辑/角色设置/启停用/删除）
  - **弹窗**：新建用户弹窗、编辑用户弹窗、角色设置弹窗

- **数据来源**:
  - 组织架构树（部门 → 用户）
  - 用户基础信息（姓名、账号、邮箱、电话、部门、角色、状态）

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击部门 | 选中部门，过滤该部门用户 | `selectedDept` |
  | 点击"全部" | 清除部门筛选 | `selectedDept=null` |
  | 点击"新建用户" | 弹出新建弹窗 | `showModal=true` |
  | 填写用户信息 | 姓名*、账号*、邮箱*、手机号、部门*、角色* | `formData` |
  | 提交新建 | 调用创建接口 → Toast"创建成功" | 新增用户 |
  | 点击编辑图标 | 弹出编辑弹窗（账号只读） | `showEditModal=true` |
  | 保存修改 | 调用更新接口 → Toast"已更新" | 更新用户信息 |
  | 点击角色设置图标 | 弹出角色设置弹窗 | `showRoleModal=true` |
  | 选择系统角色 | 单选（super_admin/tenant_admin/user） | `selectedSystemRole` |
  | 保存角色 | 调用更新接口 → Toast"角色已更新" | 更新角色 |
  | 点击启停用开关 | 切换启用/停用状态 → Toast | 更新status |
  | 点击删除图标 | 确认后调用删除接口 → Toast | 删除用户 |

- **状态逻辑**:
  - 停用用户：显示灰色+停用标识，不可登录
  - 空数据：显示"暂无用户"

---

### 3.7 租户管理页

- **路由**: `/system/tenants`
- **访问权限**: 仅super_admin
- **页面组成**:
  - **页面头部**：标题"租户管理" + 新建租户按钮
  - **统计卡片**：租户总数、启用租户数、停用租户数
  - **租户表格**：租户名称+图标 + 联系人 + 联系方式（电话+邮箱） + 项目数 + 用户数 + 状态（含启停用开关） + 创建时间 + 操作（配置/编辑/删除）
  - **租户详情弹窗**：用户数、项目数、联系信息、租户配置（数据隔离/存储/用户数/API限制）、时间信息
  - **租户配置弹窗**（大尺寸）：
    - Tab: 标注规则 / 图层样式 / 出图规范
    - 标注规则Tab：杆号规则（前缀/起始值/位数/分隔符）、路由编号规则、其他标注规则
    - 图层样式Tab：杆塔图层/路由图层/设备图层（名称+颜色+线型+线宽）
    - 出图规范Tab：图框模板、比例尺、图纸规格
  - **新建租户弹窗**：租户名称*、联系人、联系电话、邮箱

- **数据来源**:
  ```typescript
  interface Tenant {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    status: number;       // 0-停用 1-启用
    projectCount: number;
    userCount: number;
    createdAt: string;
    lastActive: string;
  }

  interface TenantConfig {
    id: string;
    tenantId: string;
    annotationSettings: {
      poleNumberPrefix: string;
      poleNumberStart: number;
      poleNumberStep: number;
      routeNumberPrefix: string;
      routeNumberStart: number;
      fiberDistributionFormat: string;
      layingMethodFormat: string;
    };
    layerSettings: LayerConfig[];
    exportSettings: {
      frameTemplate: string;
      scale: string;
      legendItems: string[];
      paperSize: string;
    };
    updatedAt: string;
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击租户名称 | 弹出租户详情弹窗 | `selectedTenant` |
  | 点击启停用开关 | 确认后切换状态 → Toast | 更新status |
  | 点击"配置"图标 | 弹出租户配置弹窗 | `showConfigModal=true` |
  | 配置弹窗-切换Tab | 切换配置面板 | `activeConfigTab` |
  | 修改配置项 | 实时更新表单 | config各字段 |
  | 保存配置 | 调用保存接口 → Toast"保存成功" | 持久化租户配置 |
  | 点击"新建租户" | 弹出新建弹窗 | `showModal=true` |
  | 提交新建 | 调用创建接口 → Toast"创建成功" | 新增租户 |
  | 点击编辑图标 | 预留编辑功能 | - |
  | 点击删除图标 | 确认后删除 → Toast | 删除租户 |

---

### 3.8 并发任务管理页

- **路由**: `/system/tasks`
- **访问权限**: super_admin、tenant_admin
- **页面组成**:
  - **页面头部**：标题"任务管理" + 刷新按钮
  - **筛选工具栏**：搜索框 + 租户筛选 + 项目筛选 + 任务类型筛选 + 状态筛选 + 任务总数
  - **统计卡片**：待处理数、处理中数、已完成数、异常数
  - **任务表格**：图纸名称 + 所属项目 + 提交人 + 提交时间 + 当前阶段 + 状态 + 进度条 + 操作（查看原因/重新提交）
  - **任务详情弹窗**：
    - 基本信息卡片：所属项目、所属租户、提交人、提交时间、当前阶段、任务类型
    - 处理进度：整体进度 + 三段进度（图纸解析/特征提取/DWG生成）
    - 异常信息卡片（异常状态时显示）
    - 处理日志：时间线（创建→开始处理→完成）
    - 操作按钮：查看图纸（完成时）/重新提交（异常且重试<3）/联系技术支持（重试>=3）

- **数据来源**:
  ```typescript
  interface Task {
    id: string;
    drawingId: string;
    drawingName: string;
    projectId: string;
    projectName: string;
    status: number;       // 1-4
    stage: string;        // 当前阶段标识
    progress: number;     // 0-100
    submitterId: string;
    submitterName: string;
    submittedAt: string;
    startedAt?: string;
    completedAt?: string;
    exceptionReason?: string;
    retryCount: number;   // 已重试次数，上限3
    stages?: {
      drawingParsing?: number;
      featureExtraction?: number;
      dwgGeneration?: number;
    };
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 点击刷新按钮 | 刷新任务列表 | `isRefreshing` → 1.5s后恢复 |
  | 点击任务行 | 弹出任务详情弹窗 | `selectedTask` |
  | 异常任务-查看原因 | 悬停显示Tooltip（异常原因） | - |
  | 异常任务-重新提交 | 确认后重新提交 → Toast | `retryCount+1`，重置状态为待处理 |
  | 重试>=3-重新提交 | 按钮禁用，Toast"超过重试上限" | - |
  | 完成任务-查看图纸 | 跳转DWG预览页 | 跳转`/projects/:id/drawings/:fileId/dwg-preview` |

---

### 3.9 系统日志页

- **路由**: `/system/logs`
- **访问权限**: super_admin、tenant_admin（tenant_admin限本租户）
- **页面组成**:
  - **页面头部**：标题"操作日志" + 导出日志按钮
  - **筛选工具栏**：搜索框 + 操作人筛选 + 操作类型筛选 + 日期范围
  - **统计卡片**：日志总数、操作成功数、操作失败数、涉及用户数
  - **日志表格**：时间 + 操作人（头像首字母+姓名） + 操作类型Tag + 操作对象 + 结果Tag + IP地址 + 详情按钮
  - **日志详情弹窗**：
    - 基本信息卡片：操作人、操作时间、IP地址、操作结果
    - 操作信息：操作类型、操作对象、所属项目
    - 详细信息：detail字段JSON展示
    - 错误信息卡片（失败时显示）
    - 请求信息：User-Agent、请求路径、请求方法、响应时间
  - **导出警告弹窗**：数据量>10000条时提示

- **操作交互**:
  | 操作 | 触发 | 更新 |
  |------|------|------|
  | 输入搜索关键词 | 按操作对象过滤 | `searchKeyword` |
  | 筛选操作人 | 下拉选择 | `userFilter` |
  | 筛选操作类型 | 下拉选择 | `actionFilter` |
  | 选择日期范围 | 开始日期 + 结束日期 | `dateRange` |
  | 点击"查看详情" | 弹出详情弹窗 | `selectedLog` |
  | 点击"导出日志" | 数据量>10000时弹警告，否则触发导出 | 生成CSV下载 |
  | 详情页-导出单条 | 导出当前日志 | 生成单条日志下载 |

---

### 3.10 系统设置页

- **路由**: `/system/settings`
- **访问权限**: 仅super_admin
- **页面组成**:
  - **页面头部**：标题"系统设置" + 副标题 + 保存按钮
  - **系统基础配置区**：
    - 最大上传大小（MB）：数字输入框，默认50MB，范围10-200MB
    - 任务超时时间（分钟）：数字输入框，默认60分钟，范围10-300分钟
    - 日志保留天数：数字输入框，默认90天，范围7-365天
    - 登录失败锁定次数：数字输入框，默认5次，范围3-10次
    - 锁定时长（分钟）：数字输入框，默认30分钟，范围5-1440分钟
  - **全局开关区**：
    - 数据加密开关（Switch）：开启后所有敏感数据加密存储，默认关闭
    - 操作日志记录开关（Switch）：开启后记录所有操作日志，默认开启
    - IP白名单开关（Switch）：开启后仅允许白名单IP访问，默认关闭
    - 并发任务限制（数字输入框）：最大同时处理任务数，默认5，范围1-20
  - **AI模型配置区**：
    - 当前模型版本：只读显示（如v1.2.0）
    - 训练数据量：只读显示（如10000张）
    - 最后训练时间：只读显示
    - 模型路径：只读显示
  - **保存按钮**：全局保存配置

- **数据来源**:
  ```typescript
  interface SystemSettings {
    maxUploadSize: number;      // 最大上传大小（MB）
    taskTimeout: number;        // 任务超时时间（分钟）
    logRetentionDays: number;   // 日志保留天数
    loginFailedLockCount: number; // 登录失败锁定次数
    lockDuration: number;       // 锁定时长（分钟）
    enableEncryption: boolean;  // 数据加密开关
    enableLogRecord: boolean;   // 操作日志记录开关
    enableIpWhitelist: boolean; // IP白名单开关
    maxConcurrentTasks: number; // 最大并发任务数
    aiModelVersion: string;    // AI模型版本
    aiModelPath: string;        // AI模型路径
    trainingDataCount: number;  // 训练数据量
    lastTrainingTime: string;   // 最后训练时间
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 修改基础配置 | 改变输入框数值 | `settings`各字段实时更新 | super_admin |
  | 切换数据加密开关 | 开启/关闭 | `enableEncryption` | super_admin |
  | 切换日志记录开关 | 开启/关闭 | `enableLogRecord` | super_admin |
  | 切换IP白名单开关 | 开启/关闭（开启需配置白名单） | `enableIpWhitelist` + 弹出白名单配置弹窗 | super_admin |
  | 修改并发任务数 | 改变输入数值 | `maxConcurrentTasks` | super_admin |
  | 点击保存按钮 | 校验所有配置项 → 调用保存接口 → Toast"保存成功" | 持久化所有配置 | super_admin |
  | 保存失败 | 校验不通过（如数值超出范围） → 显示红色错误提示 | - | super_admin |

- **状态逻辑**:
  - 配置项修改后未保存：页面顶部显示黄色"有未保存的修改"提示条
  - 数值输入框超出范围：显示红色边框 + 提示"请输入X-Y之间的数值"
  - IP白名单开启但无白名单：保存时提示"请先配置IP白名单"
  - AI模型信息：只读展示，需通过AI加强功能页更新

- **与其他页面的关联**:
  - 配置保存后，全局生效：影响上传限制、任务超时、日志保留等
  - 并发任务数修改：影响并发任务管理页的调度

---

### 3.11 草图预览页

- **路由**: `/projects/:id/drawings/:fileId/preview`
- **访问权限**: 项目成员（需`view`权限）
- **页面组成**:
  - 顶部：返回按钮 + 图纸名称 + 格式 + 大小 + 操作按钮
  - 中部：草图预览区（支持缩放、旋转、全屏查看）
  - 底部：缩放控制栏

- **操作交互**:
  - 点击返回 → 返回图纸管理页
  - 放大/缩小 → 调整预览缩放
  - 旋转 → 旋转预览图像
  - 全屏 → 全屏预览

---

### 3.12 DWG预览页

- **路由**: `/projects/:id/drawings/:fileId/dwg-preview`
- **访问权限**: 项目成员（需`view`权限）
- **页面组成**:
  - 顶部：返回按钮 + 图纸名称 + 状态 + 下载按钮
  - 中部：DWG在线预览区（需第三方DWG预览库）
  - 图层控制面板：显示/隐藏各图层（杆路层/光缆层/分纤层/标注层/辅助层）
  - 测量工具：距离测量、坐标查询
  - 缩放控制栏

- **操作交互**:
  - 切换图层可见性 → 控制图层显示
  - 点击下载 → 下载DWG文件
  - 测量距离 → 两点间距离测量
  - 查询坐标 → 点击获取坐标

---

### 3.13 字典管理页

- **路由**: `/system/dictionary`
- **访问权限**: 仅super_admin
- **页面组成**:
  - **页面头部**：标题"字典管理" + 副标题 + 刷新按钮
  - **使用说明卡片**：
    - 字典类型：定义字典的分类，如"项目状态"、"图纸状态"等
    - 字典数据：在类型下的具体选项，如"项目状态"下的"规划中"、"进行中"、"已完成"等
    - 操作指引：在"字典类型管理"中点击「数据」按钮，可快速跳转到对应类型的字典数据进行维护
  - **字典类型列表区**（主内容区）：
    - 工具栏：搜索框 + 状态筛选 + 新建字典类型按钮
    - 字典类型表格：编码 + 名称 + 描述 + 字典项数 + 状态（启用/停用开关） + 更新时间 + 操作（编辑/删除/**数据**/删除）
    - 弹窗：新建字典类型弹窗、编辑字典类型弹窗
  - **字典数据管理弹窗**（点击「数据」按钮打开）：
    - 弹窗头部：标题"字典数据管理" + 当前类型信息（名称、编码、数据条数） + 关闭按钮
    - 工具栏：搜索框 + 状态筛选 + 新建字典项按钮
    - 字典数据表格：标签 + 值 + 所属类型 + 排序 + 状态（启用/停用开关） + 备注 + 操作（编辑/删除）
    - 底部操作：关闭按钮

- **数据来源**:
  ```typescript
  interface DictType {
    id: string;              // 字典类型ID
    code: string;            // 编码（唯一）
    name: string;            // 名称
    description: string;     // 描述
    status: number;          // 0-停用/1-启用
    itemCount: number;       // 字典项数量
    updatedAt: string;       // 更新时间
  }

  interface DictItem {
    id: string;              // 字典项ID
    typeCode: string;        // 所属字典类型编码
    label: string;           // 显示标签
    value: string;           // 实际值
    sort: number;            // 排序值
    status: number;          // 0-停用/1-启用
    remark: string;          // 备注
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 搜索字典类型 | 按编码/名称过滤 | `searchKeyword` | super_admin |
  | 状态筛选 | 按启用/停用过滤 | `statusFilter` | super_admin |
  | 点击"新建字典类型" | 弹出新建弹窗 | `showTypeModal=true` | super_admin |
  | 填写类型信息 | 编码*、名称*、描述、状态 | `formData` | - |
  | 提交新建类型 | 调用创建接口 → Toast"创建成功" | 新增字典类型 | super_admin |
  | 点击编辑类型 | 弹出编辑弹窗（预填数据） | `editingType` + `showTypeModal=true` | super_admin |
  | 保存编辑类型 | 调用更新接口 → Toast"修改成功" | 更新字典类型 | super_admin |
  | 点击启用/停用开关 | 切换状态 → Toast | 更新status | super_admin |
  | 点击删除类型 | 弹出确认弹窗 → 确认后删除 → Toast"删除成功" | 删除字典类型及关联数据项 | super_admin |
  | 点击「数据」按钮 | 打开字典数据管理弹窗，自动加载该类型数据 | `showDataModal=true` + `selectedTypeCode` | super_admin |
  | 弹窗内-搜索字典数据 | 按标签/值过滤 | `itemSearchKeyword` | super_admin |
  | 弹窗内-状态筛选 | 按启用/停用过滤 | `itemStatusFilter` | super_admin |
  | 弹窗内-点击"新建字典项" | 弹出新建弹窗 | `showItemModal=true` | super_admin |
  | 弹窗内-填写字典项 | 标签*、值*、排序、状态、备注 | `itemFormData` | - |
  | 弹窗内-提交新建项 | 调用创建接口 → Toast"创建成功" | 新增字典项 + 对应类型itemCount+1 | super_admin |
  | 弹窗内-点击编辑项 | 弹出编辑弹窗 | `editingItem` + `showItemModal=true` | super_admin |
  | 弹窗内-保存编辑项 | 调用更新接口 → Toast"修改成功" | 更新字典项 | super_admin |
  | 弹窗内-点击启用/停用项开关 | 切换状态 → Toast | 更新status | super_admin |
  | 弹窗内-点击删除项 | 确认后删除 → Toast | 删除字典项 + 对应类型itemCount-1 | super_admin |
  | 弹窗内-点击关闭按钮 | 关闭字典数据管理弹窗 | `showDataModal=false` | super_admin |
  | 点击刷新按钮 | 重新加载所有字典数据 | `isRefreshing=true` → 1s后恢复 | super_admin |

- **状态逻辑**:
  - 空数据：显示"暂无字典数据，请新建"
  - 字典类型为空时，不显示「数据」按钮
  - 停用的字典类型/数据项在前端渲染时过滤（仅显示启用项）
  - 系统内置字典类型（如project_status、drawing_status等）的编码不可修改，但可新增/删除数据项

- **与其他页面的关联**:
  - 字典数据变化后，所有使用该字典的页面（项目管理、图纸管理、任务管理等）重新加载枚举值
  - 前端通过 `/api/dict/{typeCode}` 接口获取字典数据，缓存5分钟

---

### 3.14 个人中心页

- **路由**: `/profile`
- **访问权限**: 所有已登录用户可访问（通过右上角头像下拉进入）
- **页面组成**:
  - **页面头部**：标题"个人中心" + 返回按钮
  - **Tab切换**：基本信息 / 修改密码 / 我的日志
  - **基本信息Tab**：
    - 头像区（左侧）：大尺寸头像 + 姓名 + 系统角色标签 + 所属租户
    - 信息表单（右侧）：姓名（可修改）、账号（只读）、邮箱、手机号、所属部门（只读）、系统角色（只读）、状态（只读）
    - 保存按钮
  - **修改密码Tab**：
    - 旧密码输入框*
    - 新密码输入框*（含密码强度指示：弱/中/强）
    - 确认新密码输入框*
    - 密码要求提示（长度≥8位、包含字母和数字）
    - 提交按钮
  - **我的日志Tab**：
    - 工具栏：时间范围筛选 + 操作类型筛选
    - 统计卡片：总操作数、成功数、失败数
    - 日志表格：时间 + 操作类型Tag + 操作对象 + 结果Tag + IP地址

- **数据来源**:
  - 当前登录用户信息（从store获取）
  - 当前用户的操作日志（按userId过滤的OperationLog）

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 切换Tab | 切换基本信息/修改密码/我的日志 | `activeTab` | 所有用户 |
  | 修改基本信息 | 修改姓名、邮箱、手机号 | `formData` | 所有用户 |
  | 保存基本信息 | 调用更新接口 → Toast"保存成功" | 更新用户信息 | 所有用户 |
  | 修改密码-输入旧密码 | 输入 | `oldPassword` | - |
  | 修改密码-输入新密码 | 输入，实时显示密码强度 | `newPassword` + `passwordStrength` | - |
  | 修改密码-确认新密码 | 输入，实时比对 | `confirmPassword` + `passwordMatch` | - |
  | 提交修改密码 | 校验通过后调用接口 → Toast"密码修改成功" → 清除密码字段 | 更新密码 | 所有用户 |
  | 密码强度校验 | 长度<8为弱，8-12含字母+数字为中，>12含大小写+数字+符号为强 | 显示强度条 | - |
  | 密码不一致 | 新密码与确认密码不同时显示红色提示 | 显示错误信息 | - |
  | 查询我的日志 | 按时间范围和操作类型筛选 | `logFilters` | 所有用户 |

- **状态逻辑**:
  - 基本信息Tab：账号、系统角色、所属部门为只读状态，不可修改
  - 修改密码Tab：密码强度实时反馈（灰色=弱，黄色=中，绿色=强）
  - 密码不一致时提交按钮禁用
  - 我的日志为空时显示"暂无操作记录"
  - 登录后首次修改密码可强制要求（可配置）

- **与其他页面的关联**:
  - 从右上角头像下拉 → 点击"个人中心" → 跳转至 `/profile`
  - 修改密码成功后，下次登录需使用新密码
  - 我的日志数据来源于系统日志表中当前用户的记录

---

### 3.15 消息通知页

- **路由**: `/notifications`
- **访问权限**: 所有已登录用户可访问（通过右上角铃铛图标进入）
- **页面组成**:
  - **页面头部**：标题"消息通知" + 返回按钮 + 全部标为已读按钮
  - **Tab切换**：全部 / 待审核 / 出图完成 / 出图驳回 / 出图失败 / 任务异常 / 成员变更 / 系统公告
  - **统计卡片**：未读消息数、今日消息数、本周消息数
  - **通知列表**：
    - 通知卡片：图标 + 标题 + 内容摘要 + 相关项目/图纸 + 时间 + 状态（未读=蓝色小圆点） + 操作（查看/删除）
    - 未读消息高亮背景色
    - 按时间倒序排列
  - **分页/加载更多**

- **数据来源**:
  ```typescript
  interface Notification {
    id: string;
    type: string;          // 参考NotificationTypeMap
    title: string;
    content: string;
    relatedProjectId?: string;
    relatedProjectName?: string;
    relatedDrawingId?: string;
    relatedDrawingName?: string;
    read: boolean;         // 是否已读
    createdAt: string;
  }
  ```

- **操作交互**:
  | 操作 | 触发 | 更新 | 权限 |
  |------|------|------|------|
  | 点击铃铛图标 | 展开消息预览弹窗（最近5条未读） | `showPreview=true` | 所有用户 |
  | 消息预览弹窗-点击消息 | 跳转至消息通知页并标记为已读 | 跳转`/notifications` + 调用标记已读接口 | 所有用户 |
  | 消息预览弹窗-点击"查看全部" | 跳转至消息通知页 | 跳转`/notifications` | 所有用户 |
  | 切换Tab | 按类型筛选通知 | `activeTab` | 所有用户 |
  | 点击"全部标为已读" | 调用批量标记接口 → Toast"已标记" | 所有通知`read=true` + 未读数归0 | 所有用户 |
  | 点击单条通知 | 标记为已读 + 跳转到相关页面 | `read=true` + 跳转相关页面 | 所有用户 |
  | 点击通知的"查看"按钮 | 标记已读 + 跳转 | 同上 | 所有用户 |
  | 点击通知的"删除"按钮 | 确认后删除 → Toast"删除成功" | 删除通知 | 所有用户 |
  | 清除筛选 | 重置Tab为"全部" | `activeTab='all'` | 所有用户 |

- **不同类型通知的跳转目标**:
  | 通知类型 | 点击后跳转 |
  |---------|----------|
  | drawing_pending_review | `/projects/:id/drawings`（筛选待审核图纸） |
  | drawing_completed | `/projects/:id/drawings/:fileId/dwg-preview` |
  | drawing_rejected | `/projects/:id/drawings/:fileId/dwg-preview`（查看驳回原因） |
  | drawing_failed | `/projects/:id/drawings`（查看异常图纸） |
  | task_exception | `/system/tasks`（定位异常任务） |
  | member_added | `/projects/:id/members`（查看成员列表） |
  | member_removed | `/projects/:id`（已被移除，仅提示） |
  | role_changed | `/profile`（查看新权限） |
  | system_notice | 无跳转，仅显示内容 |

- **状态逻辑**:
  - 铃铛图标右上角显示未读消息数（红色Badge）
  - 未读消息：蓝色小圆点 + 浅蓝背景
  - 已读消息：无特殊标记，白色背景
  - 空数据：显示"暂无通知"
  - 消息预览弹窗（铃铛点击）：
    - 最多显示最近5条未读
    - 底部显示未读总数 + "查看全部"链接
    - 超过5条时显示"还有N条未读"
  - 新消息实时推送（WebSocket，原型阶段用轮询模拟）

- **与其他页面的关联**:
  - 从右上角铃铛 → 点击 → 弹出消息预览
  - 消息预览 → 点击通知 → 标记已读 + 跳转相关业务页面
  - 消息通知页 → 点击"查看" → 跳转到对应业务页面
  - AI处理完成/失败 → 自动生成通知推送给提交人
  - 成员变更 → 自动生成通知推送给当事人

---

## 第四章：核心业务流程

### 4.1 AI出图全流程

```
用户上传草图 → 系统校验文件格式/大小 → 存储草图（status=1"未出图"）
    ↓
用户在图纸列表点击"AI处理"按钮（单张或批量）
    ↓
┌── 单张处理（弹窗形式）：
│   弹出AI处理弹窗 → 显示草图信息
│   → 点击"开始AI处理"按钮
│   → 调用后台AI接口（POST /api/ai/process）
│   → 弹窗内显示加载状态（进度条+处理时间，3-5秒）
│   → 处理完成：弹窗内显示结果图预览
│   → 图纸状态变为"待审核"(5)
│   → 显示"处理完成，等待审核"提示
│   → 可点击"前往审核"跳转到待审核Tab
│
└── 批量处理（弹窗形式）：
    选中多张草图 → 点击"批量出图"按钮
    → 弹出批量处理弹窗（显示待处理列表）
    → 点击"开始批量处理"
    → 逐张调用AI接口，每行显示处理状态（待处理/处理中/成功/失败）
    → 处理完成：显示成功/失败统计
    → 所有成功图纸状态变为"待审核"(5)
    → 可点击"前往审核"跳转到待审核Tab
    ↓
系统自动通知审核员有新图纸待审核（drawing_pending_review通知）
    ↓
审核员进入图纸管理页 → 在"待审核"Tab中找到该图纸 → 执行审核
    ↓
┌── 审核通过 → Drawing状态→3"已完成" + 允许下载DWG
└── 审核驳回 → Drawing状态→6"已驳回" + 填写驳回原因 + 通知提交人
    ↓
如被驳回 → 制图员修改后重新提交 → Drawing状态→2"处理中" → 重新进入AI处理流程
```

**关键变更说明**：
- AI处理从独立页面改为弹窗形式，不再跳转路由
- 前端不展示后台9步处理流水线，仅显示加载状态和最终结果
- 单张和批量处理统一为弹窗交互，体验一致

**AI接口说明**：
- **接口地址**：`POST /api/ai/process`
- **请求参数**：
  ```json
  {
    "drawingId": "图纸ID",
    "projectId": "项目ID",
    "sketchUrl": "草图文件URL"
  }
  ```
- **响应结果**：
  ```json
  {
    "success": true,
    "dwgUrl": "生成的DWG文件URL",
    "previewUrl": "预览图URL",
    "processingTime": 3.5
  }
  ```
- **处理时间**：3-5秒（后台AI模型处理）
- **前端展示**：仅显示加载状态和最终结果，不暴露后台处理细节

**异常处理**：
- AI接口超时（>10秒）→ 显示"处理超时，请重试" → 图纸状态保持"未出图"
- AI接口返回错误 → 显示错误信息 → 图纸状态保持"未出图"
- 网络异常 → 显示"网络连接失败" → 提供重试按钮
- 重复提交 → 前端禁用按钮，防止重复调用
- 审核超时未处理 → 系统每24小时提醒审核员

**权限控制要点**：
- 制图员（cartographer）：可提交AI处理（generate权限），但不可审核（无review权限）
- 审核员（auditor）：可执行审核操作（review权限），但不可提交AI处理（无generate权限）
- 项目管理员（project_admin）：可执行全部操作
- 浏览员（browser）：仅可查看，不可提交AI处理或审核

### 4.2 项目创建与成员管理流程

```
管理员点击"新建项目" → 填写项目信息（名称/地址/负责人/工期/备注）
    ↓
提交创建 → 生成Project记录（status=1"进行中"） → 自动创建"根目录"
    ↓
进入项目 → 侧边栏显示图纸管理 + 项目成员管理菜单
    ↓
点击"项目成员管理" → 点击"添加成员"
    ↓
从公司组织架构树中勾选成员 → 确认添加
    ↓
新成员默认角色为"浏览员" → 分配项目角色（project_admin/cartographer/auditor/browser）
    ↓
配置项目级权限矩阵（6项权限 × 4角色）
    ↓
成员可在项目内执行对应权限的操作
    ↓
退出项目 → 清除currentProject → 隐藏二级菜单
```

### 4.3 并发任务调度流程

```
多个用户同时提交出图请求
    ↓
系统接收所有请求 → 每条创建Task记录（status=1）
    ↓
任务队列按提交时间排序（先进先出）
    ↓
调度系统分配云端算力资源（并发数上限可配置）
    ↓
同一时刻最多N个任务处于"处理中"状态
    ↓
排队中的任务显示"待处理"状态
    ↓
任务完成/异常后 → 队列中下一个任务自动进入"处理中"
    ↓
管理员在任务管理页可查看：
    - 实时进度和阶段
    - 异常任务标记（红色背景 + 警告图标）
    - 异常任务支持重试（上限3次）
    - 重试超上限提示联系技术支持
```

### 4.4 租户管理流程

```
super_admin创建租户 → 填写租户信息（名称/联系人/电话/邮箱）
    ↓
租户初始状态为"启用" → 分配存储空间/用户数上限/API限制
    ↓
为租户创建独立的数据隔离空间
    ↓
配置租户级全局参数：
    - 标注规则（杆号/路由编号规则）
    - 图层样式（颜色/线型/线宽）
    - 出图规范（图框/比例尺/图纸规格）
    ↓
租户管理员登录 → 仅能看到本租户的项目/用户/任务
    ↓
可通过启停用开关暂停整个租户的服务
    ↓
停用后 → 该租户下所有用户无法登录
```

### 4.5 图纸审批流程

```
AI处理完成 → 图纸状态变为"待审核"(5) → 系统通知审核员（drawing_pending_review通知）
    ↓
审核员登录系统 → 进入对应项目的图纸管理页
    ↓
在"待审核"Tab中看到所有待审核图纸（橙色高亮标签显示数量）
    ↓
审核员点击"查看AI图" → 预览DWG文件内容
    ↓
审核员点击"审核"按钮 → 弹出审核弹窗
    ↓
审核弹窗显示：
    - 图纸基本信息（名称、上传人、上传时间、AI处理完成时间）
    - DWG文件预览区域
    - 审核表单（审核结果单选：通过/驳回）
    - 审核意见输入框（选填）
    - 驳回原因输入框（驳回时必填）
    ↓
┌── 审核通过：
│   1. 选择"通过"
│   2. 可填写审核意见（选填）
│   3. 点击"确认通过"
│   4. 系统校验review权限 → 更新图纸状态为"已完成"(3)
│   5. 记录审核人、审核时间
│   6. 通知提交人"出图完成"（drawing_completed通知）
│   7. 图纸解锁下载权限
│   ↓
└── 审核驳回：
    1. 选择"驳回"
    2. 必填驳回原因（不填写则提示"请填写驳回原因"）
    3. 可填写审核意见（选填）
    4. 点击"确认驳回"
    5. 系统校验review权限 + 驳回原因非空 → 更新图纸状态为"已驳回"(6)
    6. 记录审核人、审核时间、驳回原因
    7. 通知提交人"出图驳回"（drawing_rejected通知，附带驳回原因）
    ↓
提交人收到驳回通知 → 进入图纸管理页"已驳回"Tab
    ↓
查看驳回原因 → 修改草图或调整AI参数
    ↓
点击"重新提交" → 确认后图纸状态变为"处理中"(2)
    ↓
重新进入AI处理流程 → 处理完成后再次进入审核流程
```

**审批流程权限规则**：
| 操作 | project_admin | auditor | cartographer | browser |
|------|:---:|:---:|:---:|:---:|
| 查看待审核图纸 | ✅ | ✅ | ✅ | ✅ |
| 执行审核（通过/驳回） | ✅ | ✅ | ❌ | ❌ |
| 查看驳回原因 | ✅ | ✅ | ✅ | ✅ |
| 重新提交驳回图纸 | ✅ | ❌ | ✅ | ❌ |
| 下载已通过图纸 | ✅ | ✅ | ✅ | ❌ |

**审批流程异常处理**：
- 审核人权限被吊销 → 待审核图纸重新分配给其他审核员
- 审核超时（超过72小时未处理） → 系统自动提醒审核员 + 通知项目管理员
- 审核人角色变更为非审核角色 → 已分配审核任务转交给项目管理员
- 驳回原因为空 → 前端校验阻止提交，提示"请填写驳回原因"

---

## 第五章：数据闭环说明

### 5.1 数据实体关系图（ER描述）

```
┌──────────┐       1:N       ┌──────────────┐
│  Tenant  │─────────────────→│   Project    │
│  租户    │                   │   项目       │
└────┬─────┘                   └──────┬───────┘
     │                                │
     │ 1:N                            │ 1:N
     ↓                                ↓
┌──────────┐                   ┌──────────────┐
│   User   │                   │  Directory   │
│   用户    │                   │   目录       │
└────┬─────┘                   └──────┬───────┘
     │                                │
     │ N:M（通过Member）               │ 1:N
     ↓                                ↓
┌──────────┐                   ┌──────────────┐
│  Member  │                   │   Drawing    │
│  成员    │                   │   图纸       │
└────┬─────┘                   └──────┬───────┘
     │                                │
     │ 1:N                            │ 1:N
     ↓                                ↓
┌──────────┐                   ┌──────────────┐
│Operation │                   │    Task      │
│  Log     │                   │   任务       │
│操作日志  │                   │              │
└──────────┘                   └──────────────┘

┌──────────────┐       1:N       ┌──────────────┐
│  DictType    │─────────────────→│  DictItem    │
│ 字典类型     │                   │  字典数据项  │
└──────────────┘                   └──────────────┘

┌──────────────┐       N:1       ┌──────────────┐
│ Notification  │────────────────→│   User       │
│   通知        │                   │   用户       │
└──────────────┘                   └──────────────┘
```

### 5.2 核心数据表字段说明

#### 5.2.1 Tenant（租户表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 租户唯一标识 | 主键，格式：t001 |
| name | string | 租户名称 | 必填，最大50字 |
| contact | string | 联系人 | 选填 |
| phone | string | 联系电话 | 选填，格式校验 |
| email | string | 邮箱 | 选填，格式校验 |
| status | number | 状态 | 必填，0-停用/1-启用 |
| projectCount | number | 项目数 | 自动统计 |
| userCount | number | 用户数 | 自动统计 |
| createdAt | string | 创建时间 | 自动生成 |
| lastActive | string | 最后活跃时间 | 自动更新 |

#### 5.2.2 Project（项目表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 项目唯一标识 | 主键，格式：p001 |
| tenantId | string | 所属租户ID | 外键→Tenant.id |
| name | string | 项目名称 | 必填，最大100字 |
| address | string | 工程地址 | 选填 |
| managerId | string | 负责人ID | 外键→User.id |
| managerName | string | 负责人姓名 | 冗余存储 |
| startDate | string | 开始日期 | 选填，格式YYYY-MM-DD |
| endDate | string | 结束日期 | 选填，格式YYYY-MM-DD |
| status | number | 状态 | 必填，1-4 |
| remark | string | 备注 | 选填，最大500字 |
| drawingCount | number | 图纸数量 | 自动统计 |
| memberCount | number | 成员数量 | 自动统计 |
| createdAt | string | 创建时间 | 自动生成 |

#### 5.2.3 User（用户表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 用户唯一标识 | 主键，格式：u001 |
| name | string | 姓名 | 必填 |
| username | string | 登录账号 | 必填，唯一 |
| password | string | 密码 | 必填，加密存储 |
| email | string | 邮箱 | 必填，唯一 |
| phone | string | 手机号 | 选填 |
| role | string | 系统级角色 | 必填，super_admin/tenant_admin/user |
| department | string | 所属部门 | 外键 |
| status | number | 状态 | 0-停用/1-启用 |

#### 5.2.4 Member（成员表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 记录ID | 主键 |
| projectId | string | 项目ID | 外键→Project.id |
| userId | string | 用户ID | 外键→User.id |
| userName | string | 用户姓名 | 冗余存储 |
| role | string | 项目角色 | 必填，project_admin/cartographer/auditor/browser |
| permissions | string[] | 权限列表 | 必填，6项权限子集 |
| joinedAt | string | 加入时间 | 自动生成 |
| onlineStatus | number | 在线状态 | 0-离线/1-在线/2-忙碌 |
| currentAction | string | 当前操作 | 选填 |

#### 5.2.5 Directory（目录表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 目录ID | 主键 |
| projectId | string | 项目ID | 外键→Project.id |
| parentId | string | 父目录ID | 根目录为空字符串 |
| name | string | 目录名称 | 必填 |
| createdAt | string | 创建时间 | 自动生成 |

#### 5.2.6 Drawing（图纸表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 图纸ID | 主键，格式：f+时间戳 |
| projectId | string | 项目ID | 外键→Project.id |
| directoryId | string | 目录ID | 外键→Directory.id |
| name | string | 图纸名称 | 必填 |
| originalName | string | 原始文件名 | 必填 |
| format | string | 文件格式 | JPG/PNG/BMP/PDF/TIFF |
| size | number | 文件大小 | 字节，限制50MB |
| status | number | 状态 | 1-6：1-未出图 2-处理中 5-待审核 3-已完成 6-已驳回 4-异常 |
| uploaderId | string | 上传人ID | 外键→User.id |
| uploaderName | string | 上传人姓名 | 冗余存储 |
| uploadedAt | string | 上传时间 | 自动生成 |
| dwgPath | string | DWG文件路径 | 生成后填充 |
| generatedAt | string | DWG生成时间 | 生成后填充 |
| reviewedAt | string | 审核时间 | 审核完成后填充 |
| reviewerId | string | 审核人ID | 外键→User.id |
| reviewerName | string | 审核人姓名 | 冗余存储 |
| rejectReason | string | 驳回原因 | 驳回时必填 |

#### 5.2.7 Task（任务表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 任务ID | 主键，格式：task+时间戳 |
| drawingId | string | 图纸ID | 外键→Drawing.id |
| drawingName | string | 图纸名称 | 冗余存储 |
| projectId | string | 项目ID | 外键→Project.id |
| projectName | string | 项目名称 | 冗余存储 |
| status | number | 状态 | 1-4 |
| stage | string | 当前阶段 | TaskStageMap值 |
| progress | number | 进度 | 0-100 |
| submitterId | string | 提交人ID | 外键→User.id |
| submitterName | string | 提交人姓名 | 冗余存储 |
| submittedAt | string | 提交时间 | 自动生成 |
| startedAt | string | 开始处理时间 | 处理中时填充 |
| completedAt | string | 完成时间 | 完成时填充 |
| exceptionReason | string | 异常原因 | 异常时填充 |
| retryCount | number | 重试次数 | 默认0，上限3 |
| stages | object | 各阶段进度 | {drawingParsing, featureExtraction, dwgGeneration} |

#### 5.2.8 OperationLog（操作日志表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 日志ID | 主键 |
| projectId | string | 项目ID | 外键（可为空） |
| projectName | string | 项目名称 | 冗余存储 |
| userId | string | 操作人ID | 外键→User.id |
| userName | string | 操作人姓名 | 冗余存储 |
| actionType | string | 操作类型 | ActionTypeMap值 |
| targetType | string | 操作对象类型 | drawing/member/project等 |
| targetId | string | 操作对象ID | - |
| targetName | string | 操作对象名称 | 冗余存储 |
| result | number | 结果 | 0-失败/1-成功 |
| ipAddress | string | IP地址 | - |
| createdAt | string | 操作时间 | 自动生成 |
| detail | json | 详细信息 | 选填 |
| errorMessage | string | 错误信息 | 失败时填充 |

#### 5.2.9 DictType（字典类型表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 字典类型ID | 主键，格式：dt+序号 |
| code | string | 字典类型编码 | 必填，唯一，最大50字 |
| name | string | 字典类型名称 | 必填，最大50字 |
| description | string | 描述说明 | 选填，最大200字 |
| status | number | 状态 | 必填，0-停用/1-启用 |
| itemCount | number | 字典项数量 | 自动统计 |
| updatedAt | string | 更新时间 | 自动更新 |

**系统内置字典类型**（不可删除，编码不可修改）：
- project_status（项目状态）
- drawing_status（图纸状态）
- task_status（任务状态）
- task_stage（任务阶段）
- drawing_category（图纸分类）
- file_format（文件格式）
- laying_method（敷设方式）
- annotation_type（标注类型）
- online_status（在线状态）
- notification_type（通知类型）
- user_status（用户状态）
- permission（项目权限）

#### 5.2.10 DictItem（字典数据表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 字典项ID | 主键，格式：di+序号 |
| typeCode | string | 所属字典类型编码 | 外键→DictType.code |
| label | string | 显示标签 | 必填，最大50字 |
| value | string | 实际值 | 必填，最大50字 |
| sort | number | 排序值 | 必填，数字，越小越靠前 |
| status | number | 状态 | 必填，0-停用/1-启用 |
| remark | string | 备注 | 选填，最大200字 |

#### 5.2.11 Notification（通知表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | string | 通知ID | 主键，格式：n+时间戳 |
| userId | string | 接收用户ID | 外键→User.id |
| type | string | 通知类型 | NotificationTypeMap值 |
| title | string | 通知标题 | 必填 |
| content | string | 通知内容 | 必填，最大500字 |
| relatedProjectId | string | 关联项目ID | 选填，外键→Project.id |
| relatedProjectName | string | 关联项目名称 | 冗余存储 |
| relatedDrawingId | string | 关联图纸ID | 选填，外键→Drawing.id |
| relatedDrawingName | string | 关联图纸名称 | 冗余存储 |
| read | boolean | 是否已读 | 默认false |
| createdAt | string | 创建时间 | 自动生成 |

### 5.3 数据状态流转规则

#### 5.3.1 项目状态流转

```
         创建
[进行中] ──────→ [已完成]
   │                │
   │                ↓
   │            [已归档]
   │
   ↓
[已作废]
```

- 进行中(1) → 已完成(2)：项目验收通过
- 进行中(1) → 已作废(4)：项目取消
- 已完成(2) → 已归档(3)：归档封存
- 已完成(2) → 进行中(1)：重新启动（罕见）

#### 5.3.2 图纸状态流转

```
[未出图] ──提交出图──→ [处理中] ──处理成功──→ [待审核]
  (1)                   (2)                   (5)
                          │                     │
                          │                     ├──审核通过──→ [已完成]
                          │                     │              (3)
                          │                     │              │
                          │                     │              └──可下载DWG
                          │                     │
                          │                     └──审核驳回──→ [已驳回]
                          │                                    (6)
                          │                                    │
                          │                                    └──修改后重新提交
                          │                                         │
                          └──处理失败──→ [异常]                    ↓
                                          (4)               [处理中] → [待审核]
```

**流转规则说明**：
- 未出图(1) → 处理中(2)：提交AI处理
- 处理中(2) → 待审核(5)：AI处理成功，生成DWG文件
- 处理中(2) → 异常(4)：AI处理失败
- 待审核(5) → 已完成(3)：审核员审核通过
- 待审核(5) → 已驳回(6)：审核员审核驳回（需填写驳回原因）
- 异常(4) → 处理中(2)：重新提交AI处理
- 已驳回(6) → 处理中(2)：修改后重新提交
- 已完成(3) → 下载：仅审核通过后可下载DWG

#### 5.3.3 任务状态流转

```
[待处理] ──开始执行──→ [处理中] ──成功──→ [已完成]
  (1)                  (2)               (3)
                         │
                         └──失败──→ [异常]
                                    (4)
                         异常任务:
                         [异常] ──重试──→ [处理中] → [已完成] (retryCount<3)
                         [异常] ──超上限──→ 不可重试
```

---

## 第六章：边界场景与异常

### 6.1 AI处理失败的重试逻辑

| 场景 | 处理方式 |
|------|---------|
| 网络中断导致AI服务不可达 | Task置为"异常"，记录exceptionReason="AI服务不可达" |
| AI模型识别精度不足 | Task置为"异常"，记录具体识别失败原因 |
| DWG生成格式错误 | Task置为"异常"，记录DWG写入失败原因 |
| 单次处理超时（超过taskTimeout配置） | 自动标记为异常 |
| 用户点击"重新提交" | retryCount+1，重置status为1"待处理"，重新执行全流程 |
| 重试次数达3次上限 | 禁用重试按钮，显示"联系技术支持"按钮 |
| 批量任务中单个失败 | 不影响其他任务继续执行，独立标记异常 |

### 6.2 网络异常的处理

| 场景 | 处理方式 |
|------|---------|
| 上传时网络中断 | 显示上传失败Toast，保留已选文件，支持重新上传 |
| AI处理过程中断网 | Task标记为异常，用户可重试 |
| API请求超时 | 显示超时Toast，支持重试按钮 |
| 页面加载时网络异常 | 显示"网络连接失败"提示 + 重试按钮 |
| 响应数据异常（500/404等） | 显示友好错误提示，记录日志 |

### 6.3 权限不足的拦截

| 场景 | 处理方式 |
|------|---------|
| 未登录访问业务页 | 路由守卫拦截 → 重定向至登录页 |
| 普通用户访问系统管理页 | AdminRoute拦截 → 重定向至项目管理页 |
| 非项目成员访问项目 | 页面内校验 → 显示"无访问权限"提示页 |
| 无upload权限点击上传按钮 | 按钮不渲染（通过权限校验隐藏） |
| 无delete权限点击删除按钮 | 按钮不渲染 |
| 无configure权限修改权限矩阵 | 无权限入口 |
| tenant_admin访问租户管理页 | 菜单不显示（仅super_admin可见） |

### 6.4 数据为空的展示

| 页面 | 空数据展示 |
|------|-----------|
| 项目管理（无项目） | 空状态插图 + "暂无项目，点击新建项目开始" + 新建项目按钮 |
| 图纸管理（无图纸） | "暂无图纸，请先上传草图" + 上传草图按钮 |
| 图纸管理（目录为空） | "该目录下暂无图纸" |
| 项目成员管理（无成员） | "暂无项目成员，点击添加成员" + 添加成员按钮 |
| 操作日志（无记录） | "暂无日志记录" |
| 并发任务（无任务） | "暂无任务记录" |
| 搜索无结果 | "未找到匹配的{项目/图纸/日志}" + 清除筛选按钮 |
| AI处理流水线（未开始） | 显示"等待开始处理..." + 开始AI处理按钮 |

### 6.5 并发操作冲突处理

| 场景 | 处理方式 |
|------|---------|
| 多人同时编辑同一项目 | 乐观锁机制，后提交者版本号冲突 → 提示"数据已被他人修改，请刷新后重试" |
| 多人同时上传图纸到同一目录 | 各自独立创建Drawing记录，互不冲突 |
| 同一成员被多人同时修改角色 | 乐观锁机制，冲突后提示 |
| 同一草图被重复提交AI处理 | 系统校验：已有进行中任务时，拦截重复提交 → Toast"该图纸已有处理中任务" |
| 批量操作时部分成功部分失败 | 逐条处理，汇总结果："成功3个，失败2个：xxx失败原因" |
| 项目删除时有关联数据 | 级联删除所有关联数据（草图/DWG/成员/日志/任务），二次确认弹窗明确提示影响范围 |
| 目录删除时有图纸 | 不允许删除 → 提示"该目录下存在图纸，请先清理" |
| 用户删除时有进行中任务 | 不允许删除 → 提示"该用户存在进行中的任务" |
| 字典类型删除有关联数据项 | 二次确认弹窗提示"将同时删除N条字典数据项" → 确认后级联删除 |
| 系统内置字典类型删除 | 不允许删除 → 提示"系统内置字典类型不可删除" |
| 字典编码重复 | 创建/修改时校验 → Toast"编码已存在" |
| 密码强度不足 | 提交时校验 → 红色提示"密码强度不足，至少需要8位且包含字母和数字" |
| 新旧密码相同 | 修改密码时校验 → 提示"新密码不能与旧密码相同" |
| 通知标记已读冲突 | 已读状态的通知重复标记 → 幂等处理，不报错 |
| 消息预览弹窗打开时收到新消息 | 弹窗内实时刷新，显示新消息徽标 |

---

## 附录：页面导航关系图

```
登录页 /login
    │
    ↓
项目管理页 /projects（默认首页）
    │
    ├── 点击项目卡片/名称 ──→ 图纸管理页 /projects/:id/drawings
    │                           │
    │                           ├── 点击上传草图 ──→ 上传草图弹窗
    │                           ├── 点击AI加强 ──→ AI加强弹窗
    │                           ├── 点击AI处理 ──→ AI处理流水线页
    │                           │                   │
    │                           │                   ├── 完成 → DWG预览页
    │                           │                   │   + 发送出图完成通知
    │                           │                   └── 返回图纸管理
    │                           ├── 点击查看草图 ──→ 草图预览页
    │                           ├── 点击查看AI图 ──→ DWG预览页
    │                           ├── 点击重命名 ──→ 重命名弹窗
    │                           └── 点击下载 ──→ 直接下载DWG
    │
    ├── 退出项目（侧边栏底部）──→ 返回项目管理页，隐藏二级菜单
    │
    ├── 右上角铃铛图标 ──→ 消息预览弹窗（最近5条未读）
    │       │
    │       ├── 点击单条消息 ──→ 标记已读 + 跳转相关业务页
    │       └── 点击"查看全部" ──→ 消息通知页 /notifications
    │
    ├── 右上角头像图标 ──→ 头像下拉菜单
    │       │
    │       ├── 点击"个人中心" ──→ 个人中心页 /profile
    │       └── 点击"退出登录" ──→ 跳转登录页
    │
    └── 系统管理（侧边栏分组，需管理员权限）
            │
            ├── 公司人员管理 /system/users
            │       ├── 新建用户弹窗（分配初始密码）
            │       ├── 编辑用户弹窗
            │       └── 角色设置弹窗
            │
            ├── 租户管理 /system/tenants（仅super_admin）
            │       ├── 新建租户弹窗
            │       ├── 租户详情弹窗
            │       └── 租户配置弹窗（标注规则/图层样式/出图规范）
            │
            ├── 并发任务管理 /system/tasks
            │       └── 任务详情弹窗
            │
            ├── 系统日志 /system/logs
            │       └── 日志详情弹窗
            │
            ├── 字典管理 /system/dictionary（仅super_admin）
            │       ├── 字典类型列表（主内容区）
            │       │       ├── 新建字典类型弹窗
            │       │       ├── 编辑字典类型弹窗
            │       │       └── 点击「数据」按钮 → 字典数据管理弹窗
            │       │               ├── 新建字典项弹窗
            │       │               └── 编辑字典项弹窗
            │       └── 使用说明卡片（指引操作方式）
            │
            └── 系统设置 /system/settings（仅super_admin）
                    └── 保存配置

项目成员管理页 /projects/:id/members（需选中项目后侧边栏可见）
    │
    ├── 成员列表Tab
    │       ├── 添加成员弹窗（组织树选择）
    │       ├── 角色与权限设置弹窗
    │       └── 批量移除
    │
    ├── 权限配置Tab
    │       └── 权限矩阵表格（6权限 × 4角色）
    │
    └── 操作日志Tab
            └── 日志列表

个人中心页 /profile（所有登录用户可访问）
    │
    ├── 基本信息Tab ──→ 查看/修改姓名、邮箱、手机号
    ├── 修改密码Tab ──→ 旧密码 + 新密码 + 确认密码 + 强度指示
    └── 我的日志Tab ──→ 个人操作日志列表

消息通知页 /notifications（所有登录用户可访问）
    │
    ├── 全部通知Tab ──→ 按类型筛选 + 点击跳转业务页
    ├── 出图完成Tab ──→ 跳转DWG预览页
    ├── 出图失败Tab ──→ 跳转AI处理流水线页
    ├── 任务异常Tab ──→ 跳转并发任务管理页
    ├── 成员变更Tab ──→ 跳转项目成员管理页
    └── 系统公告Tab ──→ 查看公告内容
```

---

*文档结束*
