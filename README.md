# 10·10 世界精神卫生日 · 心灵绿洲（纯前端心理科普活动）

校园世界精神卫生日活动的线上部分：**玩法不变**的三个心理小挑战（反应速度 / 记忆保持 / 情绪识别），
整站为纯前端应用，可离线部署，所有成绩只保存在访问者自己的浏览器里。

- 年度主题：**「悦纳情绪，心有阳光」**（2026 年，国家心理健康和精神卫生防治中心发布）
- 活动日期：2026 年 10 月 10 日（第 35 个世界精神卫生日）
- 全部活动信息集中在 `src/config/event.js`，改一处即可全站生效

---

## 一、运行与构建

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（默认 http://localhost:5173）
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

技术栈：Vue 3 + Vite + Vue Router + Element Plus（按需注册）+ ECharts（按需引入）。

## 二、页面与路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` → `/load` | 封面 | 活动主视觉 + 年度主题，点击任意位置进入 |
| `/home` | 首页 | 节日信息、三个入口、校内免费心理咨询重点标注、12356 热线 |
| `/men` | 活动介绍 | 年度主题、广义/狭义精神卫生、同期活动、常见误区、费用与政策、**心理健康中心预约（二维码 + 下载）** |
| `/game` | 挑战选择 | 三个挑战的模式入口、科学原理、成绩分布 |
| `/R_S` `/R_H` | 反应速度 | 绿点反应 / 5×5 舒尔特方格 |
| `/M_S` `/M_H` | 记忆保持 | 6 组词对·10 秒 / 8 组词对·15 秒，**可选三档整体时间** |
| `/E_S` `/E_H` | 情绪识别 | 5 类情绪 36 题 / 6 类情绪 48 题 |
| `/user` | 我的记录 | 六类成绩列表、摘要、查看详情、清空 |
| `/RSC` `/MSC` `/EEC` | 单次记录详情 | 折线图 / 衰减曲线 / 雷达图 |
| `/RC` `/MC` `/EC` | 成绩分布 | 个人成绩与参考区间；记忆按时间档分开统计 |
| `/RM` `/MM` `/EM` | 科学原理 | 反应时、遗忘曲线、情绪识别的科普长文 |

未知路径会重定向回封面，不会白屏；弱网下路由资源加载失败会自动重试一次。

## 三、二次开发：常用修改位置

| 想改什么 | 改哪里 |
| --- | --- |
| 年份 / 年度主题 / 口号 / 主办方 / 求助热线 | `src/config/event.js` |
| **心理健康中心预约二维码** | 图片放入 `public/`（如 `public/qr/appointment.png`），再把 `src/config/event.js` 的 `counseling.qrImage` 设为 `'/qr/appointment.png'`；留空时页面显示占位框 |
| 心理中心工作时间 / 地址 / 电话 | `src/config/event.js` 的 `counseling.hours / location / phone` |
| 同期校园活动 | `src/config/event.js` 的 `activities` |
| 常见误区、医保政策文案 | `src/view/mentally.vue` 中的 `myths` 与「费用与政策」段落 |
| 三个挑战的名称与模式说明 | `src/config/event.js` 的 `GAMES` |
| 记忆挑战的时间档（快速/标准/深度） | `src/config/memory.js` |
| 记忆词对 | `src/assets/json/memory_simple.json`、`memory_hard.json`（`pairs` 为语义关联词对，优先使用） |
| 情绪素材 | `public/mood/` + `src/assets/json/expre.json` |
| 反应时参考区间 | `src/assets/json/Rtime.json` |
| 主题色 | `src/style.css` 顶部 CSS 变量（并同步 `config/event.js` 的 `colors`） |

## 四、成绩算法（`src/utils/analysis.js`）

| 挑战 | 指标 | 算法 |
| --- | --- | --- |
| 反应速度（基础） | 平均 / 最快 / 最慢 / 标准差 / 变异系数 CV | 仅统计有效轮次；<100 ms 记为抢按不计入；超过作答窗口记「未反应」并继续下一轮 |
| 反应速度（进阶） | 平均用时 / 最快 / 最慢 / 点错次数 / CV | 点错只计数不推进进度 |
| 记忆保持 | 遗忘速率 k / 半衰期 t½ / 拟合优度 R² | 对 `ln(R/R₀) = -t/k` 做无截距最小二乘拟合；不同时间档分别统计 |
| 情绪识别 | 各情绪正确率 / 平均每题用时 / 混淆对 Top3 | 统计「把 A 认成 B」的频次，给出最易混淆组合与面部线索提示 |

所有指标只做科普解读，**不做任何诊断、评级或病理判断**。

## 五、数据存储（localStorage）

| 记录类型 | 存储键 |
| --- | --- |
| reactionEasy / reactionHard | `wmhd2026:reaction:easy` / `wmhd2026:reaction:hard` |
| memoryEasy / memoryHard | `wmhd2026:memory:easy` / `wmhd2026:memory:hard` |
| microEasy / microHard | `wmhd2026:expression:easy` / `wmhd2026:expression:hard` |

- 键前缀来自 `config/event.js` 的 `storagePrefix`，换活动改前缀即与旧数据隔离。
- 记忆记录额外保存 `delays` 与 `presetKey`，成绩页与图表页据此分开统计。
- 记录类型字符串同时用作路由 query 的 `type`，**不要随意改名**。

## 六、部署

### 1. GitHub Pages（当前线上地址）

线上站点：**https://dkeli08xy.github.io/mentally/**

```bash
npm run deploy     # = build:pages + gh-pages -d dist，推送到 gh-pages 分支
```

- `vite.config.js` 的 `base` 必须是 `'/mentally/'`（项目站点子路径），
  `src/router/index.js` 使用 `createWebHistory(import.meta.env.BASE_URL)`，
  两者一致才能保证刷新时不跳出 `/mentally/` 目录。
- `scripts/make-404.mjs` 会把 `dist/index.html` 复制成 `dist/404.html` 并写入 `.nojekyll`：
  GitHub Pages 不支持 SPA 回退，靠 404.html 才能让 `/mentally/men`、`/mentally/game` 这类
  深层地址**直接访问与刷新**都正常。
- 换仓库名或换域名时：改 `vite.config.js` 的 `base`（或临时 `npm run build -- --base=/`）。

### 2. 其他静态托管（Nginx / Apache / 对象存储）

- 部署在**域名根目录**：把 `base` 改为 `'/'`，并让服务器把未知路径回退到 `index.html`。
- 部署在**子目录**：`base` 设为该子目录（如 `'/activity/'`），服务器同样配置回退到该目录下的 `index.html`。
- 需要**直接用 `file://` 打开**或完全无法配置服务器回退时：
  把 `src/router/index.js` 的 `createWebHistory` 换成 `createWebHashHistory`，
  `base` 改为 `'./'`，重新构建即可（URL 会带 `#`）。

## 七、相对 5·25 版本的改动摘要

**内容与宣传**
- 全站改写为 10·10 世界精神卫生日语境，采用官方主题「悦纳情绪，心有阳光」，并标注发布机构。
- 活动介绍页重写：广义 / 狭义精神卫生、同期校园活动、**6 条常见误区**、**心理咨询费用与医保政策**、
  校内心理健康中心**免费咨询重点标注**，以及**预约二维码容器 + 下载按钮**（路径可配置）。
- 首页新增「校内免费心理咨询」重点卡片（免费 · 保密 · 工作时间）。
- 三个「科学原理」页补充世界精神卫生日科普，并修正了原稿中「微表情可用于测谎」的不严谨表述。

**算法与交互**
- 修复进阶记忆挑战成绩不显示、不保存的缺陷（事件名不一致），事件名统一收敛到 `src/utils/events.js`。
- 记忆挑战新增**整体时间单选框**（快速 0/10/30/60 秒、标准 0/20/60/120 秒、深度 0/30/90/180 秒），
  成绩与图表按时间档分开统计；词对改为语义关联的 `pairs`，基础模式全中文、进阶模式混合英文与数字。
- 基础反应时：超时不再结束整局；抢按单独计数；新增标准差与变异系数。
- 舒尔特方格：新增点错计数与即时反馈。
- 情绪识别：作答即时反馈 + 面部线索、数字键 1-6 作答、←/→ 切题、自动跳过未答题；
  素材框改为固定正方形 + `object-fit: contain`，**不同分辨率的图片/视频都完整居中显示，不再被裁切或错位**。
- 六个成绩页统一为「指标卡 + 图表 + 解读结论 + 再测一次」。

**UI 与工程**
- 主色为绿丝带青绿（#1F8A70 / #2FA37C）+ 暖橙点缀，覆盖 Element Plus 主题变量，新增内联绿丝带 SVG。
- 修复首页三张入口卡片错位（原 `.mh-card + .mh-card` 会作用到网格兄弟节点），改为只作用于页面主容器。
- ECharts 按需引入 + Element Plus 按需注册：首屏 JS 由约 2.16 MB 降到约 350 KB（gzip 714 KB → 125 KB）。
- 关闭 CSS 代码分割，避免弱网下路由级 CSS 预加载失败导致白屏；路由失败自动重试一次。
- 修正 9 个「PNG 内容却命名为 .webp」的封面与背景图（体积从 3.3 MB 降到 325 KB 等），
  另有 3 张 public 情绪图同样问题，一并修正。

## 八、待补充的信息

1. 心理中心**预约二维码图片路径**（`counseling.qrImage`）、地址与电话（`counseling.location / phone`）。
2. 京东校园解压运动会的**具体时间、地点与参与方式**（`activities[1].note`）。
3. 若需要，可在 `src/config/event.js` 的 `statement` 中补上学校心理中心的正式声明口径。

## 九、仓库体积与已知可继续优化的点

- `src/assets/mood/**` 与 `public/mood/**` 内容重复（约 58 MB）且未被任何代码引用，
  已从 git 移除并写入 `.gitignore`（**本地文件仍在，删除与否都不影响运行**）。
- 旧版首页/背景图 10 张（约 25 MB，含 18.7 MB 的 `BJ1.jpg`）已在本次提交中从仓库删除，
  需要时可从 git 历史中恢复：`git checkout <旧提交> -- <路径>`。
- 经上述清理，仓库体积由约 145 MB 降到约 60 MB。
- `src/assets/json/expre_simple.json` 已无引用，可删除。
- Element Plus 仍整包引入 CSS（约 360 KB，gzip 49 KB），如需进一步瘦身可改用 `unplugin-vue-components`。
- 情绪素材如需「视觉上完全统一」，可用脚本把图片统一为正方形画布（当前用 CSS contain 已解决裁切与错位）。
