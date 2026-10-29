<template>
  <view class="page">
    <fz-statusbar />

    <view class="hero">
      <view class="logo"></view>
      <text class="app-name">房助</text>
      <text class="app-slogan">房产经纪人的 AI 助手</text>
    </view>

    <view class="form">
      <view class="field">
        <text class="field-label">手机号</text>
        <input
          v-model="phone"
          class="field-input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-class="ph"
        />
      </view>

      <view class="field">
        <text class="field-label">验证码</text>
        <input
          v-model="code"
          class="field-input code-input"
          type="number"
          maxlength="6"
          placeholder="请输入验证码"
          placeholder-class="ph"
        />
        <view
          class="code-btn"
          :class="{ disabled: counting }"
          @click="sendCode"
        >
          <text class="code-btn-txt">{{ counting ? count + 's' : '获取验证码' }}</text>
        </view>
      </view>

      <view
        class="fz-btn-primary submit"
        :class="{ disabled: !canSubmit }"
        @click="doLogin"
      >
        <text class="submit-txt">{{ submitting ? '登录中…' : '登录' }}</text>
      </view>

      <view class="agree">
        <view class="agree-box" @click="agreed = !agreed">
          <view v-if="agreed" class="agree-check"></view>
        </view>
        <text class="agree-txt">已阅读并同意《用户协议》与《隐私政策》</text>
      </view>
    </view>

    <view class="tips">
      <text class="tips-txt">开发测试环境，验证码固定 8888</text>
    </view>
  </view>
</template>

<script>
import { login, sendSms } from '../../utils/api.js'
import { setLogin } from '../../utils/store.js'
import { setUnauthorizedHandler } from '../../utils/request.js'

export default {
  data () {
    return {
      phone: '',
      code: '',
      agreed: false,
      counting: false,
      count: 60,
      submitting: false,
      timer: null
    }
  },
  computed: {
    canSubmit () {
      return /^1\d{10}$/.test(this.phone) && this.code.length >= 4 && this.agreed && !this.submitting
    }
  },
  onUnload () {
    if (this.timer) clearInterval(this.timer)
  },
  onLoad () {
    // 全局 401 跳登录页时，避免重复跳转
    setUnauthorizedHandler(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    })
  },
  methods: {
    async sendCode () {
      if (this.counting) return
      if (!/^1\d{10}$/.test(this.phone)) {
        return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
      }
      try {
        await sendSms(this.phone)
        uni.showToast({ title: '验证码已发送', icon: 'none' })
        this.counting = true
        this.count = 60
        this.timer = setInterval(() => {
          this.count--
          if (this.count <= 0) {
            this.counting = false
            clearInterval(this.timer)
          }
        }, 1000)
      } catch (e) {
        // 错误提示已在 request 层统一处理
      }
    },
    async doLogin () {
      if (!this.agreed) {
        return uni.showToast({ title: '请先同意用户协议', icon: 'none' })
      }
      if (!/^1\d{10}$/.test(this.phone)) {
        return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
      }
      if (this.code.length < 4) {
        return uni.showToast({ title: '请输入验证码', icon: 'none' })
      }

      this.submitting = true
      try {
        const res = await login(this.phone, this.code)
        setLogin(res.token, res.userInfo)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 600)
      } catch (e) {
        // 错误提示已统一处理
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  background-color: #F9F9F9;
  display: flex;
  flex-direction: column;
}

.hero {
  padding: 100rpx 80rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.logo {
  width: 128rpx;
  height: 128rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #014DB2, #001645);
  margin-bottom: 12rpx;
}
.app-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #0A1628;
  letter-spacing: 4rpx;
}
.app-slogan {
  font-size: 26rpx;
  color: #6B7280;
}

.form {
  flex: 1;
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.field-label {
  font-size: 26rpx;
  color: #6B7280;
  font-weight: 500;
}
.field-input {
  height: 96rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: #0A1628;
  border: 1rpx solid #EAEAEA;
}
.ph {
  color: #9AA3AF;
}
.field {
  position: relative;
}
.code-input {
  padding-right: 200rpx;
}
.code-btn {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  height: 80rpx;
  padding: 0 28rpx;
  border-radius: 12rpx;
  background-color: #E8F0FD;
  display: flex;
  align-items: center;
  justify-content: center;
}
.code-btn.disabled {
  background-color: #F1F5FB;
}
.code-btn-txt {
  font-size: 26rpx;
  color: #014DB2;
  font-weight: 500;
}

.submit {
  margin-top: 20rpx;
}
.submit.disabled {
  background-color: #B9CFE6;
}
.submit-txt {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.agree {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14rpx;
  margin-top: 8rpx;
}
.agree-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid #D6D9DE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.agree-check {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  background-color: #014DB2;
}
.agree-txt {
  font-size: 22rpx;
  color: #9AA3AF;
  flex: 1;
}

.tips {
  padding: 0 60rpx 60rpx;
  display: flex;
  justify-content: center;
}
.tips-txt {
  font-size: 22rpx;
  color: #B45309;
  background-color: #FFF4E2;
  padding: 8rpx 20rpx;
  border-radius: 10rpx;
}
</style>