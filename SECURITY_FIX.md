# 安全漏洞修复报告

## 漏洞描述

### 🔴 严重性：高危

**发现时间**：用户报告被攻击，发布了垃圾文章

**漏洞类型**：身份验证绕过（Authentication Bypass）

**受影响版本**：修复前的所有版本

---

## 漏洞详情

### 问题根源

原系统的 `middleware.js` 仅保护了前端 `/admin` 路由，但**完全没有保护后端 API 路由**。

### 被暴露的 API 端点

以下 API 端点可以在**未认证**的情况下被直接调用：

1. `/api/articles/create` (POST) - 创建新文章
2. `/api/articles` (POST) - 更新现有文章
3. `/api/resources` (POST) - 修改资源列表

### 攻击场景

攻击者可以通过简单的 HTTP 请求创建垃圾文章，无需登录：

```bash
# 攻击示例
curl -X POST https://yoursite.com/api/articles/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "垃圾文章标题",
    "description": "spam",
    "content": "spam content",
    "slug": "spam-article-123"
  }'
```

**结果**：文章被成功创建并提交到 GitHub 仓库！

---

## 修复方案

### 双重防护策略

采用**纵深防御**（Defense in Depth）原则，实施两层认证：

#### 1️⃣ Middleware 层防护

**文件**：`middleware.js`

**修改内容**：
- 新增 API 路由匹配规则
- 区分 HTTP 方法（允许 GET，保护 POST/PUT/DELETE）
- 未认证请求返回 401 错误

```javascript
// 新增保护的 API 路由
const protectedApiRoutes = [
  '/api/articles/create',
  '/api/articles',
  '/api/resources',
];

// 检测并拦截未认证请求
if (isProtectedApi) {
  const token = request.cookies.get('auth_token')?.value;
  const isLoggedIn = token && verifyToken(token);

  if (!isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }
}
```

**matcher 配置**：
```javascript
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/articles/:path*',
    '/api/resources/:path*',
  ],
};
```

#### 2️⃣ API 层二次验证

**修改文件**：
- `src/lib/auth.js` - 新增 `verifyRequestAuth()` 函数
- `src/app/api/articles/route.js` - POST 方法添加认证检查
- `src/app/api/articles/create/route.js` - 添加认证检查
- `src/app/api/resources/route.js` - POST 方法添加认证检查

**新增工具函数**：
```javascript
// src/lib/auth.js
export function verifyRequestAuth(request) {
  const token = request.cookies.get('auth_token')?.value;
  return token ? verifyToken(token) : false;
}
```

**API 内部验证示例**：
```javascript
export async function POST(request) {
  // Double-check authentication (belt and suspenders approach)
  const { verifyRequestAuth } = await import('@/lib/auth');
  if (!verifyRequestAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... 业务逻辑
}
```

---

## 验证修复

### 测试未认证访问

```bash
# 测试 1：尝试创建文章（应该失败）
curl -X POST http://localhost:3000/api/articles/create \
  -H "Content-Type: application/json" \
  -d '{"title":"test","description":"test","content":"test","slug":"test"}'

# 期望结果：
# {"error":"Unauthorized: Authentication required"}
# HTTP 状态码：401
```

```bash
# 测试 2：尝试更新文章（应该失败）
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"article":{"title":"test","path":"data/md/test.md"}}'

# 期望结果：
# {"error":"Unauthorized"}
# HTTP 状态码：401
```

```bash
# 测试 3：读取文章列表（应该成功 - GET 允许）
curl http://localhost:3000/api/articles

# 期望结果：
# 返回文章列表（正常数据）
# HTTP 状态码：200
```

### 测试已认证访问

```bash
# 1. 先登录获取 Cookie
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}' \
  -c cookies.txt

# 2. 使用 Cookie 创建文章（应该成功）
curl -X POST http://localhost:3000/api/articles/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"合法文章","description":"test","content":"test","slug":"valid-article"}'

# 期望结果：
# {"message":"Article created successfully"}
# HTTP 状态码：200
```

---

## 安全改进总结

### ✅ 已修复

1. **Middleware 层拦截** - 所有敏感 API 请求必须携带有效 Token
2. **API 层二次验证** - 即使 Middleware 被绕过，API 内部仍会拒绝
3. **方法级别控制** - 区分读（GET）和写（POST/PUT/DELETE）操作
4. **一致性验证** - 所有验证使用相同的 `verifyToken` 函数

### 🛡️ 防御层级

```
攻击请求
    ↓
┌────────────────────────────┐
│  第一道防线：Middleware     │  ← 拦截未认证请求
│  - 检查 Cookie Token       │
│  - 验证 JWT 签名           │
│  - 验证域名绑定             │
└────────────────────────────┘
    ↓ (通过)
┌────────────────────────────┐
│  第二道防线：API 内部       │  ← 二次验证
│  - verifyRequestAuth()    │
│  - 再次检查 Token          │
└────────────────────────────┘
    ↓ (通过)
┌────────────────────────────┐
│  业务逻辑执行               │
└────────────────────────────┘
```

### 🔒 安全最佳实践

1. **纵深防御**：多层验证，不依赖单点安全
2. **最小权限**：GET 开放，POST/PUT/DELETE 保护
3. **显式拒绝**：默认拒绝，明确允许
4. **一致性**：所有验证使用统一函数

---

## 建议的额外安全措施

### 1. 添加速率限制（Rate Limiting）

防止暴力破解和 DDoS 攻击：

```javascript
// 建议使用 next-rate-limit 或 upstash/ratelimit
import ratelimit from '@/lib/ratelimit';

export async function POST(request) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ...
}
```

### 2. 添加 CSRF Token

虽然使用了 `SameSite: strict`，但仍建议添加 CSRF Token：

```javascript
// 生成 CSRF Token
import { randomBytes } from 'crypto';

export function generateCsrfToken() {
  return randomBytes(32).toString('hex');
}
```

### 3. 记录安全日志

记录所有认证失败的尝试：

```javascript
if (!isLoggedIn) {
  console.warn(`[Security] Unauthorized access attempt to ${path} from ${request.ip}`);
  // 发送到日志系统或监控平台
}
```

### 4. 添加管理员通知

当检测到可疑活动时发送通知（邮件/Webhook）

---

## 部署检查清单

在部署修复后，请确认：

- [ ] 环境变量 `JWT_SECRET` 已设置且足够强（至少 32 字符）
- [ ] 环境变量 `ACCESS_PASSWORD` 已更换（旧密码可能已泄露）
- [ ] 环境变量 `DOMAIN` 已正确设置为生产域名
- [ ] 检查 GitHub 仓库中是否有垃圾文章并删除
- [ ] 检查 GitHub commit 历史，确认没有敏感信息泄露
- [ ] 在生产环境测试未认证访问被正确拦截
- [ ] 在生产环境测试正常登录流程正常工作
- [ ] 考虑更换 GitHub Token（如果怀疑已泄露）

---

## 附录：修改的文件列表

1. `middleware.js` - 添加 API 路由保护
2. `src/lib/auth.js` - 新增 `verifyRequestAuth()` 函数
3. `src/app/api/articles/route.js` - POST 方法添加认证
4. `src/app/api/articles/create/route.js` - 添加认证检查
5. `src/app/api/resources/route.js` - POST 方法添加认证

---

**修复日期**：2025-10-21
**严重性评级**：高危 → 已修复
**建议立即部署**：是
