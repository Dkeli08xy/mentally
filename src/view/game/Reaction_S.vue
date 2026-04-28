<!-- src\view\game\Reaction_S.vue -->
<template>
  <div class="page-container">
    <Game ref="gameRef" />

    <div v-if="showResult" class="result-wrapper">
      <div class="stat-card">
        <p>最快反应时间：{{ minTime }} ms</p>
        <p>最慢反应时间：{{ maxTime }} ms</p>
        <p>平均反应时间：{{ avgTime }} ms</p>
      </div>
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import Game from '../../components/Reaction/simple.vue'
import { ReactionTimeEasyStorage } from '../../utils/localStorage'

const gameRef = ref(null)
const chartRef = ref(null)
let chartInstance = null

const resultData = ref({
  results: [],
  averageTime: 0
})

const showResult = computed(() => resultData.value.results.length > 0)

const minTime = computed(() => {
  if (!resultData.value.results.length) return 0
  return Math.min(...resultData.value.results.map(i => i.reactionTime))
})

const maxTime = computed(() => {
  if (!resultData.value.results.length) return 0
  return Math.max(...resultData.value.results.map(i => i.reactionTime))
})

const avgTime = computed(() => resultData.value.averageTime || 0)

function updateChart() {
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const data = resultData.value.results.map(i => i.reactionTime)
  const xData = resultData.value.results.map(i => i.round + '次')

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xData
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
      itemStyle: { color: '#667eea' }
    }]
  }

  chartInstance.setOption(option)
}

function handleGameComplete(e) {
  resultData.value = e.detail
  setTimeout(() => {
    updateChart()
    saveTestRecord()
  }, 100)
}

function saveTestRecord() {
  const { results, averageTime } = resultData.value
  const record = {
    roundTimes: results.map(item => item.reactionTime),
    average: averageTime,
    createTime: new Date().toISOString()
  }
  ReactionTimeEasyStorage.save(record)
}

onMounted(() => {
  window.addEventListener('gameComplete', handleGameComplete)
})

onUnmounted(() => {
  window.removeEventListener('gameComplete', handleGameComplete)
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
.stat-card,
.chart-container {
  width: 100%;
  max-width: 800px;
}

.page-container > :first-child {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.result-wrapper {
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.chart-container {
  height: 300px;
  background: #ffffff;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-container {
    padding: 10px 0;
  }
  .result-wrapper {
    padding: 0 10px;
  }
  .stat-card {
    padding: 16px;
    font-size: 14px;
  }
  .chart-container {
    height: 240px !important;
    padding: 16px;
  }
}
</style>