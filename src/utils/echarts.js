// src/utils/echarts.js
// ============================================================================
// ECharts 按需引入
// ----------------------------------------------------------------------------
// 原来各页面直接 `import * as echarts from 'echarts'`，会把全部图表类型与组件
// 打进包里（首屏 JS 超过 2 MB）。这里只注册本项目用到的图表与组件，
// 页面改为 `import echarts from '@/utils/echarts'` 即可，用法完全一致。
// ============================================================================

import * as echarts from 'echarts/core'
import { BarChart, LineChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  MarkLineComponent,
  TitleComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  MarkLineComponent,
  TitleComponent,
  CanvasRenderer,
])

export default echarts
export { echarts }
