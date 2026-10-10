// scripts/make-404.mjs
// ============================================================================
// GitHub Pages 不支持 SPA 的 history 路由回退：
// 直接访问/刷新 /mentally/men 这类深层地址时会返回 404。
// 这里把构建产物中的 index.html 复制一份为 404.html，
// Pages 就会用 404.html 的内容（也就是整个应用）来响应未命中的路径，
// 前端路由仍能正确解析地址，刷新不再白屏。
// 同时写入 .nojekyll，避免 Pages 用 Jekyll 处理构建产物。
// ============================================================================

import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const indexHtml = resolve(dist, 'index.html')
const notFoundHtml = resolve(dist, '404.html')

if (!existsSync(indexHtml)) {
  console.error('[make-404] 未找到 dist/index.html，请先执行 vite build')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
writeFileSync(resolve(dist, '.nojekyll'), '')
console.log('[make-404] 已生成 dist/404.html 与 dist/.nojekyll（SPA 路由回退）')
