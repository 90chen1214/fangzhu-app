<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('房助 APP 启动')
})
</script>

<style>
/* ==================== 全局基础样式 ==================== */
page {
  background-color: #F9F9F9;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC',
    'Noto Sans SC', 'Helvetica Neue', Helvetica, sans-serif;
  color: #0A1628;
  -webkit-font-smoothing: antialiased;
}

view, text, scroll-view {
  box-sizing: border-box;
}

/* 通用卡片 */
.fz-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  border: 1rpx solid #EAEAEA;
}

.fz-shadow {
  box-shadow: 0 2rpx 8rpx rgba(1, 77, 178, 0.06);
}

/* 深蓝渐变主卡 */
.fz-hero {
  background: linear-gradient(135deg, #014DB2 0%, #001645 100%);
  border-radius: 28rpx;
}

/* 胶囊主按钮 */
.fz-btn-primary {
  height: 92rpx;
  border-radius: 46rpx;
  background-color: #014DB2;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 胶囊次按钮 */
.fz-btn-ghost {
  height: 92rpx;
  border-radius: 46rpx;
  background-color: #F1F5FB;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 细分割线 */
.fz-divider {
  height: 1rpx;
  background-color: #EAEAEA;
  width: 100%;
}

/* 文本省略 */
.fz-ell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>