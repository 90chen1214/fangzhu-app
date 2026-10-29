<template>
  <view class="page">
    <fz-statusbar />
    <fz-navbar title="我的" />

    <scroll-view class="scroll" scroll-y>
      <view class="body">
        <!-- 用户卡 -->
        <view class="fz-hero user">
          <view class="user-top">
            <view class="avatar">
              <text class="avatar-txt">{{ avatarText }}</text>
            </view>
            <view class="user-info">
              <text class="user-name">{{ store.userInfo ? store.userInfo.name : '未登录' }}</text>
              <text class="user-meta">{{ store.userInfo ? store.userInfo.agency : '登录后同步房源与客户数据' }}</text>
            </view>
          </view>
          <view class="user-stats">
            <view class="stat">
              <text class="stat-v">{{ store.userInfo ? '3' : '—' }}</text>
              <text class="stat-l">跟进客户</text>
            </view>
            <view class="stat">
              <text class="stat-v">{{ store.userInfo ? '12' : '—' }}</text>
              <text class="stat-l">本月成交</text>
            </view>
            <view class="stat">
              <text class="stat-v">{{ rateText }}</text>
              <text class="stat-l">佣金率</text>
            </view>
          </view>
        </view>

        <!-- 业务菜单 -->
        <view class="grp">
          <view
            v-for="m in menus"
            :key="m.name"
            class="cell"
            @click="onCell(m)"
          >
            <view class="cell-icon" :style="{ backgroundColor: m.soft }">
              <fz-icon :name="m.icon" :size="34" :color="m.color" />
            </view>
            <view class="cell-info">
              <text class="cell-title">{{ m.name }}</text>
              <text v-if="m.desc" class="cell-desc">{{ m.desc }}</text>
            </view>
            <fz-icon name="arrow" :size="28" color="#C2C7CE" />
          </view>
        </view>

        <!-- 登录 / 退出 -->
        <view class="fz-btn-primary logout" @click="toggleLogin">
          <text class="logout-txt">{{ store.token ? '退出登录' : '登录 / 切换账号' }}</text>
        </view>

        <view class="about">
          <text class="about-txt">房助 v1.0.0</text>
          <text class="about-txt about-sub">AI 生成的推荐与文案须经人工确认后对客</text>
        </view>
      </view>
    </scroll-view>

    <view class="tabbar">
      <view
        v-for="t in tabs"
        :key="t.path"
        class="tab"
        :class="{ on: t.active }"
        @click="goTab(t)"
      >
        <view class="tab-icon" :class="{ 'tab-icon-on': t.active }"></view>
        <text class="tab-txt">{{ t.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { store, isLogin, clearLogin } from '../../utils/store.js'
import { logout } from '../../utils/api.js'

export default {
  data () {
    return {
      store,
      tabs: [
        { label: '工作台', path: '/pages/index/index', active: false },
        { label: '客户', path: '/pages/profile/profile', active: false },
        { label: '推荐', path: '/pages/decision/decision', active: false },
        { label: '带看', path: '/pages/viewing/viewing', active: false }
      ],
      menus: [
        { name: '房源库同步', desc: '对接官方挂牌数据源', icon: 'layers', color: '#014DB2', soft: '#E8F0FD' },
        { name: '我的客户', desc: '画像与跟进记录', icon: 'user', color: '#0B8A5E', soft: '#E6F7F1' },
        { name: '文案记录', desc: '历史生成与发布状态', icon: 'doc', color: '#6D42C9', soft: '#F2ECFD' },
        { name: '数据统计', desc: '业绩与转化漏斗', icon: 'chart', color: '#C2691A', soft: '#FFF1E2' },
        { name: '隐私与合规', desc: 'AI 使用说明与数据授权', icon: 'shield', color: '#014DB2', soft: '#E8F0FD' }
      ]
    }
  },
  computed: {
    avatarText () {
      const n = store.userInfo && store.userInfo.name
      return n ? n.charAt(0) : '?'
    },
    rateText () {
      const r = store.userInfo && store.userInfo.commissionRate
      return r ? (r * 100).toFixed(1) + '%' : '—'
    }
  },
  onShow () {
    // 自定义 tabBar 需手动同步当前页高亮
    this.tabs.forEach(t => (t.active = false))
    this.tabs[0].active = false
  },
  methods: {
    goTab (t) {
      uni.switchTab({ url: t.path })
    },
    onCell (m) {
      uni.showToast({ title: m.name + '（待接入）', icon: 'none' })
    },
    toggleLogin () {
      if (isLogin()) {
        uni.showModal({
          title: '退出登录',
          content: '退出后本地缓存的客户数据将被清除，未同步的跟客记录会丢失。',
          confirmText: '退出',
          cancelText: '取消',
          success: async (res) => {
            if (!res.confirm) return
            try { await logout() } catch (e) { /* 静默失败也要能退出 */ }
            clearLogin()
            uni.showToast({ title: '已退出登录', icon: 'none' })
          }
        })
      } else {
        uni.navigateTo({ url: '/pages/login/login' })
      }
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
.scroll {
  flex: 1;
  overflow: hidden;
}
.body {
  padding: 28rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.user {
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}
.user-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 26rpx;
}
.avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  background-color: #2A55A0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.user-info {
  flex: 1;
  overflow: hidden;
}
.user-name {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 52rpx;
}
.user-meta {
  display: block;
  font-size: 24rpx;
  color: #A9C2E8;
  line-height: 34rpx;
}
.user-stats {
  display: flex;
  flex-direction: row;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.stat-v {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 44rpx;
}
.stat-l {
  font-size: 22rpx;
  color: #8FAEDC;
}

.grp {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  border: 1rpx solid #EAEAEA;
  overflow: hidden;
}
.cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 22rpx;
  padding: 28rpx 28rpx;
}
.cell + .cell {
  border-top: 1rpx solid #EAEAEA;
}
.cell-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cell-info {
  flex: 1;
  overflow: hidden;
}
.cell-title {
  display: block;
  font-size: 30rpx;
  color: #0A1628;
  font-weight: 500;
}
.cell-desc {
  display: block;
  font-size: 22rpx;
  color: #9AA3AF;
  margin-top: 4rpx;
}

.logout {
  height: 92rpx;
}
.logout-txt {
  font-size: 30rpx;
  font-weight: 500;
  color: #EF4444;
}

.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 0;
}
.about-txt {
  font-size: 22rpx;
  color: #9AA3AF;
}
.about-sub {
  text-align: center;
  line-height: 32rpx;
}

.tabbar {
  height: 112rpx;
  padding: 8rpx 16rpx calc(16rpx + env(safe-area-inset-bottom));
  background-color: #FFFFFF;
  border-top: 1rpx solid #EAEAEA;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}
.tab-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 12rpx;
  background-color: #D7DBE0;
}
.tab-icon-on {
  background-color: #014DB2;
}
.tab-txt {
  font-size: 20rpx;
  color: #9AA3AF;
  font-weight: 500;
}
.tab.on .tab-txt {
  color: #014DB2;
}
</style>