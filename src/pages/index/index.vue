<template>
  <view class="page">
    <fz-statusbar />

    <!-- 顶部品牌栏 -->
    <view class="topbar">
      <view class="brand">
        <view class="brand-mark"></view>
        <text class="brand-name">房助</text>
      </view>
      <view class="bell">
        <fz-icon name="bell" :size="44" color="#0A1628" />
        <view class="bell-dot"></view>
      </view>
    </view>

    <scroll-view class="scroll" scroll-y>
      <view class="body">
        <!-- 问候 -->
        <view class="greet">
          <view class="greet-col">
            <text class="greet-title">{{ agent.greeting }}</text>
            <text class="greet-date">{{ agent.date }}</text>
          </view>
          <view class="greet-badge">
            <text class="greet-badge-txt">待办 {{ agent.todoCount }}</text>
          </view>
        </view>

        <!-- 业绩主卡 -->
        <view class="fz-hero hero">
          <view class="hero-top">
            <text class="hero-label">本月成交佣金</text>
            <view class="hero-badge">
              <text class="hero-badge-txt">{{ agent.commissionDelta }}</text>
            </view>
          </view>
          <view class="hero-value-row">
            <text class="hero-value">{{ agent.monthCommission }}</text>
            <text class="hero-unit">万元</text>
          </view>
          <view class="hero-divider"></view>
          <view class="hero-foot">
            <text class="hero-foot-label">月度目标完成度</text>
            <text class="hero-foot-value">{{ agent.targetPercent }}%</text>
          </view>
          <view class="hero-track">
            <view class="hero-fill" :style="{ width: agent.targetPercent + '%' }"></view>
          </view>
          <text class="hero-note">{{ agent.targetNote }}</text>
        </view>

        <!-- 功能入口 -->
        <text class="sec-title">AI 智能工作台</text>
        <view class="entries">
          <view
            v-for="e in entries"
            :key="e.key"
            class="entry fz-shadow"
            @click="go(e.url)"
          >
            <view class="entry-icon" :style="{ backgroundColor: e.soft }">
              <fz-icon :name="iconOf(e.key)" :size="46" :color="e.color" />
            </view>
            <text class="entry-label">{{ e.label }}</text>
          </view>
        </view>

        <!-- 今日待办 -->
        <view class="todo-head">
          <text class="sec-title">今日待办</text>
          <text class="todo-more">全部 {{ agent.todoCount }} 项 ›</text>
        </view>
        <view class="fz-card todo-card">
          <view
            v-for="(t, i) in todos"
            :key="t.id"
            class="todo-item"
          >
            <view class="todo-icon" :style="{ backgroundColor: softOf(t.type) }">
              <fz-icon :name="t.type === 'viewing' ? 'pin' : 'doc'" :size="40" :color="colorOf(t.type)" />
            </view>
            <view class="todo-info">
              <text class="todo-title">{{ t.title }}</text>
              <text class="todo-sub">{{ t.sub }}</text>
            </view>
            <text class="todo-badge" :style="{ color: t.badgeColor }">{{ t.badge }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { currentAgent, entries, todos } from '../../utils/mock.js'
import { getHomeData } from '../../utils/api.js'
import { requireLogin } from '../../utils/store.js'

export default {
  data() {
    return {
      agent: currentAgent,
      entries,
      todos,
      loading: false
    }
  },
  onLoad() {
    if (!requireLogin()) return
    this.fetchData()
  },
  onShow() {
    // 从二级页返回时刷新待办数量
    if (this.$_loaded) this.fetchData(true)
  },
  methods: {
    async fetchData(silent = false) {
      if (!silent) this.loading = true
      try {
        const res = await getHomeData()
        this.agent = res.agent
        this.entries = res.entries
        this.todos = res.todos
        this.$_loaded = true
      } catch (e) {
        // 错误提示已在 request 层统一处理，此处保留缓存数据兜底
      } finally {
        this.loading = false
      }
    },
    go(url) {
      // tabBar 页面需用 switchTab
      const tabPages = [
        '/pages/index/index',
        '/pages/profile/profile',
        '/pages/decision/decision',
        '/pages/viewing/viewing'
      ]
      if (tabPages.includes(url)) {
        uni.switchTab({ url })
      } else {
        uni.navigateTo({ url })
      }
    },
    iconOf(key) {
      return {
        copywriter: 'doc',
        decision: 'spark',
        viewing: 'pin',
        profile: 'user'
      }[key]
    },
    softOf(type) {
      return type === 'viewing' ? '#FFF1E2' : '#E8F0FD'
    },
    colorOf(type) {
      return type === 'viewing' ? '#C2691A' : '#014DB2'
    }
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F9F9F9;
}

/* 顶部栏 */
.topbar {
  height: 104rpx;
  padding: 0 32rpx 0 40rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.brand-mark {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background-color: #014DB2;
}
.brand-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #0A1628;
}
.bell {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.bell-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 7rpx;
  background-color: #EF4444;
  border: 2rpx solid #F9F9F9;
}

/* 滚动区 */
.scroll {
  flex: 1;
  overflow: hidden;
}
.body {
  padding: 16rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 问候 */
.greet {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.greet-col {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.greet-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #0A1628;
  line-height: 60rpx;
}
.greet-date {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 36rpx;
}
.greet-badge {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  background-color: #FFF4E2;
  display: flex;
  align-items: center;
}
.greet-badge-txt {
  font-size: 24rpx;
  color: #B45309;
  font-weight: 500;
}

/* 业绩主卡 */
.hero {
  padding: 36rpx 44rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.hero-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.hero-label {
  font-size: 26rpx;
  color: #A9C2E8;
}
.hero-badge {
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 24rpx;
  background-color: #10B981;
  display: flex;
  align-items: center;
}
.hero-badge-txt {
  font-size: 24rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.hero-value-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12rpx;
}
.hero-value {
  font-size: 84rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 100rpx;
}
.hero-unit {
  font-size: 30rpx;
  color: #A9C2E8;
  font-weight: 500;
}
.hero-divider {
  height: 1rpx;
  background-color: rgba(255, 255, 255, 0.18);
  width: 100%;
}
.hero-foot {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.hero-foot-label {
  font-size: 26rpx;
  color: #A9C2E8;
}
.hero-foot-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.hero-track {
  height: 12rpx;
  border-radius: 6rpx;
  background-color: rgba(255, 255, 255, 0.22);
  overflow: hidden;
  display: flex;
  flex-direction: row;
}
.hero-fill {
  height: 12rpx;
  border-radius: 6rpx;
  background-color: #34D399;
}
.hero-note {
  font-size: 24rpx;
  color: #8FAEDC;
}

/* 小节标题 */
.sec-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #0A1628;
}

/* 功能入口 */
.entries {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}
.entry {
  flex: 1;
  border-radius: 20rpx;
  padding: 26rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}
.entry-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.entry-label {
  font-size: 22rpx;
  color: #0A1628;
  font-weight: 500;
}

/* 待办 */
.todo-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.todo-more {
  font-size: 26rpx;
  color: #014DB2;
  font-weight: 500;
}
.todo-card {
  padding: 12rpx 32rpx;
  display: flex;
  flex-direction: column;
}
.todo-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
  padding: 26rpx 0;
}
.todo-item + .todo-item {
  border-top: 1rpx solid #EAEAEA;
}
.todo-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.todo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: hidden;
}
.todo-title {
  font-size: 28rpx;
  color: #0A1628;
  font-weight: 500;
}
.todo-sub {
  font-size: 24rpx;
  color: #6B7280;
}
.todo-badge {
  font-size: 24rpx;
  font-weight: 500;
  flex-shrink: 0;
}
</style>