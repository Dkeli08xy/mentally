<!-- src\view\game\Memory_S.vue -->
<template>
  <div class="page-container">
    <Game ref="gameRef" />

    <div v-if="showResult" class="result-wrapper">
      <div class="stat-card">
        <p>20秒后正确率：{{ rate20 }}%</p>
        <p>1分钟后正确率：{{ rate60 }}%</p>
        <p>2分钟后正确率：{{ rate120 }}%</p>
        <p>遗忘速率参数 k：{{ kValue.toFixed(2) }}</p>
      </div>
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import Game from '../../components/memory/simple.vue'
import { MemoryDecayEasyStorage } from '../../utils/localStorage'

const gameRef = ref(null)
const chartRef = ref(null)
let chartInstance = null

const resultData = ref({
  rate20: 0,
  rate60: 0,
  rate120: 0,
  kValue: 0,
  points: []
})

const showResult = computed(() => resultData.value.points.length > 0)

const rate20 = computed(() => resultData.value.rate20 || 0)
const rate60 = computed(() => resultData.value.rate60 || 0)
const rate120 = computed(() => resultData.value.rate120 || 0)
const kValue = computed(() => resultData.value.kValue || 0)

// 遗忘曲线：保留率 = 初始 × e^(-t/k)
function updateChart() {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  const k = resultData.value.kValue || 50
  const initial = 100
  const times = [0, 20, 60, 120]
  const seriesData = times.map(t => initial * Math.exp(-t / k))

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['0s', '20s', '60s', '120s'],
      name: '时间'
    },
    yAxis: {
      type: 'value',
      name: '保留率 %',
      min: 0,
      max: 100
    },
    series: [{
      data: seriesData,
      type: 'line',
      smooth: true,
      lineStyle: { width: 3 },
      itemStyle: { color: '#5B7BD2' },
      name: '记忆衰减'
    }]
  }
  chartInstance.setOption(option)
  chartInstance.resize()
}

function handleGameComplete(e) {
  resultData.value = e.detail
  setTimeout(() => {
    updateChart()
    saveRecord()
  }, 100)
}

function saveRecord() {
  const { rate20, rate60, rate120, kValue, points } = resultData.value
  const record = {
    rates: [rate20, rate60, rate120],
    kValue,
    points,
    createTime: new Date().toISOString()
  }
  MemoryDecayEasyStorage.save(record)
}

function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('memoryComplete', handleGameComplete)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('memoryComplete', handleGameComplete)
  window.removeEventListener('resize', handleResize)
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background: #eef2f9;
}


.page-container > :first-child,
.result-wrapper,
.stat-card,
.chart-container {
  width: 100%;
  max-width: 800px; 
}


.page-container > :first-child {
  flex-shrink: 0;
  margin-bottom: 30px;
}


.result-wrapper {
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.stat-card {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  width: 100%;
}

.chart-container {
  height: 300px;
  width: 100%;
  overflow: visible;
  min-height: 240px;
}


@media (max-width: 768px) {
  .page-container {
    padding: 10px 0;
  }
  .result-wrapper {
    padding: 0 10px;
  }
  .stat-card {
    padding: 12px 15px;
    font-size: 14px;
  }
  .chart-container {
    height: 240px;
    width: 100%;
  }
}
</style>