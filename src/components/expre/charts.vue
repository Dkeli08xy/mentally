<!-- src\components\expre\charts.vue -->
<template>
  <div class="charts-page">
    <div class="back-bar">
      <router-link to="/game">
        <button class="back-btn">← 返回游戏主页</button>
      </router-link>
    </div>

    <div class="reaction-charts-wrapper">
      <!-- 简单微表情 平均正确率雷达图 -->
      <div class="chart-card">
        <h3>简单微表情 - 平均识别能力</h3>
        <div class="tip">{{ easyTip }}</div>
        <div ref="chartEasyRef" class="chart-box"></div>
      </div>

      <!-- 困难微表情 平均正确率雷达图 -->
      <div class="chart-card">
        <h3>困难微表情 - 平均识别能力</h3>
        <div class="tip">{{ hardTip }}</div>
        <div ref="chartHardRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 项目声明 -->
    <div class="statement" style="margin-top:30px;">
      <h4>项目声明</h4>
      <p>1. 本项目为全国大学生心理健康日科普活动，仅用于心理建模知识趣味体验，不构成任何心理诊断。</p>
      <p>2. 所有数据采用匿名化处理，仅用于历史记录查看与科普分析，不收集姓名、学号等敏感信息。</p>
      <p>3. 本工具为游戏化科普内容，旨在展示心理活动可量化特征，不替代专业心理咨询与治疗。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage
} from '../../utils/localStorage'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
let chart1, chart2

const easyList = computed(() => MicroExpressionEasyStorage.getList())
const hardList = computed(() => MicroExpressionHardStorage.getList())

const easyAvgAccuracy = computed(() => {
  const list = easyList.value
  if (!list.length) return 0
  let sum = 0
  list.forEach(item => {
    const acc = item.accuracy || 0
    sum += acc
  })
  return Math.round(sum / list.length)
})

const hardAvgAccuracy = computed(() => {
  const list = hardList.value
  if (!list.length) return 0
  let sum = 0
  list.forEach(item => {
    const acc = item.accuracy || 0
    sum += acc
  })
  return Math.round(sum / list.length)
})

const easyEmotionAvg = computed(() => {
  const emotions = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶']
  const result = {}
  emotions.forEach(e => { result[e] = 0 })

  const list = easyList.value
  if (!list.length) return result

  const countMap = {}
  emotions.forEach(e => { countMap[e] = 0 })

  list.forEach(item => {
    const acc = item.emotionAccuracy || {}
    emotions.forEach(e => {
      if (acc[e] !== undefined) {
        result[e] += acc[e]
        countMap[e] += 1
      }
    })
  })

  emotions.forEach(e => {
    result[e] = countMap[e] ? Math.round(result[e] / countMap[e]) : 0
  })
  return result
})

const hardEmotionAvg = computed(() => {
  const emotions = ['高兴', '悲伤', '愤怒', '恐惧', '惊讶', '厌恶']
  const result = {}
  emotions.forEach(e => { result[e] = 0 })

  const list = hardList.value
  if (!list.length) return result

  const countMap = {}
  emotions.forEach(e => { countMap[e] = 0 })

  list.forEach(item => {
    const acc = item.emotionAccuracy || {}
    emotions.forEach(e => {
      if (acc[e] !== undefined) {
        result[e] += acc[e]
        countMap[e] += 1
      }
    })
  })

  emotions.forEach(e => {
    result[e] = countMap[e] ? Math.round(result[e] / countMap[e]) : 0
  })
  return result
})

const easyTip = computed(() => {
  const avg = easyAvgAccuracy.value
  return avg > 0 ? `平均总正确率：${avg}%` : '暂无简单微表情测试记录'
})

const hardTip = computed(() => {
  const avg = hardAvgAccuracy.value
  return avg > 0 ? `平均总正确率：${avg}%` : '暂无困难微表情测试记录'
})

function renderRadar(el, emotionData, emotions, titleText) {
  if (!el) return null
  const chart = echarts.init(el)

  const data = emotions.map(e => emotionData[e] || 0)

  const option = {
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
        name: '平均识别正确率',
        areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
        lineStyle: { color: '#409eff', width: 3 },
        itemStyle: { color: '#409eff' }
      }]
    }],
    graphic: {
      elements: [{
        type: 'text',
        left: 'center',
        top: 5,
        style: {
          text: titleText,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#333'
        }
      }]
    }
  }

  chart.setOption(option)
  return chart
}

onMounted(() => {
  chart1 = renderRadar(
    chartEasyRef.value,
    easyEmotionAvg.value,
    ['高兴', '悲伤', '愤怒', '恐惧', '惊讶'],
    '各情绪平均识别正确率'
  )

  chart2 = renderRadar(
    chartHardRef.value,
    hardEmotionAvg.value,
    ['高兴', '悲伤', '愤怒', '恐惧', '惊讶', '厌恶'],
    '各情绪平均识别正确率'
  )

  window.addEventListener('resize', () => {
    chart1?.resize()
    chart2?.resize()
  })
})

onUnmounted(() => {
  chart1?.dispose()
  chart2?.dispose()
})
</script>

<style scoped>
.charts-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: #f5f7fa;
}
.back-bar { max-width: 900px; margin: 0 auto 20px; }
.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}
.back-btn:hover { background: #337ecc; }
.reaction-charts-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}
.chart-card h3 {
  text-align: center;
  margin: 0 0 8px;
  font-size: 17px;
  color: #333;
}
.tip {
  text-align: center;
  font-size: 15px;
  margin-bottom: 16px;
  font-weight: 500;
  color: #409eff;
}
.chart-box { width: 100%; height: 360px; }

.statement {
  max-width: 900px;
  margin: 20px auto 0;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}
.statement h4 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}
.statement p {
  margin: 6px 0;
}

@media (max-width: 768px) {
  .charts-page { padding: 15px; }
  .chart-card { padding: 18px; }
  .chart-box { height: 280px; }
}
</style>