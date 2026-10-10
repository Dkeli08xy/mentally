<template>
  <!-- src/charts/R.vue · 单次反应时记录详情 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="反应时记录详情" :subtitle="typeLabel" back-to="/user" back-label="返回记录列表" />

      <section class="mh-card">
        <div v-if="record">
          <div class="mh-stats">
            <div class="mh-stat">
              <span class="mh-stat__label">平均{{ unit === 's' ? '完成' : '反应时' }}</span>
              <span class="mh-stat__value">{{ displayAvg }}<span class="mh-stat__unit">{{ unit }}</span></span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">最快</span>
              <span class="mh-stat__value">{{ displayMin }}<span class="mh-stat__unit">{{ unit }}</span></span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">最慢</span>
              <span class="mh-stat__value">{{ displayMax }}<span class="mh-stat__unit">{{ unit }}</span></span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">波动（CV）</span>
              <span class="mh-stat__value">{{ (record.cv ?? 0) }}</span>
              <span class="mh-stat__hint">{{ stabilityText }}</span>
            </div>
          </div>

          <div ref="chartRef" class="mh-chart"></div>

          <div class="mh-conclusion">
            <p class="mh-conclusion__headline">记录信息</p>
            <p class="mh-text">测试时间：{{ formatDateTime(record.createTime) }}</p>
            <p class="mh-text">模式：{{ typeLabel }}</p>
            <p v-if="record.totalErrors" class="mh-text">点错次数：{{ record.totalErrors }} 次</p>
            <p v-if="record.timeouts" class="mh-text">未反应轮次：{{ record.timeouts }} 次</p>
            <p v-if="record.anticipations" class="mh-text">抢按次数：{{ record.anticipations }} 次</p>
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
import { coefficientOfVariation, formatDateTime, stabilityLabel } from '../utils/analysis'

const route = useRoute()
const chartRef = ref(null)
let chart = null

const recordId = computed(() => route.query.recordId)
const recordType = computed(() => route.query.type)
const isHard = computed(() => recordType.value === 'reactionHard')
const unit = computed(() => (isHard.value ? 's' : 'ms'))
const typeLabel = computed(() => (isHard.value ? '舒尔特方格（进阶）' : '绿点反应（基础）'))

const record = ref(null)

const toUnit = (ms) => (isHard.value ? (ms / 1000).toFixed(2) : ms)
const displayAvg = computed(() => (record.value?.average ? toUnit(record.value.average) : '--'))
const displayMin = computed(() => {
  const times = record.value?.roundTimes || []
  return times.length ? toUnit(Math.min(...times)) : '--'
})
const displayMax = computed(() => {
  const times = record.value?.roundTimes || []
  return times.length ? toUnit(Math.max(...times)) : '--'
})
const stabilityText = computed(() => {
  const cv = record.value?.cv ?? coefficientOfVariation(record.value?.roundTimes || [])
  return stabilityLabel(cv).text
})

function renderChart() {
  if (!chartRef.value || !record.value?.roundTimes?.length) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const times = record.value.roundTimes
  const xData = times.map((_, i) => '第' + (i + 1) + '轮')
  const series = times.map((t) => (isHard.value ? (t / 1000).toFixed(2) : t))

  chart.setOption({
    grid: { left: 56, right: 24, top: 36, bottom: 36 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => v + ' ' + unit.value },
    xAxis: { type: 'category', data: xData, name: '轮次' },
    yAxis: { type: 'value', name: unit.value, scale: true },
    series: [
      {
        name: '成绩',
        type: 'line',
        data: series,
        smooth: true,
        symbolSize: 9,
        lineStyle: { width: 3, color: '#1F8A70' },
        itemStyle: { color: '#1F8A70' },
        areaStyle: { color: 'rgba(31,138,112,0.12)' },
      },
    ],
  })
}

function loadAndRender() {
  if (!recordId.value || !recordType.value) return
  const store = STORAGE_BY_TYPE[recordType.value]
  if (!store) return
  const data = store.getById(recordId.value)
  record.value = data || null
  nextTick(renderChart)
}

onMounted(loadAndRender)
onUnmounted(() => {
  if (chart) chart.dispose()
})
watch(() => route.query.recordId, loadAndRender)
</script>
