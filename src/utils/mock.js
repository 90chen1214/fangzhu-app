/** 模拟数据层 —— 后续替换为真实 API 即可，页面结构不变 */
import { T } from './theme.js'

export const currentAgent = {
  name: '陈经理',
  greeting: '早上好，陈经理',
  date: '10月8日 星期四 · 杭州',
  todoCount: 8,
  monthCommission: 18.6,
  commissionDelta: '18.4%',
  targetPercent: 78,
  targetNote: '距月度目标还差 5.4 万，本月已成交 12 套'
}

export const entries = [
  { key: 'copywriter', label: '文案工厂', color: '#014DB2', soft: '#E8F0FD', url: '/pages/copywriter/copywriter' },
  { key: 'decision', label: '推荐决策', color: '#0B8A5E', soft: '#E6F7F1', url: '/pages/decision/decision' },
  { key: 'viewing', label: '带看跟客', color: '#C2691A', soft: '#FFF1E2', url: '/pages/viewing/viewing' },
  { key: 'profile', label: '客户画像', color: '#6D42C9', soft: '#F2ECFD', url: '/pages/profile/profile' }
]

export const todos = [
  {
    id: 1,
    type: 'viewing',
    title: '15:00带看 · 王先生（绿地·中央广场）',
    sub: '已确认 · 客户关注学区与车位',
    badge: '1小时后',
    badgeColor: '#C2691A'
  },
  {
    id: 2,
    type: 'review',
    title: 'AI 文案待审核 · 滨江·江南里 3 房',
    sub: '生成于 09:12 · 抖音+闲鱼双版本',
    badge: '待确认',
    badgeColor: '#B45309'
  }
]

export const client = {
  name: '王先生',
  avatar: '王',
  type: '二次改善',
  budget: '500-600万',
  tags: ['三房+学区', '地铁 800m 内'],
  commissionRate: '2.3%',
  intentCount: 3,
  followMonths: 3,
  visitTimes: 5,
  intentLevel: '高',
  avatarUpdated: '画像已根据最近 3 次带看记录自动更新'
}

export const aiConclusion = {
  basedOn: '基于 12 项条件 · 28 套房源',
  text:
    '建议主推 A 案二手精装房，同步向客户推荐 B 案新房作为置换备选。A 案总价与户型完全匹配学区需求，可即时安排带看；B 案在居住品质与物业上更优，建议作为 2-3 个月后的置换选项。',
  reasons: ['总价匹配 96%', '学区命中', '通勤 22 分钟', '随时可看']
}

export const plans = [
  {
    id: 'A',
    badge: 'AI 首推方案',
    isNew: false,
    score: 96,
    scoreColor: '#10B981',
    type: '二手 · 精装三房',
    typeColor: '#014DB2',
    typeSoft: '#E8F0FD',
    title: '滨江·江南里 2 号楼 1203 室',
    price: '558',
    priceUnit: '万',
    perUnit: '单价 4.65 万/平 · 120 平',
    metas: [
      { text: '学区实验二小', color: '#0A1628' },
      { text: '地铁 620m', color: '#0A1628' },
      { text: '随时可看', color: '#10B981' }
    ],
    reason:
      '房源数据来自官方挂牌库，总价与客户预算上限仅差 42 万，学区对口实验二小，业主诚售可立即带看。',
    detailBtn: '查看房源详情'
  },
  {
    id: 'B',
    badge: '置换备选方案',
    isNew: false,
    score: 78,
    scoreColor: '#014DB2',
    type: '新房 · 毛坯四房',
    typeColor: '#0B8A5E',
    typeSoft: '#E6F7F1',
    title: '滨江·星澜湾 7 幢 1802 室',
    price: '690',
    priceUnit: '万',
    perUnit: '单价 3.45 万/平 · 200 平',
    metas: [
      { text: '学区规划二小', color: '#0A1628' },
      { text: '地铁 900m', color: '#0A1628' },
      { text: '预计 2027 交付', color: '#B45309' }
    ],
    reason:
      '新房为开发商官方备案价，户型更大、物业更优，预计 2027 年交付，适合作为 2-3 个月后的置换选项。',
    detailBtn: '查看楼盘详情'
  }
]

export const complianceNote =
  'AI 推荐结果基于官方挂牌数据与客户需求自动匹配，最终房源信息以官方公示为准，需经纪人确认后对客。'

export const currentProperty = {
  title: '滨江·江南里 2 号楼 1203 室 · 120 平精装三房',
  meta: '558 万 · 4.65 万/平 · 学区实验二小'
}

export const platforms = [
  { key: 'douyin', name: '抖音口播', active: true },
  { key: 'xianyu', name: '闲鱼详情', active: false },
  { key: 'moments', name: '朋友圈短文', active: false },
  { key: 'group', name: '业主群发', active: false }
]

export const copyStyles = [
  { key: 'pro', name: '专业理性', active: true },
  { key: 'story', name: '故事化', active: false },
  { key: 'urgent', name: '制造紧迫', active: false },
  { key: 'lux', name: '高端质感', active: false }
]

export const sellingPoints = ['对口实验二小', '地铁 620m', '南北通透', '满五唯一']

export const copyText =
  '很多人问滨江·江南里这套 120 平的三房，到底值不值 558 万。今天带客户实地看了一圈，我把三个最实在的点说清楚。\n\n第一，学区。对口实验二小，这是很多家庭最先看重的指标。\n第二，通勤。地铁 2 号线站点 620 米，步行 8 分钟，早高峰不用堵。\n第三，户型。南北通透，120 平做三房不浪费，业主满五唯一，后续交易税费更省心。\n\n房子 2019 年精装交付，保养得很好。看房需要提前一天预约，随时可以联系我安排。'

export const copyCheckTip =
  '价格与面积已按官方挂牌数据填入，发布前请再核对一次'

export const auditTip = 'AI 内容须经人工确认后发布，不会自动对外推送'

export const stops = [
  {
    id: 1,
    time: '15:00',
    title: '王先生 · 滨江·江南里 2 号楼',
    sub: '学区看房 · 全程约 60 分钟',
    status: '待开始',
    statusColor: '#0B8A5E',
    statusBg: '#E6F7F1',
    dot: '#10B981'
  },
  {
    id: 2,
    time: '16:30',
    title: '李女士 · 城东·悦澜府',
    sub: '二次置换 · 顺路看新房样板间',
    status: '已确认',
    statusColor: '#6B7280',
    statusBg: '#F1F5FB',
    dot: '#D6D9DE'
  }
]

export const visitNote = {
  aiTag: 'AI 自动整理自 3 条语音记录',
  updateTime: '09:24 更新',
  text:
    '王先生对学区非常认可，但担心 120 平三房未来转手流通性。已同步新房方案作为置换备选，客户表示下月再看。\n\n关注点：对口学校（已核实）、车位价格、月供压力。',
  tags: ['学区已核实', '关注流通性', '月供压力']
}

export const preferences = [
  { name: '学区', value: 92, width: '92%', color: '#014DB2' },
  { name: '总价区间', value: 85, width: '85%', color: '#014DB2' },
  { name: '交通通勤', value: 74, width: '74%', color: '#10B981' },
  { name: '户型结构', value: 68, width: '68%', color: '#10B981' },
  { name: '小区环境', value: 41, width: '41%', color: '#D6D9DE' }
]

export const timeline = [
  { day: '08', month: '10月', title: '带看 · 滨江·江南里 1203', sub: '认可学区，担心流通性' },
  { day: '05', month: '10月', title: '推送 4 套推荐房源', sub: '客户回复重点关注停车位' },
  { day: '28', month: '09月', title: '首次需求沟通', sub: '预算 500-600 万，看重学区与地铁' }
]