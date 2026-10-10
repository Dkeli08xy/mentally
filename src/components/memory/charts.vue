<template>
  <!-- src/components/memory/charts.vue · 记忆保持成绩分布（汇总）
       注意：不同「整体时间档」的延时节点不同，成绩不具可比性，
       因此这里按档位分组统计，默认展示记录数最多的那一档。 -->
  <div class="mh-page">
    <div class="mh-shell">
      <PageHead title="记忆保持 · 成绩分布" subtitle="把同一时间档的多次测试拟合成一条曲线" back-to="/game" back-label="返回游戏主页" />

      <section v-if="!schemes.length" class="mh-card">
        <h2 class="mh-section-title">还没有成绩</h2>
        <p class="mh-text">完成一次记忆保持挑战后，这里会按你选择的时间档分别汇总。</p>
        <router-link to="/M_S" class="mh-btn mh-btn--primary">去挑战基础模式</router-link>
      </section>

      <template v-else>
        <section class="mh-card">
          <h2 class="mh-section-title">时间档</h2>
          <div class="schemes">
            <button
              v-for="s in schemes"
              :key="s.key"
              class="scheme"
              :class="{ 'scheme--active': s.key === activeSchemeKey }"
              @click="activeSchemeKey = s.key"
            >
              <span class="scheme__label">{{ s.label }}</span>
              <span class="scheme__desc">{{ s.desc }}</span>
              <span class="scheme__count">{{ s.count }} 次记录</span>
            </button>
          </div>
          <p class="mh-text mh-muted">
            延时节点不同，记忆衰减的读数不能直接比较，所以这里把不同时间档分开统计。
          </p>
        </section>

        <section v-if="combined.count" class="mh-card">
          <h2 class="mh-section-title">{{ activeScheme.label }} · 综合（基础 + 进阶）</h2>
          <div class="mh-stats">
            <div class="mh-stat">
              <span class="mh-stat__label">测试总次数</span>
              <span class="mh-stat__value">{{ combined.count }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">基础 / 进阶</span>
              <span class="mh-stat__value">{{ easy.count }} / {{ hard.count }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">平均遗忘速率 k</span>
              <span class="mh-stat__value">{{ combined.avgK.toFixed(1) }}</span>
              <span class="mh-stat__hint">{{ combined.level }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">延时节点</span>
              <span class="mh-stat__value">{{ activeScheme.desc }}</span>
            </div>
          </div>
          <div ref="chartCombinedRef" class="mh-chart"></div>
        </section>

        <section class="mh-card">
          <h2 class="mh-section-title">{{ activeScheme.label }} · 基础模式（6 组词对）</h2>
          <div class="mh-stats">
            <div class="mh-stat">
              <span class="mh-stat__label">测试次数</span>
              <span class="mh-stat__value">{{ easy.count }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">平均遗忘速率 k</span>
              <span class="mh-stat__value">{{ easy.avgK.toFixed(1) }}</span>
              <span class="mh-stat__hint">{{ easy.level }}</span>
            </div>
          </div>
          <div ref="chartEasyRef" class="mh-chart"></div>
          <p v-if="!easy.count" class="hint">该时间档下暂无基础模式记录。</p>
        </section>

        <section class="mh-card">
          <h2 class="mh-section-title">{{ activeScheme.label }} · 进阶模式（8 组词对）</h2>
          <div class="mh-stats">
            <div class="mh-stat">
              <span class="mh-stat__label">测试次数</span>
              <span class="mh-stat__value">{{ hard.count }}</span>
            </div>
            <div class="mh-stat">
              <span class="mh-stat__label">平均遗忘速率 k</span>
              <span class="mh-stat__value">{{ hard.avgK.toFixed(1) }}</span>
              <span class="mh-stat__hint">{{ hard.level }}</span>
            </div>
          </div>
          <div ref="chartHardRef" class="mh-chart"></div>
          <p v-if="!hard.count" class="hint">该时间档下暂无进阶模式记录。</p>
        </section>
      </template>

      <section class="mh-tip">
        曲线由同一时间档内多次测试的<strong>平均保持率</strong>拟合而成，反映整体趋势；单次成绩波动较大时，趋势线比单次数据更值得参考。
      </section>

      <section class="mh-statement">
        <h4>活动声明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '../../utils/echarts'
import PageHead from '../common/PageHead.vue'
import { EVENT } from '../../config/event'
import { MemoryDecayEasyStorage, MemoryDecayHardStorage } from '../../utils/localStorage'
import { curveSeries, gradeForgetting } from '../../utils/analysis'
import {
  FALLBACK_DELAYS,
  MEMORY_TIMING_PRESETS,
  delaysSignature,
  formatDelay,
} from '../../config/memory'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
const chartCombinedRef = ref(null)
let chartEasy = null
let chartHard = null
let chartCombined = null

const activeSchemeKey = ref('')

/** 把所有记录摊平，并标注它来自哪个模式 */
const allRecords = computed(() => [
  ...MemoryDecayEasyStorage.getList().map((r) => ({ ...r, __mode: 'easy' })),
  ...MemoryDecayHardStorage.getList().map((r) => ({ ...r, __mode: 'hard' })),
])

const delaysOf = (record) => (Array.isArray(record.delays) && record.delays.length ? record.delays : FALLBACK_DELAYS)

/** 按「延时节点」分组，得到可选的时间档列表 */
const schemes = computed(() => {
  const map = new Map()
  allRecords.value.forEach((record) => {
    const delays = delaysOf(record)
    const key = delaysSignature(delays)
    if (!map.has(key)) {
      const preset = MEMORY_TIMING_PRESETS.find((p) => delaysSignature(p.delays) === key)
      map.set(key, {
        key,
        delays,
        label: preset ? preset.label : '其他时间设置',
        desc: delays.map(formatDelay).join(' / '),
        count: 0,
      })
    }
    map.get(key).count += 1
  })
  return [...map.values()].sort((a, b) => b.count - a.count)
})

const activeScheme = computed(() => schemes.value.find((s) => s.key === activeSchemeKey.value) || schemes.value[0] || null)

const activeRecords = computed(() =>
  activeScheme.value ? allRecords.value.filter((r) => delaysSignature(delaysOf(r)) === activeScheme.value.key) : []
)

/** 统计某个模式的平均 k 与各延时点的平均保留率 */
function statsOf(list, delays) {
  const count = delays.length
  if (!list.length) return { count: 0, avgK: 60, avgRates: new Array(count).fill(0), level: '暂无数据' }
  let sumK = 0
  let validK = 0
  const sumRates = new Array(count).fill(0)
  list.forEach((record) => {
    if (record.kValue > 0) {
      sumK += record.kValue
      validK += 1
    }
    ;(record.rates || []).forEach((rate, i) => {
      if (i < count && typeof rate === 'number') sumRates[i] += rate
    })
  })
  const avgK = validK ? sumK / validK : 60
  return {
    count: list.length,
    avgK,
    avgRates: sumRates.map((s) => s / list.length),
    level: gradeForgetting(avgK).text,
  }
}

const easy = computed(() => statsOf(activeRecords.value.filter((r) => r.__mode === 'easy'), activeScheme.value?.delays || FALLBACK_DELAYS))
const hard = computed(() => statsOf(activeRecords.value.filter((r) => r.__mode === 'hard'), activeScheme.value?.delays || FALLBACK_DELAYS))
const combined = computed(() => statsOf(activeRecords.value, activeScheme.value?.delays || FALLBACK_DELAYS))

watch(
  schemes,
  (list) => {
    if (!list.some((s) => s.key === activeSchemeKey.value)) activeSchemeKey.value = list.length ? list[0].key : ''
  },
  { immediate: true }
)

function renderChart(chart, stats, color, delays) {
  if (!chart || !stats.count) return
  const tMax = Math.max(...delays, 60)
  const curve = curveSeries(stats.avgK, 100, tMax, tMax > 120 ? 5 : 2)
  const measured = stats.avgRates.map((rate, i) => [delays[i], Math.round(rate * 10) / 10])

  chart.setOption(
    {
      grid: { left: 54, right: 24, top: 52, bottom: 40 },
      legend: { data: ['理论衰减曲线', '平均实测保留率'], top: 6, textStyle: { color: '#6B7C82' } },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const p = params[0]
          if (!p) return ''
          const extra = p.seriesName === '平均实测保留率' ? '<br/>基于 ' + stats.count + ' 次测试' : ''
          return '时间：' + p.data[0] + ' s<br/>' + p.seriesName + '：' + p.data[1] + '%' + extra
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
      yAxis: { type: 'value', name: '记忆保留率 %', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: '理论衰减曲线',
          type: 'line',
          data: curve,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color },
          areaStyle: { color: color + '22' },
        },
        {
          name: '平均实测保留率',
          type: 'line',
          data: measured,
          symbolSize: 11,
          lineStyle: { width: 2, type: 'dashed', color: '#F2A65A' },
          itemStyle: { color: '#F2A65A' },
          label: { show: true, formatter: '{c}%', position: 'top', fontSize: 11, color: '#8a5416' },
        },
      ],
    },
    true
  )
  chart.resize()
}

function initCharts() {
  const delays = activeScheme.value?.delays || FALLBACK_DELAYS

  if (chartEasyRef.value) {
    if (chartEasy) chartEasy.dispose()
    chartEasy = echarts.init(chartEasyRef.value)
    renderChart(chartEasy, easy.value, '#1F8A70', delays)
  }
  if (chartHardRef.value) {
    if (chartHard) chartHard.dispose()
    chartHard = echarts.init(chartHardRef.value)
    renderChart(chartHard, hard.value, '#3E7CB1', delays)
  }
  if (chartCombinedRef.value && combined.value.count) {
    if (chartCombined) chartCombined.dispose()
    chartCombined = echarts.init(chartCombinedRef.value)
    renderChart(chartCombined, combined.value, '#8A7CC4', delays)
  }
}

function handleResize() {
  chartEasy?.resize()
  chartHard?.resize()
  chartCombined?.resize()
}

watch([activeSchemeKey, easy, hard, combined], () => nextTick(initCharts), { deep: true })

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartEasy?.dispose()
  chartHard?.dispose()
  chartCombined?.dispose()
})
</script>

<style scoped>
.schemes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.scheme {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
}

.scheme:hover {
  border-color: var(--mh-primary-light);
  transform: translateY(-1px);
}

.scheme--active {
  border-color: var(--mh-primary);
  background: var(--mh-primary-soft-2);
  box-shadow: 0 0 0 3px rgba(31, 138, 112, 0.12);
}

.scheme__label {
  font-size: 15px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.scheme__desc {
  font-size: 12px;
  color: var(--mh-ink-2);
}

.scheme__count {
  font-size: 11px;
  color: var(--mh-muted);
}

.hint {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--mh-muted);
}
</style>
