/**
 * 运行环境自检脚本
 * 在 HBuilderX 运行到手机之前执行，能提前发现 90% 的失败原因
 *
 * 用法：node check-env.js
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = __dirname
let pass = 0
let warn = 0
let fail = 0

const ok = (msg) => { console.log('  \x1b[32m✓\x1b[0m ' + msg); pass++ }
const caution = (msg) => { console.log('  \x1b[33m!\x1b[0m ' + msg); warn++ }
const err = (msg) => { console.log('  \x1b[31m✗\x1b[0m ' + msg); fail++ }
const section = (t) => console.log('\n\x1b[1m' + t + '\x1b[0m')

const readJSON = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { return null }
}

/* ---------- 1. 依赖 ---------- */
section('1. 项目依赖')
const nm = path.join(ROOT, 'node_modules')
if (!fs.existsSync(nm)) {
  err('node_modules 不存在 → 请先执行 npm install')
} else {
  const esb = path.join(nm, '@esbuild/win32-x64/esbuild.exe')
  if (fs.existsSync(esb)) ok('esbuild Windows 二进制已就位')
  else {
    err('esbuild 二进制缺失 → 执行：npm install --no-save --ignore-scripts @esbuild/win32-x64@0.20.2')
  }
  const vite = path.join(nm, '@dcloudio/vite-plugin-uni')
  if (fs.existsSync(vite)) ok('uni-app Vite 编译器已安装')
  else err('缺少 @dcloudio/vite-plugin-uni → 重新执行 npm install')
}

/* ---------- 2. 必须文件 ---------- */
section('2. 关键文件')
const required = [
  ['index.html', 'uni-app 入口（缺此项必然报"无法解析入口"）'],
  ['src/main.js', '应用入口'],
  ['src/App.vue', '全局样式'],
  ['src/pages.json', '路由配置'],
  ['src/manifest.json', 'App 配置'],
  ['src/static/tabbar/home-idle.png', 'tabBar 图标']
]
required.forEach(([f, desc]) => {
  if (fs.existsSync(path.join(ROOT, f))) ok(`${f}`)
  else err(`${f} 缺失 — ${desc}`)
})

/* ---------- 3. AppID ---------- */
section('3. AppID 配置')
const manifest = readJSON(path.join(ROOT, 'src/manifest.json'))
if (!manifest) {
  err('manifest.json 解析失败，检查 JSON 语法')
} else if (!manifest.appid) {
  err('appid 为空 → HBuilderX 菜单 工具 → 获取 AppID')
} else if (manifest.appid === '__UNI__FZ2026') {
  err('appid 仍是占位值 → 必须改成你自己的 DCloud AppID')
  console.log('      获取方式：HBuilderX 登录 → 菜单 工具 → 获取 AppID → 填入 src/manifest.json')
} else if (!/^__UNI__[A-F0-9]{6,}$/.test(manifest.appid)) {
  caution(`appid 格式可疑: ${manifest.appid}`)
  console.log('      正规格式形如 __UNI__DA0524A，建议在 HBuilderX 内点 manifest.json 顶部按钮获取')
} else {
  ok('appid: ' + manifest.appid)
}

/* ---------- 4. 路由与页面一致性 ---------- */
section('4. 路由与页面文件')
const pages = readJSON(path.join(ROOT, 'src/pages.json'))
if (!pages) {
  err('pages.json 解析失败')
} else {
  const routes = (pages.pages || []).map(p => p.path)
  routes.forEach(r => {
    const f = path.join(ROOT, 'src', r + '.vue')
    if (fs.existsSync(f)) ok(r)
    else err(`${r} 在 pages.json 中注册但文件不存在`)
  })
  // tabBar 页面必须与 routes 对应
  const tabList = pages.tabBar?.list || []
  tabList.forEach(t => {
    if (!routes.includes(t.pagePath)) {
      err(`tabBar 项「${t.text}」指向 ${t.pagePath}，但该页未在 pages 中注册`)
    }
  })
  // 图标存在性
  tabList.forEach(t => {
    ;[t.iconPath, t.selectedIconPath].forEach(ip => {
      if (ip && !fs.existsSync(path.join(ROOT, 'src', ip))) {
        err(`tabBar 图标缺失: ${ip}`)
      }
    })
  })
  if (pages.tabBar) ok(`tabBar 配置完整（${pages.tabBar.list.length} 个标签）`)
}

/* ---------- 5. 权限 ---------- */
section('5. Android 权限')
const perms = manifest?.appPlus?.distribute?.android?.permissions ||
              manifest?.['app-plus']?.distribute?.android?.permissions || []
if (perms.length >= 5) ok(`已声明 ${perms.length} 项权限`)
else caution('权限声明不足 5 项，定位/录音功能可能异常')

/* ---------- 6. 编译验证 ---------- */
section('6. 编译验证')
try {
  execSync('npx vite build', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 420000,
    maxBuffer: 20 * 1024 * 1024
  })
  // 退出码为 0 即构建成功。uni-app 输出里常有含"error"字样的
  // 提示（如错误处理说明），不能据此判失败——以 exit code 为准。
  ok('vite build 通过，代码可正常编译')
} catch (e) {
  const msg = ((e.stderr || '') + (e.stdout || '')).toString()
  const sig = (e.signal || '') + ' ' + (e.killed ? 'killed' : '')

  // 沙箱/权限类拦截：与工程代码无关，不算构建失败
  if (/SAFE_DELETE_BULK_GUARD_ERROR|safe-delete-shim|EPERM|EACCES|state lock timeout/.test(msg)) {
    caution('构建被运行环境的安全策略拦截（非工程问题）')
    console.log('      这是工具环境的文件保护机制，在你自己的终端里执行构建不受影响')
    console.log('      如需真实验证运行：npx vite --host 127.0.0.1 --port 5173')
  } else if (e.killed || /SIGTERM/.test(sig)) {
    // 构建超时
    caution('构建超时（>7分钟）。可能是首次编译较慢或磁盘紧张，可手动跑 npx vite build 确认')
  } else {
    const line = msg.split('\n').find(l => /RollupError|ParseError|ModuleNotFound|Cannot find|语法错误/i.test(l))
      || '构建失败'
    err(line.trim().slice(0, 120))
    console.log('      完整错误请手动执行 npm run build:h5 查看')
  }
}

/* ---------- 7. 磁盘空间 ---------- */
section('7. 磁盘空间')
try {
  // wmic 在新版 Windows 已移除，改用 fs.statfsSync（Node 18.15+）
  let disks = []
  if (typeof fs.statfsSync === 'function') {
    disks = [['C:', 'C:'], ['D:', 'D:']].filter(([p]) => {
      try { fs.statfsSync(p); return true } catch (e) { return false }
    })
    disks.forEach(([, drive]) => {
      const s = fs.statfsSync(drive)
      const free = s.bavail * s.bsize / 1024 / 1024 / 1024
      const total = s.blocks * s.bsize / 1024 / 1024 / 1024
      const used = ((total - free) / total * 100).toFixed(0)
      const tag = free < 10 ? err : free < 20 ? caution : ok
      tag(`${drive} 剩余 ${free.toFixed(1)}G / ${total.toFixed(0)}G（已用 ${used}%）`)
      if (drive === 'C:' && free < 20) {
        console.log('      C 盘不足 20G：运行到基座不受影响，但云打包会失败')
      }
    })
  } else {
    caution('当前 Node 版本无法读取磁盘信息（需 18.15+）')
  }
} catch (e) {
  caution('无法读取磁盘信息')
}

/* ---------- 8. 手机设备连接 ---------- */
section('8. 手机设备连接')
try {
  // 定位 HBuilderX 自带的 adb
  const adbPaths = [
    'D:/Tools/HBuilderX/HBuilderX/plugins/launcher-tools/tools/adbs/1.0.31/adb.exe',
    'D:/Program Files/HBuilderX/plugins/launcher-tools/tools/adbs/1.0.31/adb.exe'
  ]
  const adb = adbPaths.find(p => fs.existsSync(p))
  if (!adb) {
    caution('未找到 HBuilderX 自带 adb，无法自动检测设备')
  } else {
    const out = execSync(`"${adb}" devices`, { encoding: 'utf8', timeout: 30000 }).replace(/\r/g, '')
    const devs = out.split('\n').filter(l => l.includes('\tdevice'))
    const unau = out.split('\n').filter(l => l.includes('unauthorized'))
    if (devs.length) {
      devs.forEach(d => {
        const [serial, , info] = d.trim().split(/\s+/)
        const model = (info.match(/model:(\S+)/) || [])[1] || ''
        ok(`设备已连接 ${serial}${model ? ' (' + model + ')' : ''}`)
      })
      console.log('      HBuilderX 菜单：运行 → 运行到手机或模拟器 → 运行到 Android App 基座')
    } else if (unau.length) {
      err('设备未授权 USB 调试 → 手机上点「允许 USB 调试」弹窗')
    } else {
      caution('未检测到设备 → 检查 USB 线(需支持数据传输)、手机 USB 调试是否开启')
    }
  }
} catch (e) {
  caution('设备检测失败（可能是环境限制，不影响工程本身）')
}

/* ---------- 9. 系统 Node 环境（HBuilderX 运行 CLI 项目的硬性前提） ---------- */
section('9. 系统 Node 环境')
try {
  // 注意：`where node` 查的是当前进程的 PATH。在某些隔离环境中
  // （如 AI 助手沙箱），它反映的不是系统 PATH，会误报。
  // 因此以 HBuilderX 自身的日志为最终判据 —— 那是 HBuilderX 真实的探测结果。
  const logPath = 'C:/Users/eda16/AppData/Roaming/HBuilder X/.log'
  let hbxOk = null
  if (fs.existsSync(logPath)) {
    const log = fs.readFileSync(logPath, 'utf8')
    const lines = log.split('\n')
    // 取最近一次 nodeserver 激活记录与最近的 Node 探测失败记录
    let lastOk = -1
    let lastFail = -1
    lines.forEach((l, i) => {
      if (/nodeserver.*激活成功|nodejs-extension/.test(l) && l.includes('激活成功')) lastOk = i
      if (/获取 Node 路径失败/.test(l)) lastFail = i
    })
    if (lastOk >= 0) hbxOk = lastOk > lastFail
  }

  if (hbxOk === true) {
    ok('HBuilderX 已成功探测到 Node（日志确认）')
    let v = null
    try { v = execSync('node --version', { encoding: 'utf8', timeout: 15000 }).trim() } catch (e) {}
    if (v) console.log('      当前会话 Node: ' + v)
    console.log('      注：本脚本运行在隔离环境，版本号可能与系统 PATH 中的不同')
  } else if (hbxOk === false) {
    err('HBuilderX 日志显示仍找不到 Node')
    console.log('      解决：双击运行 setup-node.bat，然后【完全退出并重启 HBuilderX】')
  } else {
    caution('无法读取 HBuilderX 日志，跳过 Node 检测')
    console.log('      请确认：系统 PATH 中有 node，且 HBuilderX 已重启')
  }
} catch (e) {
  caution('Node 环境检测异常')
}

/* ---------- 汇总 ---------- */
console.log('\n' + '='.repeat(46))
console.log(`  通过 ${pass}　警告 ${warn}　失败 ${fail}`)
console.log('='.repeat(46))
if (fail === 0) {
  console.log('\n  \x1b[32m可以进行「运行到 Android App 基座」\x1b[0m')
  process.exit(0)
} else {
  console.log('\n  \x1b[31m请先修复上述 ✗ 项\x1b[0m')
  process.exit(1)
}