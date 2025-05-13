// petLogic.js
import { ref, computed, nextTick, onMounted, onBeforeUnmount,watch } from 'vue'


export default function usePetLogic() {
  // —— 资源 & Electron 接口 ——  
  //我也不知道 但是URL后就可以渲染。。 后面再说吧
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
    const showLeftCol  = center > threshold
    const showRightCol = center < window.innerWidth - threshold

    /* ③ 依据列的显示情况，给左右边界留安全区 */
    const extraLeft  = showLeftCol  ? threshold : 0
    const extraRight = showRightCol ? threshold : 0

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
const M  = 6          // 与模型最小间隙
const CW = 40         // 按钮列宽度
const HO = -10        // 额外水平偏移（正：向外，负：向里）

const threshold = CW + M + Math.abs(HO)    // 56


// 1. 模型水平中心
const centerX = computed(() => x.value + imgW.value / 2)

// 宠物中心点到边缘距离 < threshold 则算“靠边”
//TODO: 为什么我右边不能隐藏了。。 无语
const nearLeft  = computed(() => centerX.value < threshold)
const windowWidth = ref(window.innerWidth)
const updateWindowSize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => {
  window.addEventListener('resize', updateWindowSize)
})
// 修改 nearRight 计算属性
const nearRight = computed(() => {
  // 添加 2px 容差防止计算误差
  return centerX.value > (windowWidth.value - threshold)
})



// 4. 两列偏移
const leftStyle = computed(() => {
  // 如果靠左，就把左侧按钮往右推：imgW + M + HO
  // 否则就把它收回去：-CW - M - HO
  const xOffset = nearLeft.value
    ? imgW.value + M + HO
    : -CW - M - HO
  return { left: `${xOffset + 45}px` }
})

const rightStyle = computed(() => {
  // 如果靠右，就把右侧按钮往左推：-CW - M - HO
  // 否则就把它放到模型右侧：imgW + M + HO
  const xOffset = nearRight.value
    ? -CW - M - HO
    : imgW.value + M + HO
  return { left: `${xOffset + 90}px` }
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
