<!-- src\charts\E.vue -->
<template>
  <div class="emotion-chart-container">
    <div class="chart-header">
      <el-button @click="goBack" type="default" size="small">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h3>微表情测试详情</h3>
    </div>
    <div ref="chartRef" style="width:100%;height:380px;"></div>
    <div v-if="record" class="chart-info">
      <p>测试时间：{{ formatDateTime(record.createTime) }}</p>
      <p>测试类型：{{ isEasyMode ? '简单微表情' : '困难微表情' }}</p>
      <p>总题数：{{ record.totalRounds || 0 }}</p>
      <p>正确数：{{ record.correctCount || 0 }}</p>
      <p>正确率：{{ record.accuracy || 0 }}%</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage
} from '../utils/localStorage'

const route = useRoute()
const router = useRouter()
const chartRef = ref(null)
let chart = null

const recordId = computed(() => route.query.recordId)
const recordType = computed(() => route.query.type)
const record = ref(null)

const getStorage = () => {
  if (recordType.value === 'microEasy') {
    return MicroExpressionEasyStorage
  }
  if (recordType.value === 'microHard') {
    return MicroExpressionHardStorage
  }
  return null
}

const isEasyMode = computed(() => {
  return recordType.value === 'microEasy'
})

const formatDateTime = (isoString) => {
  if (!isoString) return '--'
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function initChart() {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
}

function renderRadarChart(emotionAccuracy) {
  if (!chart) initChart()
  if (!emotionAccuracy) return
  
  let emotions = []
  if (isEasyMode.value) {
    emotions = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶']
  } else {
    emotions = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶', '厌恶']
  }
  
  const data = emotions.map(e => emotionAccuracy[e] || 0)
  
  const option = {
    title: {
      text: isEasyMode.value ? '简单微表情识别能力分析' : '困难微表情识别能力分析',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: { trigger: 'item' },
    radar: {
      indicator: emotions.map(e => ({ name: e, max: 100 })),
      radius: '70%',
      center: ['50%', '55%'],
      name: { textStyle: { fontSize: 14 } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: data,
        name: '识别正确率',
        areaStyle: { color: 'rgba(102, 126, 234, 0.3)' },
        lineStyle: { color: '#667eea', width: 3 },
        itemStyle: { color: '#667eea' }
      }]
    }]
  }
  chart.setOption(option)
  chart.resize()
}

const loadAndRender = () => {
  if (!recordId.value || !recordType.value) {
    ElMessage.warning('参数错误')
    return
  }
  
  const storage = getStorage()
  if (!storage) {
    ElMessage.error('不支持的记录类型')
    return
  }
  
  const data = storage.getById(recordId.value)
  if (data) {
    record.value = data
    renderRadarChart(data.emotionAccuracy)
  } else {
    ElMessage.error('未找到该记录')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  initChart()
  loadAndRender()
})

onUnmounted(() => {
  if (chart) chart.dispose()
})

watch(() => route.query, () => {
  loadAndRender()
})
</script>

<style scoped>
.emotion-chart-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-header h3 {
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 18px;
  color: #333;
}

.chart-info {
  margin-top: 24px;
  padding: 18px;
  background: #f5f7fa;
  border-radius: 10px;
  line-height: 1.6;
}

.chart-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #444;
}
</style>