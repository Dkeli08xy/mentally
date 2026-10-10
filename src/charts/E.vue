<template>
  <!-- src/charts/E.vue · 单次情绪识别记录详情 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="情绪识别记录详情" :subtitle="typeLabel" back-to="/user" back-label="返回记录列表" />

      <section class="mh-card">
        <div v-if="record">
          <div class="mh-stats">
            <div class="mh-stat">
              <span class="mh-stat__label">总题数</span>
              <span class="mh-stat__value">{{ record.totalRounds ?? '--' }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">正确数</span>
              <span class="mh-stat__value">{{ record.correctCount ?? '--' }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">正确率</span>
              <span class="mh-stat__value">{{ record.accuracy ?? '--' }}<span class="mh-stat__unit">%</span></span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">平均每题用时</span>
              <span class="mh-stat__value">{{ record.avgDuration ? (record.avgDuration / 1000).toFixed(1) : '--' }}<span class="mh-stat__unit">s</span></span>
            </div>
          </div>

          <div ref="chartRef" class="mh-chart"></div>

          <div class="mh-conclusion">
            <p class="mh-conclusion__headline">记录信息</p>
            <p class="mh-text">测试时间：{{ formatDateTime(record.createTime) }}</p>
            <p class="mh-text">模式：{{ typeLabel }}</p>
            <ul v-if="record.confusion && record.confusion.length" class="confusion">
              <li v-for="c in record.confusion" :key="c.actual + c.chosen">
                把「{{ c.actual }}」认成「{{ c.chosen }}」：{{ c.count }} 次
              </li>
            </ul>
          </div>
        </div>

        <el-empty v-else description="未找到该记录，可能已被删除" />
      </section>

      <section class="mh-statement">
        <h4>说明</h4>
        <p>{{ EMOTION_NOTE }}</p>
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
import { EMOTION_NOTE, EMOTIONS_EASY, EMOTIONS_HARD } from '../config/emotions'
import { STORAGE_BY_TYPE } from '../utils/localStorage'
import { formatDateTime } from '../utils/analysis'

const route = useRoute()
const chartRef = ref(null)
let chart = null

const recordId = computed(() => route.query.recordId)
const recordType = computed(() => route.query.type)
const isHard = computed(() => recordType.value === 'microHard')
const typeLabel = computed(() => (isHard.value ? '进阶模式' : '基础模式'))
const emotions = computed(() => (isHard.value ? EMOTIONS_HARD : EMOTIONS_EASY))
const record = ref(null)

function renderChart() {
  if (!chartRef.value || !record.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const acc = record.value.emotionAccuracy || {}
  chart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: emotions.value.map((e) => ({ name: e, max: 100 })),
      radius: '65%',
      center: ['50%', '55%'],
      splitArea: { areaStyle: { color: ['#f7fbf9', '#eef6f3'] } },
      axisName: { color: '#40525a', fontSize: 12 },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: emotions.value.map((e) => acc[e] || 0),
            name: '各情绪正确率',
            areaStyle: { color: 'rgba(31,138,112,0.25)' },
            lineStyle: { color: '#1F8A70', width: 2 },
            itemStyle: { color: '#1F8A70' },
          },
        ],
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

<style scoped>
.confusion {
  margin: 8px 0 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.9;
  color: #8a5416;
}
</style>
