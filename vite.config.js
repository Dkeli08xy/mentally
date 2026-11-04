import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 路由使用 hash 模式，构建产物与部署路径无关：
  // 放到 GitHub Pages 的 /mentally/ 子目录、任意静态空间，甚至本地直接打开都能运行。
  base: './',
  build: {
    outDir: 'dist',
    // 本项目是校园活动页，宁可首屏多一个约 50KB(gzip) 的 CSS，也不要
    // 路由级 CSS 预加载失败导致整页白屏（弱网/校园网环境下确实会偶发）。
    // 关闭 CSS 代码分割后，全部样式打进一个文件，随 index.html 一起加载。
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
  },
})
