<template>
  <!-- src/components/Reaction/charts.vue · 反应速度成绩分布（汇总） -->
  <div class="mh-page">
    <div class="mh-shell">
      <PageHead title="反应速度 · 成绩分布" subtitle="把个人平均成绩放进参考区间里看" back-to="/game" back-label="返回游戏主页" />

      <section class="mh-card">
        <h2 class="mh-section-title">基础模式 · 简单视觉反应时</h2>
        <p class="tip" :style="{ color: easyTip.color }">{{ easyTip.text }}</p>
        <div ref="chartEasyRef" class="mh-chart"></div>
        <p class="hint">共 {{ easyList.length }} 次有效记录，取有效成绩的平均值参与参考区间比较。</p>
      </section>

      <section class="mh-card">
        <h2 class="mh-section-title">进阶模式 · 舒尔特方格（25 格）</h2>
        <p class="tip" :style="{ color: hardTip.color }">{{ hardTip.text }}</p>
        <div ref="chartHardRef" class="mh-chart"></div>
        <p class="hint">共 {{ hardList.length }} 次有效记录。红色柱为你所在区间，其余为参考区间分布。</p>
      </section>

      <section class="mh-tip">
        参考区间的数据仅用于帮助理解成绩位置，属于<strong>科普性参考</strong>，并非权威常模；不同设备、环境与任务版本之间不可直接比较。
      </section>

      <section class="mh-statement">
        <h4>活动声明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import echarts from '../../utils/echarts'
import PageHead from '../common/PageHead.vue'
import { EVENT } from '../../config/event'
import { ReactionTimeEasyStorage, ReactionTimeHardStorage } from '../../utils/localStorage'
import scoreData from '../../assets/json/Rtime.json'

const EASY_KEY = '中国大学生反应时挑战_简单视觉反应时_毫秒'
const HARD_KEY = '中国成年人舒尔特方格25格_完成时间_秒'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
let chart1 = null
let chart2 = null

const easyList = computed(() => ReactionTimeEasyStorage.getList())
const hardList = computed(() => ReactionTimeHardStorage.getList())

/** 取平均成绩：基础模式单位毫秒，进阶模式单位秒 */
const easyAvg = computed(() => {
  const times = easyList.value.map((i) => i.average || 0).filter((t) => t >= 100 && t <= 5000)
  return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
})

const hardAvg = computed(() => {
  const times = hardList.value.map((i) => i.average || 0).filter((t) => t > 0 && t < 60000).map((t) => t / 1000)
  return times.length ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0
})

/** 当前成绩落在哪个参考区间（模板中的提示条） */
const easyTip = computed(() => getLevelInfo(easyAvg.value, EASY_KEY))
const hardTip = computed(() => getLevelInfo(hardAvg.value, HARD_KEY))

function rangeBounds(rangeStr) {
  if (rangeStr.startsWith('>')) {
    const min = Number(rangeStr.replace('>', ''))
    return [min, Infinity]
  }
  const [a, b] = rangeStr.split('~').map(Number)
  return [a, b]
}

function getLevelInfo(avg, key) {
  const list = scoreData[key]
  if (!list || !avg) return { text: '暂无成绩，先完成一次挑战吧', color: '#6B7C82' }
  for (const item of list) {
    const [min, max] = rangeBounds(item.区间)
    if (avg > min && avg <= max) return { text: '你所在的参考区间：' + item.说明, color: '#1F8A70' }
  }
  return { text: '成绩超出参考区间范围', color: '#6B7C82' }
}

function getUserRangeIndex(avg, key) {
  const list = scoreData[key]
  if (!list || !avg) return -1
  return list.findIndex((item) => {
    const [min, max] = rangeBounds(item.区间)
    return avg > min && avg <= max
  })
}

function renderChart(el, avg, key, unit) {
  if (!el) return null
  const chart = echarts.init(el)

  const originalData = scoreData[key]
  const sortedData = [...originalData].sort((a, b) => rangeBounds(b.区间)[0] - rangeBounds(a.区间)[0])
  const xData = sortedData.map((i) => i.区间)
  const percent = sortedData.map((i) => i['人数占比(%)'])

  const originalIndex = getUserRangeIndex(avg, key)
  const userRange = originalIndex === -1 ? null : originalData[originalIndex].区间
  const userIndex = userRange ? sortedData.findIndex((i) => i.区间 === userRange) : -1

  chart.setOption({
    grid: { left: 56, right: 24, top: 56, bottom: 56 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => v + ' %' },
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: 8,
          style: {
            text: avg ? '你的平均值：' + avg + ' ' + unit : '暂无成绩',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#1F2A2E',
          },
        },
      ],
    },
    xAxis: {
      type: 'category',
      data: xData,
      name: '区间(' + unit + ')',
      nameGap: 30,
      axisLabel: { fontSize: 11, color: '#6B7C82' },
      axisLine: { lineStyle: { color: '#dbe6e3' } },
    },
    yAxis: {
      type: 'value',
      name: '人数占比 %',
      nameGap: 18,
      axisLabel: { formatter: '{value}%', color: '#6B7C82' },
      splitLine: { lineStyle: { color: '#eef4f2' } },
    },
    series: [
      {
        type: 'bar',
        data: percent,
        barMaxWidth: 46,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params) => (params.dataIndex === userIndex ? '#F2A65A' : '#7cc0ac'),
        },
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11, color: '#6B7C82' },
      },
    ],
  })
  return chart
}

function handleResize() {
  chart1?.resize()
  chart2?.resize()
}

onMounted(() => {
  chart1 = renderChart(chartEasyRef.value, easyAvg.value, EASY_KEY, 'ms')
  chart2 = renderChart(chartHardRef.value, hardAvg.value, HARD_KEY, 's')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart1?.dispose()
  chart2?.dispose()
})
</script>

<style scoped>
.tip {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--mh-muted);
  text-align: center;
}
</style>
