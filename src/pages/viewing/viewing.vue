<template>
  <view class="page">
    <fz-statusbar />

    <!-- 地图区（占位，接入高德/百度 SDK 后替换为 map 组件） -->
    <view class="map">
      <view class="map-grid">
        <view v-for="i in 40" :key="i" class="map-cell"></view>
      </view>
      <view class="road road-h1"></view>
      <view class="road road-h2"></view>
      <view class="road road-v1"></view>
      <view class="block block-1"></view>
      <view class="block block-2"></view>
      <view class="block block-3"></view>

      <!-- 起点 -->
      <view class="pin-start"></view>
      <!-- 规划路线 -->
      <view class="route"></view>
      <!-- 终点 -->
      <view class="pin-end">
        <view class="pin-end-inner"></view>
      </view>

      <!-- 行程标 -->
      <view class="map-tag">
        <fz-icon name="pin" :size="28" color="#014DB2" />
        <text class="map-tag-txt">今日行程 2 站 · 8.4km</text>
      </view>

      <!-- 定位按钮 -->
      <view class="map-locate">
        <fz-icon name="locate" :size="36" color="#014DB2" />
      </view>
    </view>

    <scroll-view class="scroll" scroll-y>
      <view class="body">
        <!-- 行程卡 -->
        <view class="fz-card stops">
          <view v-for="(s, i) in stops" :key="s.id" class="stop-wrap">
            <view v-if="i > 0" class="fz-divider"></view>
            <view class="stop">
              <view class="stop-dot" :style="{ backgroundColor: s.dot }"></view>
              <text class="stop-time">{{ s.time }}</text>
              <view class="stop-info">
                <text class="stop-title">{{ s.title }}</text>
                <text class="stop-sub">{{ s.sub }}</text>
              </view>
              <view class="stop-status" :style="{ backgroundColor: s.statusBg }">
                <text class="stop-status-txt" :style="{ color: s.statusColor }">{{ s.status }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 跟客记录 -->
        <view class="note-head">
          <text class="sec-title">跟客记录</text>
          <text class="note-time">{{ note.updateTime }}</text>
        </view>

        <view class="fz-card note">
          <view class="note-ai">
            <fz-icon name="spark" :size="30" color="#10B981" />
            <text class="note-ai-txt">{{ note.aiTag }}</text>
          </view>
          <text class="note-text">{{ note.text }}</text>
          <view class="wrap">
            <view v-for="t in note.tags" :key="t" class="note-tag">
              <text class="note-tag-txt">{{ t }}</text>
            </view>
          </view>
        </view>

        <!-- 操作 -->
        <view class="br">
          <view class="fz-btn-ghost btn" :class="{ 'btn-rec': recording }" @click="voice">
            <fz-icon name="mic" :size="34" :color="recording ? '#EF4444' : '#0A1628'" />
            <text class="btn-txt-ghost" :class="{ 'btn-txt-rec': recording }">{{ recording ? '结束录音' : '继续语音记一笔' }}</text>
          </view>
          <view class="fz-btn-primary btn" @click="startVisitNow">
            <text class="btn-txt-primary">开始本次带看</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { stops, visitNote } from '../../utils/mock.js'
import { getTodaySchedule, saveVisitNote, startVisit } from '../../utils/api.js'
import { requireLogin } from '../../utils/store.js'

export default {
  data() {
    return {
      stops,
      note: visitNote,
      recording: false,
      startAt: 0
    }
  },
  onLoad() {
    if (!requireLogin()) return
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const res = await getTodaySchedule()
        this.stops = res.stops
        this.note = res.note
      } catch (e) {
        // 兜底保留初始数据
      }
    },
    voice() {
      this.recording = !this.recording
      if (this.recording) {
        uni.showToast({ title: '录音中，再次点击结束', icon: 'none' })
      } else {
        this.submitNote()
      }
    },
    async submitNote() {
      // 真实场景：录音 → 转写 → 大模型整理为结构化纪要
      const text = '语音纪要：客户认可学区，但担心120平三房流通性，已同步新房方案。'
      try {
        const res = await saveVisitNote('C001', text)
        this.note = {
          aiTag: 'AI 自动整理自本次语音记录',
          updateTime: '刚刚更新',
          text: res.summary || text,
          tags: res.tags || []
        }
        uni.showToast({ title: '已整理为跟客记录', icon: 'success' })
      } catch (e) { /* 已统一提示 */ }
    },
    async startVisitNow() {
      try {
        await startVisit(this.stops[0].id)
        this.startAt = Date.now()
        uni.showToast({ title: '带看已开始', icon: 'success' })
      } catch (e) { /* 已统一提示 */ }
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

/* 地图占位 */
.map {
  width: 100%;
  height: 344rpx;
  background-color: #E2E9F2;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.map-cell {
  width: 60rpx;
  height: 60rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.5);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.5);
}
.road {
  position: absolute;
  background-color: #FFFFFF;
}
.road-h1 {
  top: 104rpx;
  left: 0;
  right: 0;
  height: 20rpx;
}
.road-h2 {
  top: 256rpx;
  left: 0;
  right: 0;
  height: 16rpx;
}
.road-v1 {
  top: 0;
  bottom: 0;
  left: 224rpx;
  width: 14rpx;
}
.block {
  position: absolute;
  background-color: #D3E4D3;
  border-radius: 8rpx;
}
.block-1 {
  top: 40rpx;
  left: 40rpx;
  width: 144rpx;
  height: 92rpx;
}
.block-2 {
  top: 184rpx;
  left: 396rpx;
  width: 176rpx;
  height: 108rpx;
}
.block-3 {
  top: 28rpx;
  right: 40rpx;
  width: 128rpx;
  height: 80rpx;
}
.pin-start {
  position: absolute;
  top: 180rpx;
  left: 116rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  background-color: rgba(1, 77, 178, 0.18);
}
.pin-start::after {
  content: '';
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background-color: #014DB2;
  border: 3rpx solid #FFFFFF;
}
.route {
  position: absolute;
  top: 196rpx;
  left: 132rpx;
  width: 160rpx;
  height: 4rpx;
  background-color: #014DB2;
  border-radius: 2rpx;
}
.pin-end {
  position: absolute;
  top: 152rpx;
  left: 288rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: #10B981;
  border: 4rpx solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pin-end-inner {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background-color: #FFFFFF;
}
.map-tag {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(4, 23, 41, 0.1);
}
.map-tag-txt {
  font-size: 24rpx;
  color: #0A1628;
  font-weight: 500;
}
.map-locate {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(4, 23, 41, 0.12);
}

/* 内容 */
.scroll {
  flex: 1;
  overflow: hidden;
}
.body {
  padding: 24rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stops {
  padding: 12rpx 32rpx;
  display: flex;
  flex-direction: column;
}
.stop-wrap {
  display: flex;
  flex-direction: column;
}
.stop {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 22rpx;
  padding: 26rpx 0;
}
.stop-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}
.stop-time {
  font-size: 26rpx;
  font-weight: 600;
  color: #0A1628;
  width: 80rpx;
  flex-shrink: 0;
}
.stop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: hidden;
}
.stop-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0A1628;
}
.stop-sub {
  font-size: 24rpx;
  color: #6B7280;
}
.stop-status {
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.stop-status-txt {
  font-size: 22rpx;
  font-weight: 500;
}

.sec-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0A1628;
}
.note-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.note-time {
  font-size: 22rpx;
  color: #9AA3AF;
}
.note {
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.note-ai {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}
.note-ai-txt {
  font-size: 22rpx;
  color: #0B8A5E;
  font-weight: 500;
}
.note-text {
  font-size: 26rpx;
  color: #0A1628;
  line-height: 42rpx;
}
.wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}
.note-tag {
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background-color: #F5F8FD;
  display: flex;
  align-items: center;
}
.note-tag-txt {
  font-size: 22rpx;
  color: #014B94;
}

.btn-row {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}
.btn {
  flex: 1;
  flex-direction: row;
  gap: 12rpx;
}
.btn-rec {
  background-color: #FEF2F2;
}
.btn-txt-rec {
  color: #EF4444;
  font-weight: 600;
}
.btn-txt-ghost {
  font-size: 28rpx;
  color: #0A1628;
  font-weight: 500;
}
.btn-txt-primary {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>