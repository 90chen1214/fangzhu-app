<template>
  <view class="ic" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <!-- H5 端：用 SVG 保证线条质量 -->
    <image
      v-if="useSvg"
      class="ic-img"
      :src="dataUrl"
      mode="aspectFit"
      :style="{ width: size + 'rpx', height: size + 'rpx' }"
    />
    <!-- 其他端：线框降级方案，至少不空白 -->
    <view v-else class="ic-fallback" :style="{ width: size + 'rpx', height: size + 'rpx' }">
      <view
        class="fb-box"
        :style="{
          width: boxW + 'rpx',
          height: boxH + 'rpx',
          borderColor: color,
          borderWidth: hairline,
          borderRadius: radius
        }"
      ></view>
    </view>
  </view>
</template>

<script>
import ICONS from '../utils/icons.js'

/**
 * 图标组件
 * - H5：SVG dataURL，视觉最佳
 * - 小程序/App：SVG 支持有限，降级为线框示意
 *   正式开发建议统一替换为 iconfont 或 base64 PNG
 */
const hasSvgSupport = typeof window !== 'undefined' && typeof document !== 'undefined'

/** 各图标的降级线框参数（相对 24×24 视口，按 size 缩放） */
const FALLBACK = {
  doc:        { w: 13, h: 17, r: 2 },
  star:       { w: 17, h: 17, r: 8.5 },
  house:      { w: 18, h: 15, r: 2 },
  user:       { w: 16, h: 16, r: 8 },
  pin:        { w: 13, h: 16, r: 7 },
  shield:     { w: 16, h: 17, r: 3 },
  warn:       { w: 17, h: 17, r: 8.5 },
  check:      { w: 17, h: 17, r: 8.5 },
  refresh:    { w: 17, h: 17, r: 8.5 },
  pen:        { w: 13, h: 17, r: 2 },
  mic:        { w: 10, h: 17, r: 5 },
  bell:       { w: 16, h: 16, r: 5 },
  locate:     { w: 17, h: 17, r: 8.5 },
  spark:      { w: 15, h: 15, r: 3 },
  arrow:      { w: 11, h: 11, r: 1 },
  layers:     { w: 17, h: 15, r: 2 },
  chart:      { w: 17, h: 16, r: 2 },
  phone:      { w: 14, h: 17, r: 2 },
  calendar:   { w: 17, h: 16, r: 3 },
  logo:       { w: 22, h: 22, r: 9 }
}

export default {
  name: 'fz-icon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 40 },
    color: { type: String, default: '#0A1628' },
    stroke: { type: Number, default: 1.7 }
  },
  computed: {
    useSvg () {
      return hasSvgSupport
    },
    dataUrl () {
      const raw = ICONS[this.name]
      if (!raw) return ''
      const svg = raw.replace(/\{C\}/g, this.color).replace(/1\.7/g, this.stroke)
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    },
    fb () {
      return FALLBACK[this.name] || { w: 15, h: 15, r: 3 }
    },
    boxW () {
      return (this.fb.w / 24) * this.size
    },
    boxH () {
      return (this.fb.h / 24) * this.size
    },
    radius () {
      return (this.fb.r / 24) * this.size + 'rpx'
    },
    hairline () {
      return Math.max(1, (this.stroke / 24) * this.size) + 'rpx'
    }
  }
}
</script>

<style scoped>
.ic {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ic-img {
  display: block;
}
.ic-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}
.fb-box {
  border-style: solid;
  opacity: 0.85;
  box-sizing: border-box;
}
</style>