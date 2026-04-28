<!-- src\view\game\Expre_S.vue -->
<template>
  <div class="page-container">
    <Game ref="gameRef" />
    <div v-if="showResult" class="result-wrapper">
      <div class="stat-card">
        <p>总题数：{{ totalRounds }}</p>
        <p>正确数：{{ correctCount }}</p>
        <p>正确率：{{ accuracy }}%</p>
      </div>
      
      <!-- 添加表情要点说明 -->
      <div class="expression-tips">
        <h3 class="tips-title">📖 微表情要点</h3>
        <div class="tips-grid">
          <div class="tips-item">
            <strong class="tips-label">😊 高兴</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">嘴角上扬，眼睛眯起，眼角出现鱼尾纹，脸颊提升</p>
          </div>
          <div class="tips-item">
            <strong class="tips-label">😢 悲伤</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">眉毛内角上扬，嘴角下垂，眼睛失去光彩，眼睑下垂</p>
          </div>
          <div class="tips-item">
            <strong class="tips-label">😠 愤怒</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">眉毛下压并聚拢，眼睛瞪大，嘴唇紧闭，下巴前顶</p>
          </div>
          <div class="tips-item">
            <strong class="tips-label">😨 恐惧</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">眉毛上扬并聚拢，眼睛睁大，嘴唇水平拉伸，下巴下垂</p>
          </div>
          <div class="tips-item">
            <strong class="tips-label">😲 惊讶</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">眉毛上扬弯曲，眼睛睁大，嘴巴张开，下巴下沉</p>
          </div>
          <div v-if="showDisgust" class="tips-item">
            <strong class="tips-label">🤢 厌恶</strong>
            <p style="margin:8px 0 0 0;font-size:14px;color:#666;">鼻子皱起，上唇提起，眉毛下压，脸颊提升</p>
          </div>
        </div>
      </div>
      
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import Game from '../../components/expre/simple.vue'
import { MicroExpressionEasyStorage } from '../../utils/localStorage'

const gameRef = ref(null)
const chartRef = ref(null)
let chartInstance = null

const resultData = ref({
  results: [],
  totalRounds: 0,
  correctCount: 0,
  accuracy: 0,
  emotionAccuracy: {}
})

const showResult = computed(() => resultData.value.results.length > 0)
const totalRounds = computed(() => resultData.value.totalRounds)
const correctCount = computed(() => resultData.value.correctCount)
const accuracy = computed(() => resultData.value.accuracy)
const showDisgust = computed(() => {
  return false
})

function updateChart() {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  const emotions = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶']
  const data = emotions.map(e => resultData.value.emotionAccuracy[e] || 0)
  const option = {
    title: {
      text: '微表情识别能力雷达图',
      left: 'center',
      top: 0,
      textStyle: { fontSize: 14 }
    },
    tooltip: { trigger: 'item' },
    radar: {
      indicator: emotions.map(e => ({ name: e, max: 100 })),
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      name: { textStyle: { fontSize: 12 } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: data,
        name: '识别正确率',
        areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      }]
    }]
  }
  chartInstance.setOption(option)
  chartInstance.resize()
}

function handleGameComplete(e) {
  resultData.value = e.detail
  nextTick(() => {
    updateChart()
    saveRecord()
  })
}

function saveRecord() {
  const { results, totalRounds, correctCount, accuracy, emotionAccuracy } = resultData.value
  
  const record = {
    results: results,
    totalRounds: totalRounds,
    correctCount: correctCount,
    accuracy: accuracy,
    emotionAccuracy: emotionAccuracy,
    createTime: new Date().toISOString()
  }
  MicroExpressionEasyStorage.save(record)
}

onMounted(() => {
  window.addEventListener('expressionComplete', handleGameComplete)
})

onUnmounted(() => {
  window.removeEventListener('expressionComplete', handleGameComplete)
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
}

.result-wrapper {
  margin: 30px auto;
  max-width: 800px;
  padding: 0 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.expression-tips {
  background: #e8f4fd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.tips-title {
  margin: 0 0 15px 0;
  color: #409eff;
  font-size: 18px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.tips-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
}

.tips-label {
  color: #409eff;
}

.tips-desc {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #666;
}

.chart-container {
  height: 350px;
  background: white;
  border-radius: 12px;
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
    padding: 14px;
  }
  .expression-tips {
    padding: 16px;
  }
  .tips-grid {
    grid-template-columns: 1fr;
  }
  .chart-container {
    height: 300px;
  }
}
</style>