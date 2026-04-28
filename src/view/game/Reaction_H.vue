<!-- src\view\game\Reaction_H.vue -->
<template>
  <div class="page-container">
    <div class="game-area"><HardGame ref="gameRef" /></div>

    <div v-if="showResult" class="result-area">
      <div style="background:#f8f9fa;padding:15px 20px;border-radius:12px;margin-bottom:20px;">
        <p>最快完成：{{ minTime }} s</p >
        <p>最慢完成：{{ maxTime }} s</p >
        <p>平均用时：{{ avgTime }} s</p >
      </div>
      <div ref="chartRef" class="chart-box"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import HardGame from '../../components/Reaction/hard.vue'
import { ReactionTimeHardStorage } from '../../utils/localStorage'

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
  const minMs = Math.min(...resultData.value.results.map(i => i.reactionTime))
  return (minMs / 1000).toFixed(2)
})

const maxTime = computed(() => {
  if (!resultData.value.results.length) return 0
  const maxMs = Math.max(...resultData.value.results.map(i => i.reactionTime))
  return (maxMs / 1000).toFixed(2)
})

const avgTime = computed(() => {
  if (!resultData.value.averageTime) return 0
  return (resultData.value.averageTime / 1000).toFixed(2)
})

function updateChart() {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)

  const data = resultData.value.results.map(i => (i.reactionTime / 1000).toFixed(2))
  const xData = resultData.value.results.map(i => i.round + '轮')

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: {
      type: 'value',
      name: 's'
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      lineStyle: { width: 3 },
      itemStyle: { color: '#e74c3c' }
    }]
  }

  chartInstance.setOption(option)
  chartInstance.resize()
}

function saveRecord() {
  const { results, averageTime } = resultData.value
  const record = {
    roundTimes: results.map(i => i.reactionTime),
    average: averageTime,
    createTime: new Date().toISOString()
  }
  ReactionTimeHardStorage.save(record)
}

function handleGameComplete(e) {
  resultData.value = e.detail
  nextTick(() => {
    updateChart()
    saveRecord()
  })
}

onMounted(() => {
  window.addEventListener('gameCompleteHard', handleGameComplete)
})

onUnmounted(() => {
  window.removeEventListener('gameCompleteHard', handleGameComplete)
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #eef2f9;
}

.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.result-area {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.stat-box {
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.chart-box {
  width: 100%;
  height: 260px;
}
</style>