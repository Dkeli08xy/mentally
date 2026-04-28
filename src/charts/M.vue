<!-- src\charts\M.vue -->
<template>
  <div class="msc-chart-container">
    <div class="chart-header">
      <el-button @click="goBack" type="default" size="small">
        <ArrowLeft /> 返回
      </el-button>
      <h3>记忆衰减测试详情</h3>
    </div>

    <div ref="chartRef" style="width:100%;height:380px;"></div>

    <div v-if="record" class="chart-info">
      <p>测试时间：{{ formatDateTime(record.createTime) }}</p>
      <p>遗忘速率 k：{{ record.kValue?.toFixed(2) || '--' }}</p>
      <p>0秒记忆保留率：{{ record.rates?.[0] || 0 }}%</p>
      <p>20秒记忆保留率：{{ record.rates?.[1] || 0 }}%</p>
      <p>60秒记忆保留率：{{ record.rates?.[2] || 0 }}%</p>
      <p>120秒记忆保留率：{{ record.rates?.[3] || 0 }}%</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
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
  return storageMap[type] || MemoryDecayEasyStorage
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

function renderMemoryChart(data) {
  if (!chart) initChart()

  const k = data.kValue || 50
  const initial = 100

  const timePoints = []
  const ratePoints = []
  for (let t = 0; t <= 120; t += 2) {
    timePoints.push(t)
    const rate = initial * Math.exp(-t / k)
    ratePoints.push(parseFloat(rate.toFixed(2)))
  }

  const realPoints = [
    { x: 0, y: data.rates?.[0] || 100 },
    { x: 20, y: data.rates?.[1] || 0 },
    { x: 60, y: data.rates?.[2] || 0 },
    { x: 120, y: data.rates?.[3] || 0 }
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        if (p.seriesName === '理论遗忘曲线') {
          return `时间: ${p.data[0]}s<br/>保留率: ${p.data[1]}%`
        } else {
          return `时间: ${p.data[0]}s<br/>实测保留率: ${p.data[1]}%`
        }
      }
    },
    legend: {
      data: ['理论遗忘曲线', '实测保留率'],
      top: 10
    },
    xAxis: {
      type: 'value',
      name: '时间(秒)',
      min: 0,
      max: 120,
      interval: 20
    },
    yAxis: {
      type: 'value',
      name: '记忆保留率 %',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '理论遗忘曲线',
        type: 'line',
        data: timePoints.map((t, i) => [t, ratePoints[i]]),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#667eea' }
      },
      {
        name: '实测保留率',
        type: 'scatter',
        data: realPoints.map(p => [p.x, p.y]),
        symbolSize: 12,
        itemStyle: { color: '#e74c3c' }
      }
    ],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      top: '15%'
    }
  }

  chart.setOption(option)
  chart.resize()
}

const loadAndRender = () => {
  if (!recordId.value) return
  const storage = getStorage()
  const data = storage.getById(recordId.value)
  if (data) {
    record.value = data
    renderMemoryChart(data)
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
.msc-chart-container {
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
  padding: 18px;
  background: #f5f7fa;
  border-radius: 10px;
  line-height: 1.6;
}

.chart-info p {
  margin: 8px 0;
  font-size: 14px;
}
</style>