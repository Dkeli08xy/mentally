<!-- src\components\memory\charts.vue -->
<template>
  <div class="charts-page">
    <div class="back-bar">
      <router-link to="/game">
        <button class="back-btn">← 返回游戏主页</button>
      </router-link>
    </div>

    <div class="memory-charts-wrapper">
      <!-- 综合模式（简单+困难合并） -->
      <div class="chart-card combined-card" v-if="combinedStats.count > 0">
        <h3>📊 综合模式 - 记忆衰减曲线（简单+困难）</h3>
        <div class="stats-summary combined">
          <div class="stat-item">
            <span class="stat-label">测试总次数</span>
            <span class="stat-value">{{ combinedStats.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">简单模式次数</span>
            <span class="stat-value">{{ easyStats.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">困难模式次数</span>
            <span class="stat-value">{{ hardStats.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">综合平均遗忘速率 k</span>
            <span class="stat-value">{{ combinedStats.avgK.toFixed(2) }}</span>
          </div>
        </div>
        <div ref="chartCombinedRef" class="chart-box"></div>
        <div class="rates-info">
          <div class="rate-item">0秒: {{ combinedStats.avgRates[0]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">20秒: {{ combinedStats.avgRates[1]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">60秒: {{ combinedStats.avgRates[2]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">120秒: {{ combinedStats.avgRates[3]?.toFixed(1) || 0 }}%</div>
        </div>
      </div>

      <!-- 简单模式记忆衰减 -->
      <div class="chart-card">
        <h3>🎯 简单模式 - 记忆衰减曲线</h3>
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-label">测试次数</span>
            <span class="stat-value">{{ easyStats.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均遗忘速率 k</span>
            <span class="stat-value">{{ easyStats.avgK.toFixed(2) }}</span>
          </div>
        </div>
        <div ref="chartEasyRef" class="chart-box"></div>
        <div v-if="easyStats.count > 0" class="rates-info">
          <div class="rate-item">0秒: {{ easyStats.avgRates[0]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">20秒: {{ easyStats.avgRates[1]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">60秒: {{ easyStats.avgRates[2]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">120秒: {{ easyStats.avgRates[3]?.toFixed(1) || 0 }}%</div>
        </div>
        <div v-else class="empty-tip">暂无数据，请先完成简单模式测试</div>
      </div>

      <!-- 困难模式记忆衰减 -->
      <div class="chart-card">
        <h3>⚡ 困难模式 - 记忆衰减曲线</h3>
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-label">测试次数</span>
            <span class="stat-value">{{ hardStats.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均遗忘速率 k</span>
            <span class="stat-value">{{ hardStats.avgK.toFixed(2) }}</span>
          </div>
        </div>
        <div ref="chartHardRef" class="chart-box"></div>
        <div v-if="hardStats.count > 0" class="rates-info">
          <div class="rate-item">0秒: {{ hardStats.avgRates[0]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">20秒: {{ hardStats.avgRates[1]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">60秒: {{ hardStats.avgRates[2]?.toFixed(1) || 0 }}%</div>
          <div class="rate-item">120秒: {{ hardStats.avgRates[3]?.toFixed(1) || 0 }}%</div>
        </div>
        <div v-else class="empty-tip">暂无数据，请先完成困难模式测试</div>
      </div>
    </div>

    <!-- 项目声明 -->
    <div class="statement">
      <h4>项目声明</h4>
      <p>1. 本项目为全国大学生心理健康日科普活动，仅用于心理建模知识趣味体验，不构成任何心理诊断。</p>
      <p>2. 所有数据采用匿名化处理，仅用于历史记录查看与科普分析，不收集姓名、学号等敏感信息。</p>
      <p>3. 本工具为游戏化科普内容，旨在展示心理活动可量化特征，不替代专业心理咨询与治疗。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { MemoryDecayEasyStorage, MemoryDecayHardStorage } from '../../utils/localStorage'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
const chartCombinedRef = ref(null)
let chartEasy = null
let chartHard = null
let chartCombined = null

const easyStats = computed(() => {
  const list = MemoryDecayEasyStorage.getList()
  if (!list.length) {
    return { count: 0, avgK: 50, avgRates: [0, 0, 0, 0] }
  }
  
  let sumK = 0
  let validKCount = 0
  const sumRates = [0, 0, 0, 0]
  
  list.forEach(record => {
    if (record.kValue && !isNaN(record.kValue) && record.kValue > 0) {
      sumK += record.kValue
      validKCount++
    }
    if (record.rates && Array.isArray(record.rates)) {
      record.rates.forEach((rate, idx) => {
        if (idx < 4 && rate !== undefined && !isNaN(rate)) {
          sumRates[idx] += rate
        }
      })
    }
  })
  
  return {
    count: list.length,
    avgK: validKCount > 0 ? sumK / validKCount : 50,
    avgRates: sumRates.map(sum => list.length > 0 ? sum / list.length : 0)
  }
})

const hardStats = computed(() => {
  const list = MemoryDecayHardStorage.getList()
  if (!list.length) {
    return { count: 0, avgK: 50, avgRates: [0, 0, 0, 0] }
  }
  
  let sumK = 0
  let validKCount = 0
  const sumRates = [0, 0, 0, 0]
  
  list.forEach(record => {
    if (record.kValue && !isNaN(record.kValue) && record.kValue > 0) {
      sumK += record.kValue
      validKCount++
    }
    if (record.rates && Array.isArray(record.rates)) {
      record.rates.forEach((rate, idx) => {
        if (idx < 4 && rate !== undefined && !isNaN(rate)) {
          sumRates[idx] += rate
        }
      })
    }
  })
  
  return {
    count: list.length,
    avgK: validKCount > 0 ? sumK / validKCount : 50,
    avgRates: sumRates.map(sum => list.length > 0 ? sum / list.length : 0)
  }
})

const combinedStats = computed(() => {
  const easyList = MemoryDecayEasyStorage.getList()
  const hardList = MemoryDecayHardStorage.getList()
  const allRecords = [...easyList, ...hardList]
  
  if (!allRecords.length) {
    return { count: 0, avgK: 50, avgRates: [0, 0, 0, 0] }
  }
  
  let sumK = 0
  let validKCount = 0
  const sumRates = [0, 0, 0, 0]
  
  allRecords.forEach(record => {
    if (record.kValue && !isNaN(record.kValue) && record.kValue > 0) {
      sumK += record.kValue
      validKCount++
    }
    if (record.rates && Array.isArray(record.rates)) {
      record.rates.forEach((rate, idx) => {
        if (idx < 4 && rate !== undefined && !isNaN(rate)) {
          sumRates[idx] += rate
        }
      })
    }
  })
  
  return {
    count: allRecords.length,
    avgK: validKCount > 0 ? sumK / validKCount : 50,
    avgRates: sumRates.map(sum => allRecords.length > 0 ? sum / allRecords.length : 0)
  }
})

function renderMemoryChart(chartInstance, stats, title, color = '#409eff') {
  if (!chartInstance || !stats || stats.count === 0) return
  
  const k = stats.avgK || 50
  const initial = 100
  
  const timePoints = []
  const ratePoints = []
  for (let t = 0; t <= 120; t += 2) {
    timePoints.push(t)
    const rate = initial * Math.exp(-t / k)
    ratePoints.push(parseFloat(rate.toFixed(2)))
  }
  
  const realPoints = [
    { x: 0, y: stats.avgRates[0] || 0 },
    { x: 20, y: stats.avgRates[1] || 0 },
    { x: 60, y: stats.avgRates[2] || 0 },
    { x: 120, y: stats.avgRates[3] || 0 }
  ]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        if (p.seriesName === '理论遗忘曲线') {
          return `时间: ${p.data[0]}s<br/>理论保留率: ${p.data[1]}%`
        } else if (p.seriesName === '平均实测保留率') {
          return `时间: ${p.data[0]}s<br/>平均保留率: ${p.data[1]}%<br/>（基于 ${stats.count} 次测试）`
        }
        return ''
      }
    },
    legend: {
      data: ['理论遗忘曲线', '平均实测保留率'],
      top: 10,
      left: 'center'
    },
    title: {
      show: true,
      text: `${title} - 基于 ${stats.count} 次测试`,
      left: 'center',
      top: 0,
      textStyle: { fontSize: 12, fontWeight: 'normal' }
    },
    xAxis: {
      type: 'value',
      name: '时间(秒)',
      min: 0,
      max: 120,
      interval: 20,
      axisLabel: { formatter: '{value}s' }
    },
    yAxis: {
      type: 'value',
      name: '记忆保留率 %',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        name: '理论遗忘曲线',
        type: 'line',
        data: timePoints.map((t, i) => [t, ratePoints[i]]),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: color },
        areaStyle: { opacity: 0.1, color: color }
      },
      {
        name: '平均实测保留率',
        type: 'scatter',
        data: realPoints.map(p => [p.x, p.y]),
        symbolSize: 10,
        itemStyle: { color: '#ff4d4f', borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          formatter: (params) => `${params.value[1]}%`,
          position: 'top',
          offset: [0, -8],
          fontSize: 11
        }
      },
      {
        name: '连线',
        type: 'line',
        data: realPoints.map(p => [p.x, p.y]),
        lineStyle: { width: 1.5, color: '#ff4d4f', type: 'dashed' },
        showSymbol: false,
        smooth: false
      }
    ],
    grid: {
      left: '10%',
      right: '8%',
      bottom: '10%',
      top: '18%',
      containLabel: true
    }
  }
  
  chartInstance.setOption(option, true)
  chartInstance.resize()
}

function initCharts() {
  if (chartEasyRef.value) {
    if (chartEasy) chartEasy.dispose()
    chartEasy = echarts.init(chartEasyRef.value)
    if (easyStats.value.count > 0) {
      renderMemoryChart(chartEasy, easyStats.value, '简单模式', '#409eff')
    }
  }
  
  if (chartHardRef.value) {
    if (chartHard) chartHard.dispose()
    chartHard = echarts.init(chartHardRef.value)
    if (hardStats.value.count > 0) {
      renderMemoryChart(chartHard, hardStats.value, '困难模式', '#e74c3c')
    }
  }
  
  if (chartCombinedRef.value && combinedStats.value.count > 0) {
    if (chartCombined) chartCombined.dispose()
    chartCombined = echarts.init(chartCombinedRef.value)
    renderMemoryChart(chartCombined, combinedStats.value, '综合模式', '#9b59b6')
  }
}

const handleResize = () => {
  chartEasy?.resize()
  chartHard?.resize()
  chartCombined?.resize()
}

watch([easyStats, hardStats, combinedStats], () => {
  nextTick(() => {
    initCharts()
  })
}, { deep: true })

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartEasy?.dispose()
  chartHard?.dispose()
  chartCombined?.dispose()
  window.removeEventListener('resize', handleResize)
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

.back-bar {
  max-width: 1000px;
  margin: 0 auto 20px;
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}

.back-btn:hover {
  background: #337ecc;
}

.memory-charts-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.combined-card {
  background: linear-gradient(135deg, #fff 0%, #f8f0ff 100%);
  border: 1px solid #dcd0ff;
}

.chart-card h3 {
  text-align: center;
  margin: 0 0 15px;
  font-size: 18px;
  color: #333;
}

.stats-summary {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.stats-summary.combined {
  background: linear-gradient(135deg, #f3e8ff 0%, #e8f0fe 100%);
}

.stat-item {
  text-align: center;
  min-width: 100px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.combined .stat-value {
  color: #9b59b6;
}

.rates-info {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.rate-item {
  font-size: 13px;
  color: #555;
  font-weight: 500;
  padding: 4px 8px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.empty-tip {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.chart-box {
  width: 100%;
  height: 350px;
}

.statement {
  max-width: 1000px;
  margin: 30px auto 0;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.statement h4 {
  margin: 0 0 10px;
  font-size: 15px;
  color: #333;
}

.statement p {
  margin: 6px 0;
}

@media (max-width: 768px) {
  .charts-page {
    padding: 12px;
  }
  
  .chart-card {
    padding: 16px;
  }
  
  .chart-card h3 {
    font-size: 16px;
  }
  
  .chart-box {
    height: 280px;
  }
  
  .stats-summary {
    gap: 15px;
  }
  
  .stat-item {
    min-width: 70px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .stat-label {
    font-size: 11px;
  }
  
  .rates-info {
    gap: 8px;
  }
  
  .rate-item {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .statement {
    padding: 12px 16px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .stats-summary {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .stat-item {
    width: 100%;
    max-width: 150px;
  }
  
  .rates-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-box {
    height: 250px;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>