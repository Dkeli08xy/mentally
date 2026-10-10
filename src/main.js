// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
} from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

const app = createApp(App)

// 按需注册实际用到的 Element Plus 组件。
// 原实现使用 app.use(ElementPlus) 全量引入，首屏 JS 超过 2 MB；
// ElMessage / ElMessageBox 在组件内直接 import，同样支持按需打包。
const components = [ElButton, ElCard, ElEmpty, ElTabs, ElTabPane, ElTable, ElTableColumn]
components.forEach((component) => app.use(component))

app.use(router)
app.mount('#app')
