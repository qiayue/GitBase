# GitBase 多语言国际化 (i18n) 指南

## 概述

GitBase 现在支持多语言国际化，使用**子目录路由**方式区分不同语言。

### 核心特性

✅ **默认英文在根路径** - 英文内容直接在 `/` 访问
✅ **其他语言使用子目录** - 中文 `/zh`，日文 `/ja`
✅ **自动重定向** - `/en` 自动 301 重定向到 `/`
✅ **语言切换器** - 导航栏内置语言切换组件
✅ **路由保留** - 切换语言时保持当前页面路径
✅ **认证支持** - 多语言路由下认证系统正常工作

---

## 路由结构

### 英文（默认语言）
```
/                    → 首页
/posts               → 文章列表
/posts/[slug]        → 文章详情
/resources           → 资源列表
/admin               → 管理后台
/login               → 登录页面
```

### 中文
```
/zh                  → 首页（中文）
/zh/posts            → 文章列表（中文）
/zh/posts/[slug]     → 文章详情（中文）
/zh/resources        → 资源列表（中文）
/zh/admin            → 管理后台（中文）
/zh/login            → 登录页面（中文）
```

### 日文
```
/ja                  → 首页（日文）
/ja/posts            → 文章列表（日文）
/ja/posts/[slug]     → 文章详情（日文）
/ja/resources        → 资源列表（日文）
/ja/admin            → 管理后台（日文）
/ja/login            → 登录页面（日文）
```

---

## 重定向规则

### `/en` → `/` (301 Permanent Redirect)

所有 `/en` 开头的路径会自动重定向到对应的根路径：

```
/en              → /              (301)
/en/posts        → /posts         (301)
/en/posts/hello  → /posts/hello   (301)
/en/admin        → /admin         (301)
```

**原因**：
- 英文是默认语言，不需要语言前缀
- SEO 优化，避免重复内容
- 保持 URL 简洁

---

## 配置文件

### 1. 语言配置 (`src/lib/i18n-config.ts`)

```typescript
export const i18n = {
  defaultLocale: 'en',              // 默认语言
  locales: ['en', 'zh', 'ja'],      // 支持的语言列表
  localeNames: {
    en: 'English',
    zh: '中文',
    ja: '日本語',
  },
  localeFlags: {
    en: '🇺🇸',
    zh: '🇨🇳',
    ja: '🇯🇵',
  }
}
```

**添加新语言**：
1. 在 `locales` 数组中添加语言代码
2. 在 `localeNames` 中添加语言名称
3. 在 `localeFlags` 中添加国旗 emoji
4. 创建对应的翻译文件（见下文）

---

## 翻译字典

### 目录结构
```
src/dictionaries/
├── en.json          # 英文翻译
├── zh.json          # 中文翻译
└── ja.json          # 日文翻译
```

### 翻译文件格式

**en.json**（英文）：
```json
{
  "navigation": {
    "home": "Home",
    "posts": "Articles",
    "resources": "Resources",
    "admin": "Admin",
    "login": "Login",
    "logout": "Logout"
  },
  "home": {
    "title": "GitBase",
    "subtitle": "Open Source Dynamic Website CMS Without Database",
    "description": "..."
  }
}
```

**zh.json**（中文）：
```json
{
  "navigation": {
    "home": "首页",
    "posts": "文章",
    "resources": "资源",
    "admin": "管理",
    "login": "登录",
    "logout": "登出"
  },
  "home": {
    "title": "GitBase",
    "subtitle": "无需数据库的开源动态网站 CMS",
    "description": "..."
  }
}
```

---

## 使用方法

### 1. 在服务端组件中使用翻译

```typescript
import { getDictionary } from '@/lib/get-dictionary'

export default async function HomePage({ params: { lang } }) {
  const dict = await getDictionary(lang) // 获取翻译字典

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
    </div>
  )
}
```

### 2. 在客户端组件中使用

由于翻译字典是服务端加载的，客户端组件需要通过 props 接收：

```tsx
'use client'

export default function ClientComponent({ dict }) {
  return (
    <button>{dict.navigation.login}</button>
  )
}
```

或者直接在客户端导入翻译：

```tsx
'use client'

import enDict from '@/dictionaries/en.json'
import zhDict from '@/dictionaries/zh.json'

const dictionaries = { en: enDict, zh: zhDict }

export default function ClientComponent({ locale }) {
  const dict = dictionaries[locale]
  return <button>{dict.navigation.login}</button>
}
```

---

## 组件

### 语言切换器 (`LanguageSwitcher`)

自动添加到导航栏，提供语言切换功能：

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher'

<LanguageSwitcher currentLocale="en" />
```

**特性**：
- 下拉菜单显示所有语言
- 显示国旗和语言名称
- 当前语言带有勾号标记
- 切换时保留当前页面路径

---

## 工具函数

### `getLocaleFromPath(pathname: string): Locale | null`

从路径中提取语言代码：

```typescript
getLocaleFromPath('/zh/posts')      // 'zh'
getLocaleFromPath('/ja/admin')      // 'ja'
getLocaleFromPath('/posts')         // null (默认语言)
```

### `removeLocaleFromPath(pathname: string): string`

移除路径中的语言前缀：

```typescript
removeLocaleFromPath('/zh/posts')   // '/posts'
removeLocaleFromPath('/ja/admin')   // '/admin'
removeLocaleFromPath('/posts')      // '/posts'
```

### `addLocaleToPath(pathname: string, locale: Locale): string`

为路径添加语言前缀（默认语言除外）：

```typescript
addLocaleToPath('/posts', 'zh')     // '/zh/posts'
addLocaleToPath('/posts', 'ja')     // '/ja/posts'
addLocaleToPath('/posts', 'en')     // '/posts' (默认语言不添加)
```

---

## Middleware 处理

`middleware.js` 自动处理：

1. **语言路由检测** - 识别路径中的语言前缀
2. **`/en` 重定向** - 自动重定向到无前缀路径
3. **认证保护** - 多语言路由下保护 `/admin` 等页面
4. **API 保护** - 保护需要认证的 API 路由

---

## 添加新语言

### 步骤 1：更新配置

编辑 `src/lib/i18n-config.ts`：

```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ja', 'es'],  // ← 添加 'es'
  localeNames: {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    es: 'Español',  // ← 添加西班牙语
  },
  localeFlags: {
    en: '🇺🇸',
    zh: '🇨🇳',
    ja: '🇯🇵',
    es: '🇪🇸',  // ← 添加国旗
  }
}
```

### 步骤 2：创建翻译文件

创建 `src/dictionaries/es.json`：

```json
{
  "navigation": {
    "home": "Inicio",
    "posts": "Artículos",
    "resources": "Recursos",
    ...
  }
}
```

### 步骤 3：更新字典加载器

编辑 `src/lib/get-dictionary.ts`：

```typescript
const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  zh: () => import('@/dictionaries/zh.json').then((module) => module.default),
  ja: () => import('@/dictionaries/ja.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),  // ← 添加
}
```

### 步骤 4：测试

访问 `/es` 验证新语言是否正常工作。

---

## 最佳实践

### 1. 翻译键命名

使用嵌套结构组织翻译键：

```json
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

### 2. 保持翻译同步

所有语言文件应该有相同的键结构：

```json
// ✅ 正确
en.json: { "home": { "title": "..." } }
zh.json: { "home": { "title": "..." } }

// ❌ 错误
en.json: { "home": { "title": "..." } }
zh.json: { "page": { "heading": "..." } }  // 键不一致
```

### 3. 提供回退翻译

如果某个键缺失，应该回退到英文：

```typescript
const text = dict.some?.key ?? enDict.some?.key ?? 'Fallback'
```

### 4. 使用常量管理翻译键

```typescript
// constants/translation-keys.ts
export const TRANSLATION_KEYS = {
  NAV: {
    HOME: 'navigation.home',
    POSTS: 'navigation.posts',
  }
} as const
```

---

## SEO 考虑

### Hreflang 标签

在页面 `<head>` 中添加：

```html
<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="zh" href="https://example.com/zh" />
<link rel="alternate" hreflang="ja" href="https://example.com/ja" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

### Sitemap

为每种语言生成 sitemap：

```xml
<url>
  <loc>https://example.com/</loc>
  <xhtml:link rel="alternate" hreflang="zh" href="https://example.com/zh"/>
  <xhtml:link rel="alternate" hreflang="ja" href="https://example.com/ja"/>
</url>
```

---

## 故障排除

### 问题 1：语言切换后显示 404

**原因**：页面文件不支持动态语言参数

**解决**：确保页面组件接收 `params.lang` 参数

### 问题 2：翻译不显示

**原因**：翻译键路径错误

**解决**：检查 JSON 文件中的键路径是否正确

### 问题 3：`/en` 没有重定向

**原因**：middleware 配置问题

**解决**：检查 `middleware.js` 中的重定向逻辑

---

## 技术栈

- **Next.js 14** - App Router
- **TypeScript** - 类型安全
- **Server Components** - 服务端翻译加载
- **Middleware** - 路由处理和重定向

---

## 相关文件

```
src/
├── lib/
│   ├── i18n-config.ts          # 语言配置
│   └── get-dictionary.ts       # 翻译加载器
├── dictionaries/
│   ├── en.json                 # 英文翻译
│   ├── zh.json                 # 中文翻译
│   └── ja.json                 # 日文翻译
├── components/
│   ├── LanguageSwitcher.tsx    # 语言切换器
│   └── Navigation.js           # 导航栏（集成语言切换）
└── middleware.js               # 路由中间件
```

---

## 示例

### 完整页面示例

```typescript
// app/[lang]/page.tsx
import { getDictionary } from '@/lib/get-dictionary'
import { i18n } from '@/lib/i18n-config'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function HomePage({
  params: { lang }
}: {
  params: { lang: Locale }
}) {
  const dict = await getDictionary(lang)

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.subtitle}</p>
      <p>{dict.home.description}</p>
    </div>
  )
}
```

---

**多语言支持让你的 GitBase 项目面向全球用户！** 🌍
