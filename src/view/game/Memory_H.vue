<!-- src\view\game\Memory_H.vue -->
<template>
  <div class="page-container">
    <Game ref="gameRef" />

    <div v-if="showResult" class="result-wrapper">
      <div class="stat-card">
        <p>0秒后正确率：{{ rate0 }}%</p>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import Game from '../../components/memory/hard.vue'
import { MemoryDecayHardStorage } from '../../utils/localStorage'

const gameRef = ref(null)
const chartRef = ref(null)
let chartInstance = null

const resultData = ref({
  rate0: 100,
  rate20: 0,
  rate60: 0,
  rate120: 0,
  kValue: 0,
  points: []
})

const showResult = computed(() => resultData.value.points.length > 0)

const rate0 = computed(() => resultData.value.rate0 || 100)
const rate20 = computed(() => resultData.value.rate20 || 0)
const rate60 = computed(() => resultData.value.rate60 || 0)
const rate120 = computed(() => resultData.value.rate120 || 0)
const kValue = computed(() => resultData.value.kValue || 0)

function handleResize() {
  if (chartInstance) chartInstance.resize()
}

function updateChart() {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  let times = ['0s', '20s', '60s', '120s'];
  let seriesData = [
    rate0.value, 
    rate20.value, 
    rate60.value, 
    rate120.value
  ];

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: times
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
      lineStyle: { width: 3, color: '#7963B7' },
      itemStyle: { color: '#7963B7' },
      name: '记忆衰减'
    }]
  }
  
  chartInstance.setOption(option)
  chartInstance.resize()
}

function handleGameComplete(e) {
  resultData.value = e.detail
  // 公式：R(t) = R0 * e^(-t/k) -> k = -t / ln(Rt/R0)
  if (resultData.value.rate0 > 90 && resultData.value.rate20 > 0) {
      const k = -20 / Math.log(resultData.value.rate20 / resultData.value.rate0);
      resultData.value.kValue = Math.abs(k);
  }
  
  setTimeout(() => {
    updateChart()
    saveRecord()
  }, 100)
}

function saveRecord() {
  const { rate0, rate20, rate60, rate120, kValue, points } = resultData.value
  const record = {
    rates: [rate0, rate20, rate60, rate120],
    kValue: kValue,
    points: points,
    createTime: new Date().toISOString()
  }
  MemoryDecayHardStorage.save(record)
}

onMounted(() => {
  window.addEventListener('memoryHardComplete', handleGameComplete)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('memoryHardComplete', handleGameComplete)
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

.page-container > :first-child {
  flex-shrink: 0;
  margin-bottom: 30px;
  width: 100%;
  max-width: 800px;
}

.result-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card {
  width: 100%;
  background: #f9f7ff;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
  min-height: 240px;
  overflow: visible;
}

@media (max-width: 768px) {
  .page-container {
    padding: 10px 0;
  }
  .result-wrapper {
    padding: 0 15px;
  }
  .stat-card {
    padding: 12px 15px;
    font-size: 14px;
  }
  .chart-container {
    height: 240px;
  }
}
</style>