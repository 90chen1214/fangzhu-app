<template>
  <view class="sb">
    <text class="sb-time">{{ time }}</text>
    <view class="sb-icons">
      <view class="sb-signal">
        <view v-for="(h, i) in [4, 6, 9, 12]" :key="i" class="sb-bar" :style="{ height: h + 'rpx' }"></view>
      </view>
      <view class="sb-wifi"></view>
      <view class="sb-batt">
        <view class="sb-batt-in"></view>
        <view class="sb-batt-cap"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'fz-statusbar',
  props: {
    time: { type: String, default: '9:41' }
  }
}
</script>

<style scoped>
.sb {
  height: 62rpx;
  padding: 0 32rpx 0 40rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.sb-time {
  font-size: 30rpx;
  font-weight: 600;
  color: #0A1628;
  font-family: 'Helvetica Neue', Helvetica, sans-serif;
  letter-spacing: 0.5rpx;
}
.sb-icons {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}
.sb-signal {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 3rpx;
  height: 24rpx;
}
.sb-bar {
  width: 6rpx;
  border-radius: 2rpx;
  background-color: #0A1628;
}
.sb-wifi {
  width: 24rpx;
  height: 24rpx;
  border-top: 4rpx solid #0A1628;
  border-radius: 50% 50% 0 0;
  transform: scaleY(1.35);
}
.sb-batt {
  width: 36rpx;
  height: 20rpx;
  border: 3rpx solid #0A1628;
  border-radius: 6rpx;
  position: relative;
  display: flex;
  align-items: center;
  padding: 2rpx;
  box-sizing: border-box;
}
.sb-batt-in {
  width: 100%;
  height: 100%;
  background-color: #0A1628;
  border-radius: 2rpx;
}
.sb-batt-cap {
  position: absolute;
  right: -6rpx;
  top: 6rpx;
  width: 4rpx;
  height: 8rpx;
  border-radius: 0 2rpx 2rpx 0;
  background-color: #0A1628;
}
</style>