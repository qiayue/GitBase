# 登录系统升级说明

## 升级概述

将登录系统从**仅密码验证**升级为**用户名+密码验证**，进一步提高系统安全性。

**升级日期**：2025-10-21
**版本**：2.0
**优先级**：中等（安全增强）

---

## 变更内容

### 1. 登录 API 改进

**文件**：`src/app/api/login/route.js`

**变更**：
- ✅ 新增用户名验证
- ✅ 同时验证用户名和密码
- ✅ 更清晰的错误提示
- ✅ JWT Token 中包含用户名信息

**新增环境变量**：
```
ACCESS_USERNAME=your_admin_username
```

**API 请求格式变更**：

**之前**：
```json
POST /api/login
{
  "password": "your_password"
}
```

**现在**：
```json
POST /api/login
{
  "username": "your_username",
  "password": "your_password"
}
```

**响应格式**：
```json
// 成功
{
  "message": "Login successful",
  "username": "admin"
}

// 失败
{
  "message": "Invalid username or password"
}
```

---

### 2. JWT Token 改进

**文件**：`src/lib/auth.js`

**Token Payload 变更**：

**之前**：
```javascript
{
  authenticated: true,
  domain: "yourdomain.com"
}
```

**现在**：
```javascript
{
  authenticated: true,
  username: "admin",      // ← 新增用户名
  domain: "yourdomain.com"
}
```

**优势**：
- 可追溯操作用户
- 支持未来的多用户扩展
- 审计日志更完善

---

### 3. 前端登录页面改进

**文件**：`src/app/login/page.js`

**UI 改进**：
- ✅ 新增用户名输入框
- ✅ 改进错误提示显示（红色提示框）
- ✅ 添加加载状态（防止重复提交）
- ✅ 更好的样式和用户体验
- ✅ 添加表单验证（required）
- ✅ 支持浏览器自动填充（autoComplete）

**新功能**：
```javascript
// 加载状态
const [isLoading, setIsLoading] = useState(false);

// 错误提示
const [error, setError] = useState('');

// 用户名状态
const [username, setUsername] = useState('');
```

---

### 4. 文档更新

**文件**：
- `README.md` - 更新环境变量说明
- `.env.local.md` - 添加 ACCESS_USERNAME

**新增说明**：
- 环境变量配置要求
- 登录流程说明
- 部署检查清单

---

## 迁移指南

### 对于新部署

直接按照更新后的 README.md 配置即可，需要设置以下环境变量：

```bash
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
JWT_SECRET=your_long_random_secret_at_least_32_chars
DOMAIN=localhost  # 开发环境
ACCESS_USERNAME=admin
ACCESS_PASSWORD=your_strong_password
```

### 对于现有部署（重要！）

如果你已经有运行中的 GitBase 实例，需要执行以下步骤：

#### 步骤 1：更新代码

```bash
# 拉取最新代码
git pull origin main

# 或合并更新分支
git merge claude/review-code-design-011CUKdxQuvDL7mL7r48AtMp
```

#### 步骤 2：添加环境变量

**本地开发**：
```bash
# 编辑 .env.local 文件
echo "ACCESS_USERNAME=admin" >> .env.local
```

**Vercel 部署**：
1. 登录 Vercel Dashboard
2. 进入项目设置 → Environment Variables
3. 添加新变量：
   - Key: `ACCESS_USERNAME`
   - Value: `admin`（或你想要的用户名）
4. 选择适用环境：Production, Preview, Development
5. 保存

**其他部署平台**（如 Netlify, Railway 等）：
- 参考各平台的环境变量配置方式
- 添加 `ACCESS_USERNAME` 变量

#### 步骤 3：重新部署

**Vercel**：
```bash
# Vercel 会自动重新部署，或手动触发
vercel --prod
```

**本地开发**：
```bash
# 重启开发服务器
npm run dev
```

#### 步骤 4：测试登录

1. 访问 `/login` 页面
2. 输入用户名和密码
3. 确认可以成功登录到 `/admin`

**测试用例**：
```bash
# 测试 1：正确的用户名和密码（应该成功）
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# 期望：{"message":"Login successful","username":"admin"}

# 测试 2：错误的用户名（应该失败）
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"your_password"}'

# 期望：{"message":"Invalid username or password"}

# 测试 3：缺少用户名（应该失败）
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'

# 期望：{"message":"Username and password are required"}
```

---

## 安全增强

### 新增的安全特性

1. **双因素验证**
   - 用户名和密码都必须正确
   - 增加暴力破解难度

2. **更好的错误处理**
   - 统一的错误提示（不透露具体哪个字段错误）
   - 防止用户名枚举攻击

3. **输入验证**
   - 必填字段验证
   - 空值检查

4. **可追溯性**
   - Token 中包含用户名
   - 便于审计和日志记录

### 安全建议

1. **选择强用户名**
   - 不要使用 `admin`、`root` 等常见用户名
   - 推荐使用难以猜测的用户名

2. **使用强密码**
   - 至少 16 个字符
   - 包含大小写字母、数字、特殊字符
   - 使用密码管理器生成

3. **定期更换凭证**
   - 建议每 3-6 个月更换一次密码
   - 如果怀疑泄露，立即更换

4. **考虑添加速率限制**
   - 防止暴力破解
   - 限制登录尝试次数

---

## 向后兼容性

### ⚠️ 破坏性变更

**此更新包含破坏性变更**，不向后兼容！

**影响**：
- 旧的登录请求（仅包含 password）将被拒绝
- 必须同时提供 username 和 password

**迁移必要性**：**必须**添加 `ACCESS_USERNAME` 环境变量

---

## 故障排除

### 问题 1：登录失败，提示 "Username and password are required"

**原因**：环境变量 `ACCESS_USERNAME` 未设置

**解决方案**：
```bash
# 检查环境变量
echo $ACCESS_USERNAME

# 如果为空，添加到 .env.local
echo "ACCESS_USERNAME=your_username" >> .env.local

# 重启服务
npm run dev
```

### 问题 2：登录失败，提示 "Invalid username or password"

**可能原因**：
1. 用户名或密码输入错误
2. 环境变量配置错误

**解决方案**：
```bash
# 检查环境变量
cat .env.local | grep ACCESS

# 确认配置正确
# ACCESS_USERNAME=admin
# ACCESS_PASSWORD=your_password
```

### 问题 3：Vercel 部署后无法登录

**原因**：未在 Vercel 配置 `ACCESS_USERNAME`

**解决方案**：
1. 进入 Vercel Dashboard
2. 项目 → Settings → Environment Variables
3. 添加 `ACCESS_USERNAME`
4. 重新部署（Deployments → Redeploy）

### 问题 4：旧的 Token 失效

**原因**：Token 结构变更（增加了 username 字段）

**解决方案**：
- 正常现象，重新登录即可
- Token 有效期为 1 小时，会自动过期

---

## 未来扩展

此次升级为未来的功能扩展奠定了基础：

### 潜在功能

1. **多用户支持**
   - 存储用户列表到 `data/json/users.json`
   - 为每个用户分配不同权限

2. **角色权限系统**
   - Admin - 完全权限
   - Editor - 仅编辑文章
   - Viewer - 只读权限

3. **操作审计日志**
   - 记录谁在何时做了什么
   - 存储到 GitHub commit message

4. **邮箱/手机验证**
   - 双因素认证（2FA）
   - OTP 验证码

5. **OAuth 集成**
   - GitHub OAuth
   - Google OAuth

---

## 修改文件清单

- `src/app/api/login/route.js` - 登录 API 逻辑
- `src/lib/auth.js` - Token 创建函数
- `src/app/login/page.js` - 登录页面 UI
- `.env.local.md` - 环境变量模板
- `README.md` - 项目文档
- `LOGIN_UPGRADE.md` - 本文档

---

## 检查清单

部署前请确认：

- [ ] 添加 `ACCESS_USERNAME` 环境变量（本地和生产）
- [ ] 设置强用户名（非 admin/root 等常见名）
- [ ] 设置强密码（至少 16 字符）
- [ ] 测试登录流程正常工作
- [ ] 测试错误用户名/密码被拒绝
- [ ] 检查生产环境 Token 正常生成
- [ ] 确认 `/admin` 路由需要登录才能访问
- [ ] 旧的 session 已清除（清除浏览器 Cookie）

---

**升级完成后，你的登录系统将更加安全可靠！** 🔒
