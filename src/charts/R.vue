<!-- src/charts/R.vue -->
<template>
  <div class="rs-chart-container">
    <div class="chart-header">
      <el-button @click="goBack" type="default" size="small">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h3>反应时测试详情</h3>
    </div>
    <div ref="chartRef" style="width:100%;height:300px;"></div>
    <div v-if="record" class="chart-info">
      <p>测试时间：{{ formatDateTime(record.createTime) }}</p>
      <p>平均反应时：{{ record.average || '--' }} （简单：ms ， 困难：s）</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  ReactionTimeEasyStorage, 
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage
} from '../utils/localStorage'

const route = useRoute()
const router = useRouter()

const chartRef = ref(null)
let chart = null

const recordId = computed(() => route.query.recordId)
const recordType = computed(() => route.query.type)

const getStorage = () => {
  const type = recordType.value
  const storageMap = {
    reactionEasy: ReactionTimeEasyStorage,
    reactionHard: ReactionTimeHardStorage,
    memoryEasy: MemoryDecayEasyStorage,
    memoryHard: MemoryDecayHardStorage,
    microEasy: MicroExpressionEasyStorage,
    microHard: MicroExpressionHardStorage
  }
  return storageMap[type] || ReactionTimeHardStorage
}

const record = ref(null)

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

function renderChart(data) {
  if (!chart) initChart()
  
  const xData = data.map((_, index) => `第${index + 1}轮`)
  
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xData,
      name: '轮次'
    },
    yAxis: {
      type: 'value',
      name: 'ms'
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      lineStyle: { width: 3 },
      itemStyle: { color: '#667eea' },
      areaStyle: {
        opacity: 0.1,
        color: '#667eea'
      }
    }],
    grid: {
      containLabel: true,
      left: '10%',
      right: '10%'
    }
  }

  chart.setOption(option)
  chart.resize()
}

const loadAndRender = () => {
  if (!recordId.value) return
  
  const storage = getStorage()
  const data = storage.getById(recordId.value)
  
  if (data && data.roundTimes) {
    record.value = data
    renderChart(data.roundTimes)
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

import { watch } from 'vue'
watch(() => route.query.recordId, () => {
  loadAndRender()
})
</script>

<style scoped>
.rs-chart-container {
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
}

.chart-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.chart-info p {
  margin: 8px 0;
}
</style>