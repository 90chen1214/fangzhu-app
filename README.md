# 房助 APP

房产经纪人 AI 助手 · uni-app (Vue 3 + Vite)

## 快速开始

```bash
npm install
npx vite --host 127.0.0.1 --port 5173
```

访问 http://127.0.0.1:5173/

**开发环境登录**：手机号任意，验证码固定 `8888`

## 页面

| 路由 | 说明 |
|---|---|
| /pages/login/login | 登录（非 tab） |
| /pages/index/index | 工作台 |
| /pages/decision/decision | 联合推荐决策 |
| /pages/copywriter/copywriter | AI 文案工厂 |
| /pages/viewing/viewing | 带看跟客 |
| /pages/profile/profile | 客户画像 |
| /pages/mine/mine | 我的 |

## 切换到真实后端

`src/utils/request.js`：

```js
export const USE_MOCK = false
export const BASE_URL = 'https://你的域名/v1'
```

接口契约见 `../outputs/HBuilderX导入说明.md`。
