// petLogic.js
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

export default function usePetLogic() {
  // —— 资源 & Electron 接口 ——  
  const petSrc = new URL('/model/rana/038_live_event_286_ur/index.json', import.meta.url).href
  const electronAPI = window.electronAPI || null
  const safeIgnore = flag => electronAPI?.setIgnoreMouseEvents(flag)

  // —— 拖拽定位 ——  
  const x = ref(200), y = ref(200)
  const isDragging = ref(false)
  let offsetX = 0, offsetY = 0
  // Live2D 容器引用，用于读取尺寸
  const modelContainer = ref(null)
  const imgW = ref(180), imgH = ref(120)

  // —— 更新容器尺寸 ——  
  function updateImgSize() {
  if (!modelContainer.value || !modelContainer.value.firstChild) return
  const canvas = modelContainer.value.firstChild
  imgW.value = canvas.offsetWidth
  imgH.value = canvas.offsetHeight
}


  function startDrag(e) {
    isDragging.value = true
    showControls()
    offsetX = e.clientX - x.value
    offsetY = e.clientY - y.value

    function onMove(ev) {
  if (!isDragging.value) return

  /* ① 先算出“如果这一下拖过去，宠物的中心在哪里” */
  const tentativeX = ev.clientX - offsetX          // 这一步先不截边
  const center     = tentativeX + imgW.value / 2   // 水平中心

  /* ② 判断哪边要显示按钮列 */
  const showLeftCol  = center > CW + M             // 够位置 → 显示左列
  const showRightCol = center < window.innerWidth - (CW + M)

  /* ③ 依据列的显示情况，给左右边界留安全区 */
  const extraLeft  = showLeftCol  ? CW + M : 0
  const extraRight = showRightCol ? CW + M : 0

  const minX = extraLeft-70                       // 不能再往左
  const maxX = window.innerWidth - imgW.value - extraRight -23

  /* ④ 终于真正裁剪并赋值 */
  x.value = Math.min(Math.max(minX, tentativeX), maxX)

  /* —— 垂直方向直接卡住模型本身即可 —— */
  const tentativeY = ev.clientY - offsetY
  const minY       = 0
  const maxY       = window.innerHeight - imgH.value -150
  y.value = Math.min(Math.max(minY, tentativeY), maxY)
}

    function onUp() {
      isDragging.value = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // —— 控件显隐 ——  
  const ctrlVisible = ref(false)
  let hideTimer = null
  function showControls() {
    clearTimeout(hideTimer)
    ctrlVisible.value = true
    safeIgnore(false)
  }
  function scheduleHide() {
    hideTimer = setTimeout(() => {
      ctrlVisible.value = false
      panelVisible.value = false
      safeIgnore(true)
    }, 1000)
  }

 // —— 左右列位置计算 ——  
const M  = 6    // 和模型之间的最小间隙
const CW = 40  // 按钮列宽度（px），正值
const CH = 100  // 按钮列高度（px），正值
const HO = -10   // 额外水平偏移（正值：越大越往外）

// 1. 先算出模型的水平中心
const centerX   = computed(() => x.value + imgW.value / 2)

// 2. 阈值：离左边缘 / 右边缘多远，就认为“靠近”
//    HO 正值往外推，HO 负值往里收
const leftThreshold  = CW + M + HO
const rightThreshold = window.innerWidth - (CW + M + HO)

// 3. 判定：如果中心在左阈值以内，就算 nearLeft；如果中心过了右阈值，就算 nearRight
const nearLeft  = computed(() => centerX.value < leftThreshold)
const nearRight = computed(() => centerX.value > rightThreshold)


const leftStyle = computed(() => {
  // 模型右侧贴左列，或模型左侧贴左列  模型没有居中对其 所以改了位置偏移
  const lx = nearLeft.value ? imgW.value + M + HO : -CW - M - HO
   return { left: `${lx + 35}px` }
})

const rightStyle = computed(() => {
  const rx = nearRight.value ? -CW - M - HO : imgW.value + M + HO
   return { left: `${rx + 65}px` }
})


  // —— Other 面板 ——  
  const features     = ['Fun1', 'Fun2', 'Fun3']
  const panelVisible = ref(false)
  const panelPos     = ref({ left: '0px', top: '0px' })
  const panelEl      = ref(null)

  function togglePanel() {
    panelVisible.value = !panelVisible.value
    if (panelVisible.value) nextTick(placePanel)
    else scheduleHide()
  }
  function placePanel() {
    const btn = document.querySelector('.chat-btn')
    if (!btn || !panelEl.value) return
    const r = btn.getBoundingClientRect()
    const w = panelEl.value.offsetWidth, h = panelEl.value.offsetHeight
    let px = Math.min(Math.max(M, r.left + (r.width - w) / 2), window.innerWidth - w - M)
    let py = r.bottom + M
    if (py + h > window.innerHeight - M) py = r.top - h - M
    panelPos.value = { left: px + 'px', top: py + 'px' }
  }

  onMounted(() => {
    updateImgSize()
    window.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })
  function onResize() {
    if (panelVisible.value) placePanel()
  }

  // —— 退出 ——  
  function exitApp() {
    electronAPI?.exitApp?.()
  }

  return {
    x,
    y,
    isDragging,
    petSrc,
    modelContainer,
    imgW,
    imgH,
    updateImgSize,
    ctrlVisible,
    nearLeft,
    nearRight,
    leftStyle,
    rightStyle,
    panelVisible,
    panelPos,
    panelEl,
    features,
    showControls,
    scheduleHide,
    startDrag,
    togglePanel,
    exitApp
  }
}
