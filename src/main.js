// src\main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts';
import { ArrowLeft } from '@element-plus/icons-vue'

const app = createApp(App)
app.use(ElementPlus)
app.component('ArrowLeft', ArrowLeft)
app.use(router)
app.config.globalProperties.$echarts = echarts;

app.mount('#app')

// createApp(App).mount('#app')