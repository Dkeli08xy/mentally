import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 站点部署在 GitHub Pages 项目地址 https://dkeli08xy.github.io/mentally/ 下，
  // 因此资源与路由前缀都必须是 /mentally/（否则刷新会跳出站点根目录）。
  // 换仓库名/域名时改这里，或临时用：npm run build -- --base=/
  base: '/mentally/',
  build: {
    outDir: 'dist',
    // 本项目是校园活动页，宁可首屏多一个约 50KB(gzip) 的 CSS，也不要
    // 路由级 CSS 预加载失败导致整页白屏（弱网/校园网环境下确实会偶发）。
    // 关闭 CSS 代码分割后，全部样式打进一个文件，随 index.html 一起加载。
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
  },
})
