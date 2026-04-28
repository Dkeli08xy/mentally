<!-- src\components\Reaction\charts.vue -->
<template>
  <div class="charts-page">
    <div class="back-bar">
      <router-link to="/game">
        <button class="back-btn">← 返回游戏主页</button>
      </router-link>
    </div>

    <div class="reaction-charts-wrapper">
      <!-- 简单反应时 -->
      <div class="chart-card">
        <h3>简单视觉反应时 - 成绩分布</h3>
        <div class="tip" :style="{ color: easyTip.color }">{{ easyTip.text }}</div>
        <div ref="chartEasyRef" class="chart-box"></div>
      </div>

      <!-- 选择反应时（舒尔特方格）-->
      <div class="chart-card">
        <h3>选择反应时 - 成绩分布</h3>
        <div class="tip" :style="{ color: hardTip.color }">{{ hardTip.text }}</div>
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
import { ReactionTimeEasyStorage, ReactionTimeHardStorage } from '../../utils/localStorage'
import scoreData from '../../assets/json/Rtime.json'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
let chart1, chart2

const easyList = computed(() => ReactionTimeEasyStorage.getList())
const hardList = computed(() => ReactionTimeHardStorage.getList())

const easyAvg = computed(() => {
  const list = easyList.value
  if (!list.length) return 0
  let sum = 0
  let validCount = 0
  list.forEach(item => {
    let t = item.average || 0
    if (t < 100) t *= 1000
    if (t >= 100 && t <= 5000) {
      sum += t
      validCount++
    }
  })
  return validCount ? Math.round(sum / validCount) : 0
})

const hardAvg = computed(() => {
  const list = hardList.value
  if (!list.length) return 0
  let sum = 0
  let validCount = 0
  list.forEach(item => {
    const t = item.average || 0

    if (t > 0 && t < 30) {
      sum += t
      validCount++
    }
  })
  return validCount ? parseFloat((sum / validCount).toFixed(2)) : 0
})

function getLevelInfo(avg, typeKey) {
  const list = scoreData[typeKey]
  if (!list || avg === 0) return { text: '暂无成绩', color: '#666' }

  for (let item of list) {
    const r = item.区间
    if (r.startsWith('>')) {
      const min = Number(r.replace('>', ''))
      if (avg > min) return {
        text: `你的水平：${item.说明}`,
        color: '#ff4d4f'
      }
    } else {
      const [a, b] = r.split('~').map(Number)
      if (avg >= a && avg < b) return {
        text: `你的水平：${item.说明}`,
        color: '#409eff'
      }
    }
  }
  return { text: '水平未知', color: '#666' }
}

const easyTip = computed(() => getLevelInfo(easyAvg.value, '中国大学生反应时挑战_简单视觉反应时_毫秒'))
const hardTip = computed(() => getLevelInfo(hardAvg.value, '中国成年人舒尔特方格25格_完成时间_秒'))

function getUserRangeIndex(avg, typeKey) {
  const ranges = scoreData[typeKey]
  if (!ranges || avg === 0) return -1
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i].区间
    if (r.startsWith('>')) {
      if (avg > Number(r.replace('>', ''))) return i
    } else {
      const [a, b] = r.split('~').map(Number)
      if (avg >= a && avg < b) return i
    }
  }
  return -1
}

function renderMyChart(el, avg, typeKey, unit) {
  if (!el) return null
  const chart = echarts.init(el)
  
  const originalData = scoreData[typeKey]
  const sortedData = [...originalData].sort((a, b) => {
    const getMinValue = (rangeStr) => {
      if (rangeStr.startsWith('>')) {
        return Number(rangeStr.replace('>', ''))
      } else {
        return Number(rangeStr.split('~')[0])
      }
    }
    return getMinValue(b.区间) - getMinValue(a.区间)
  })
  
  const xData = sortedData.map(i => i.区间)
  const percent = sortedData.map(i => i['人数占比(%)'])
  
  const originalUserIndex = getUserRangeIndex(avg, typeKey)
  let userIndex = -1
  if (originalUserIndex !== -1) {
    const originalRange = originalData[originalUserIndex].区间
    userIndex = sortedData.findIndex(item => item.区间 === originalRange)
  }

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { fontSize: 10 },
      name: `时间(${unit})`,
      nameGap: 25,
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      type: 'value',
      name: '人数占比 %',
      nameGap: 30,
      axisLabel: { formatter: '{value}%' },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    series: [
      {
        type: 'bar',
        data: percent,
        itemStyle: {
          color: (params) => params.dataIndex === userIndex ? '#ff4d4f' : '#409eff',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        type: 'line',
        data: percent,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#666' }
      }
    ],
    graphic: {
      elements: [{
        type: 'text',
        left: 'center',
        top: 5,
        style: {
          text: avg > 0 ? `你的平均分：${avg} ${unit}` : '暂无成绩',
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
  chart1 = renderMyChart(chartEasyRef.value, easyAvg.value, '中国大学生反应时挑战_简单视觉反应时_毫秒', 'ms');
  chart2 = renderMyChart(chartHardRef.value, hardAvg.value, '中国成年人舒尔特方格25格_完成时间_秒', 's');

  window.addEventListener('resize', () => {
    chart1?.resize();
    chart2?.resize();
  });
});

onUnmounted(() => {
  chart1?.dispose();
  chart2?.dispose();
});
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