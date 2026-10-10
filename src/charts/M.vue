<template>
  <!-- src/charts/M.vue · 单次记忆保持记录详情 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="记忆保持记录详情" :subtitle="typeLabel" back-to="/user" back-label="返回记录列表" />

      <section class="mh-card">
        <div v-if="record">
          <div class="mh-stats">
            <div v-for="(rate, i) in record.rates || []" :key="i" class="mh-stat">
              <span class="mh-stat__label">{{ labels[i] }}后</span>
              <span class="mh-stat__value">{{ rate }}<span class="mh-stat__unit">%</span></span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">遗忘速率 k</span>
              <span class="mh-stat__value">{{ record.kValue ?? '--' }}</span>
              <span class="mh-stat__hint">{{ record.level || '' }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">拟合优度 R²</span>
              <span class="mh-stat__value">{{ record.r2 ?? '--' }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">时间档</span>
              <span class="mh-stat__value">{{ record.presetLabel || '标准版' }}</span>
              <span class="mh-stat__hint">{{ delayText }}</span>
            </div>
          </div>

          <div ref="chartRef" class="mh-chart"></div>

          <div class="mh-conclusion">
            <p class="mh-conclusion__headline">记录信息</p>
            <p class="mh-text">测试时间：{{ formatDateTime(record.createTime) }}</p>
            <p class="mh-text">模式：{{ typeLabel }}（{{ record.pairCount || '--' }} 组词对 / 识记 {{ record.memorizeSeconds || '--' }} 秒）</p>
            <p class="mh-text">时间档：{{ record.presetLabel || '标准版' }} · 延时节点 {{ delayText }}</p>
            <p v-if="record.advice" class="mh-text">{{ record.advice }}</p>
          </div>
        </div>

        <el-empty v-else description="未找到该记录，可能已被删除" />
      </section>

      <section class="mh-statement">
        <h4>说明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '../utils/echarts'
import { useRoute } from 'vue-router'
import PageHead from '../components/common/PageHead.vue'
import { EVENT } from '../config/event'
import { STORAGE_BY_TYPE } from '../utils/localStorage'
import { curveSeries, formatDateTime } from '../utils/analysis'
import { FALLBACK_DELAYS, delaySummary, formatDelay } from '../config/memory'

const route = useRoute()
const chartRef = ref(null)
let chart = null

const delays = computed(() => record.value?.delays || FALLBACK_DELAYS)
const labels = computed(() => delays.value.map(formatDelay))
const delayText = computed(() => delaySummary(delays.value))
const recordId = computed(() => route.query.recordId)
const recordType = computed(() => route.query.type)
const typeLabel = computed(() => (recordType.value === 'memoryHard' ? '进阶模式' : '基础模式'))
const record = ref(null)

function renderChart() {
  if (!chartRef.value || !record.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const rates = record.value.rates || []
  const k = record.value.kValue || 60
  const points = delays.value
  const tMax = Math.max(...points, 60)
  const curve = curveSeries(k, rates[0] || 100, tMax, tMax > 120 ? 5 : 2)
  const measured = rates.map((rate, i) => [points[i], rate])

  chart.setOption({
    grid: { left: 54, right: 24, top: 52, bottom: 40 },
    legend: { data: ['拟合曲线', '实测保留率'], top: 8, textStyle: { color: '#6B7C82' } },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        if (!p) return ''
        return '时间：' + p.data[0] + ' s<br/>' + p.seriesName + '：' + p.data[1] + '%'
      },
    },
    xAxis: {
      type: 'value',
      name: '时间(秒)',
      min: 0,
      max: tMax,
      interval: tMax / 4,
      axisLabel: { formatter: '{value}s' },
    },
    yAxis: { type: 'value', name: '保留率 %', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '拟合曲线',
        type: 'line',
        data: curve,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#3E7CB1' },
        areaStyle: { color: 'rgba(62,124,177,0.12)' },
      },
      {
        name: '实测保留率',
        type: 'line',
        data: measured,
        symbolSize: 12,
        lineStyle: { width: 2, type: 'dashed', color: '#F2A65A' },
        itemStyle: { color: '#F2A65A' },
        label: { show: true, formatter: '{c}%', position: 'top', fontSize: 11, color: '#8a5416' },
      },
    ],
  })
}

function loadAndRender() {
  if (!recordId.value || !recordType.value) return
  const store = STORAGE_BY_TYPE[recordType.value]
  if (!store) return
  record.value = store.getById(recordId.value) || null
  nextTick(renderChart)
}

onMounted(loadAndRender)
onUnmounted(() => {
  if (chart) chart.dispose()
})
watch(() => route.query.recordId, loadAndRender)
</script>
