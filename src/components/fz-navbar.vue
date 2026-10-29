<template>
  <view class="nb">
    <view class="nb-back" @click="goBack">
      <fz-icon name="back" :size="40" color="#0A1628" />
    </view>
    <text class="nb-title">{{ title }}</text>
    <view class="nb-spacer"></view>
  </view>
</template>

<script>
export default {
  name: 'fz-navbar',
  props: {
    title: { type: String, default: '' }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }
  }
}
</script>

<style scoped>
.nb {
  height: 104rpx;
  background-color: #F9F9F9;
  border-bottom: 1rpx solid #EAEAEA;
  padding: 0 40rpx 0 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.nb-back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nb-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #0A1628;
}
.nb-spacer {
  width: 72rpx;
  height: 72rpx;
}
</style>