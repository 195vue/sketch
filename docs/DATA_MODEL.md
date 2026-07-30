# 数据模型说明

## 一、实体关系

```
Tenant 1:N Project
Tenant 1:N User
Project 1:N Member
Project 1:N Drawing
Project 1:N Directory
Project 1:N Task
Member → User (通过userId关联)
Drawing 1:N Task
Drawing 1:N OperationLog
```

---

## 二、核心实体

### Tenant 租户
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 租户唯一标识 (如 t001) |
| name | string | 租户名称 (如 中国移动) |
| contact | string | 联系人 |
| phone | string | 联系电话 |
| email | string | 联系邮箱 |
| status | number | 状态: 1=启用, 0=停用 |
| projectCount | number | 项目数量 |
| userCount | number | 用户数量 |
| createdAt | string | 创建时间 |
| lastActive | string | 最近活动时间 |

### Project 项目
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 项目唯一标识 (如 p001) |
| tenantId | string | 所属租户ID |
| name | string | 项目名称 |
| address | string | 项目地址 |
| managerId | string | 负责人ID |
| managerName | string | 负责人姓名 |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| status | number | 状态: 1=进行中, 2=已完成, 3=已归档, 4=已作废 |
| remark | string | 备注 |
| drawingCount | number | 图纸数量 |
| memberCount | number | 成员数量 |

### Member 项目成员
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 成员记录ID (如 m001) |
| projectId | string | 所属项目ID |
| userId | string | 用户ID |
| userName | string | 用户姓名 |
| role | string | 项目角色: project_admin/cartographer/auditor/browser |
| permissions | string[] | 权限列表: upload/generate/download/delete/view/configure |
| joinedAt | string | 加入时间 |
| onlineStatus | number | 在线状态: 0=离线, 1=在线, 2=忙碌 |
| currentAction | string | 当前操作描述 |

### Drawing 图纸
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 图纸ID (如 f001) |
| projectId | string | 所属项目ID |
| directoryId | string | 目录ID |
| name | string | 图纸名称 |
| originalName | string | 原始文件名 |
| format | string | 格式 (jpg/png/pdf) |
| size | number | 文件大小(KB) |
| status | number | 状态: 1=未出图, 2=处理中, 3=已完成, 4=异常 |
| uploaderId | string | 上传人ID |
| uploaderName | string | 上传人姓名 |
| uploadedAt | string | 上传时间 |
| dwgPath | string | DWG文件路径(AI处理完成后) |
| generatedAt | string | DWG生成时间 |

### Task 并发任务
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 任务ID |
| drawingId | string | 关联图纸ID |
| drawingName | string | 图纸名称 |
| projectId | string | 所属项目ID |
| projectName | string | 项目名称 |
| status | number | 状态: 1=待处理, 2=处理中, 3=已完成, 4=异常 |
| stage | string | 当前阶段 |
| progress | number | 进度: 0-100 |
| submitterId | string | 提交人ID |
| submitterName | string | 提交人姓名 |
| submittedAt | string | 提交时间 |
| startedAt | string | 开始时间 |
| completedAt | string | 完成时间 |
| exceptionReason | string | 异常原因 |
| retryCount | number | 重试次数 |

### OperationLog 操作日志
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 日志ID |
| projectId | string | 项目ID |
| projectName | string | 项目名称 |
| userId | string | 操作人ID |
| userName | string | 操作人姓名 |
| actionType | string | 操作类型 (login/logout/upload/export/download/delete等) |
| targetType | string | 操作对象类型 |
| targetId | string | 操作对象ID |
| targetName | string | 操作对象名称 |
| result | number | 结果: 1=成功, 0=失败 |
| ipAddress | string | IP地址 |
| createdAt | string | 操作时间 |

### User 用户
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |
| name | string | 姓名 |
| username | string | 登录名 |
| role | string | 系统角色: super_admin/tenant_admin/cartographer |
| tenantId | string | 所属租户ID |
| tenantName | string | 租户名称 |

---

## 三、枚举值

### 项目状态 (ProjectStatusMap)
| 值 | 含义 |
|----|------|
| 1 | 进行中 |
| 2 | 已完成 |
| 3 | 已归档 |
| 4 | 已作废 |

### 图纸状态 (DrawingStatusMap)
| 值 | 含义 |
|----|------|
| 1 | 未出图 |
| 2 | 处理中 |
| 3 | 已完成 |
| 4 | 异常 |

### 任务状态 (TaskStatusMap)
| 值 | 含义 |
|----|------|
| 1 | 待处理 |
| 2 | 处理中 |
| 3 | 已完成 |
| 4 | 异常 |

### 在线状态 (OnlineStatusMap)
| 值 | 含义 |
|----|------|
| 0 | 离线 |
| 1 | 在线 |
| 2 | 忙碌 |

### 项目角色 (RoleMap)
| 值 | 含义 |
|----|------|
| super_admin | 超级管理员 |
| tenant_admin | 租户管理员 |
| project_admin | 项目管理员 |
| cartographer | 制图员 |
| auditor | 审核员 |
| browser | 浏览员 |

### 操作类型 (ActionTypeMap)
| 值 | 含义 |
|----|------|
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
