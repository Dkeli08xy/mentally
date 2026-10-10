<template>
  <!-- src/components/expre/charts.vue · 情绪识别成绩分布（汇总） -->
  <div class="mh-page">
    <div class="mh-shell">
      <PageHead title="情绪识别 · 成绩分布" subtitle="各情绪的平均识别正确率" back-to="/game" back-label="返回游戏主页" />

      <section class="mh-card">
        <h2 class="mh-section-title">基础模式 · 5 类情绪</h2>
        <p class="tip">{{ easyTip }}</p>
        <div ref="chartEasyRef" class="mh-chart"></div>
      </section>

      <section class="mh-card">
        <h2 class="mh-section-title">进阶模式 · 6 类情绪</h2>
        <p class="tip">{{ hardTip }}</p>
        <div ref="chartHardRef" class="mh-chart"></div>
      </section>

      <section class="mh-tip" v-if="weakestEasy || weakestHard">
        从平均成绩看，{{ weakHint }} 相对更难辨认。可以回到「科学原理」页查看眉、眼、嘴三个区域的关键线索。
      </section>

      <section class="mh-tip">
        情绪识别受素材质量、光线角度与文化背景影响，正确率高低并不代表共情能力；<strong>识别之后主动确认对方的感受</strong>，才是更重要的沟通能力。
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
import { EMOTIONS_EASY, EMOTIONS_HARD } from '../../config/emotions'
import { MicroExpressionEasyStorage, MicroExpressionHardStorage } from '../../utils/localStorage'

const chartEasyRef = ref(null)
const chartHardRef = ref(null)
let chart1 = null
let chart2 = null

const easyList = computed(() => MicroExpressionEasyStorage.getList())
const hardList = computed(() => MicroExpressionHardStorage.getList())

function avgAccuracy(list) {
  if (!list.length) return 0
  return Math.round(list.reduce((sum, i) => sum + (i.accuracy || 0), 0) / list.length)
}

/** 各情绪的平均正确率（只统计该项有数据的记录） */
function emotionAverage(list, emotions) {
  const sum = {}
  const count = {}
  emotions.forEach((e) => {
    sum[e] = 0
    count[e] = 0
  })
  list.forEach((record) => {
    const acc = record.emotionAccuracy || {}
    emotions.forEach((e) => {
      if (typeof acc[e] === 'number') {
        sum[e] += acc[e]
        count[e] += 1
      }
    })
  })
  const out = {}
  emotions.forEach((e) => {
    out[e] = count[e] ? Math.round(sum[e] / count[e]) : 0
  })
  return out
}

const easyAvg = computed(() => avgAccuracy(easyList.value))
const hardAvg = computed(() => avgAccuracy(hardList.value))
const easyEmotion = computed(() => emotionAverage(easyList.value, EMOTIONS_EASY))
const hardEmotion = computed(() => emotionAverage(hardList.value, EMOTIONS_HARD))

const easyTip = computed(() => (easyAvg.value ? '平均总正确率：' + easyAvg.value + '%（' + easyList.value.length + ' 次记录）' : '暂无基础模式记录'))
const hardTip = computed(() => (hardAvg.value ? '平均总正确率：' + hardAvg.value + '%（' + hardList.value.length + ' 次记录）' : '暂无进阶模式记录'))

const weakestEasy = computed(() => weakestOf(easyEmotion.value, easyList.value.length))
const weakestHard = computed(() => weakestOf(hardEmotion.value, hardList.value.length))
const weakHint = computed(() => {
  const names = [weakestEasy.value, weakestHard.value].filter(Boolean)
  return names.length ? '「' + names.join('」和「') + '」' : ''
})

function weakestOf(emotionAvg, count) {
  if (!count) return null
  const entries = Object.entries(emotionAvg).filter(([, v]) => v > 0)
  if (!entries.length) return null
  entries.sort((a, b) => a[1] - b[1])
  return entries[0][0]
}

function renderRadar(el, emotionAvg, emotions, hasData) {
  if (!el) return null
  const chart = echarts.init(el)
  chart.setOption({
    tooltip: { trigger: 'item' },
    graphic: hasData
      ? undefined
      : {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: { text: '暂无数据', fill: '#6B7C82', fontSize: 14 },
            },
          ],
        },
    radar: {
      indicator: emotions.map((e) => ({ name: e, max: 100 })),
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
            value: emotions.map((e) => emotionAvg[e] || 0),
            name: '平均识别正确率',
            areaStyle: { color: 'rgba(31,138,112,0.25)' },
            lineStyle: { color: '#1F8A70', width: 2 },
            itemStyle: { color: '#1F8A70' },
          },
        ],
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
  chart1 = renderRadar(chartEasyRef.value, easyEmotion.value, EMOTIONS_EASY, !!easyList.value.length)
  chart2 = renderRadar(chartHardRef.value, hardEmotion.value, EMOTIONS_HARD, !!hardList.value.length)
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
  color: var(--mh-primary-dark);
  margin-bottom: 6px;
}
</style>
