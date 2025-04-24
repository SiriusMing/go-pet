<template>
    <div class="goal-wrap">
      <!-- Tabs -->
      <div class="tab-row">
        <button
          v-for="s in scopes"
          :key="s"
          class="btn rect tab-btn"
          :class="{ active: scope === s }"
          @click="scope = s"
        >
          {{ s }}
        </button>
      </div>
  
      <!-- Goal List -->
      <div class="list-box pixel-frame">
        <div
          v-for="(g, i) in goals[scope]"
          :key="g.id"
          class="goal-item"
          :class="{ done: g.done }"
          @click="select(i)"
        >
          <span>{{ g.text }}</span>
          <span v-if="g.done">✔</span>
        </div>
      </div>
  
      <!-- Progress -->
      <div class="progress pixel-frame">
        <div
          class="bar"
          :style="{ width: percent + '%' }"
        ></div>
      </div>
  
      <!-- Buttons -->
      <div class="btn-row">
        <button class="btn rect" @click="addGoal">Add</button>
        <button class="btn rect" :disabled="selected === null" @click="markDone">
          Mark Done
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, watch, computed } from 'vue'
  
  /* ---------- 数据 & 本地存储 ---------- */
  const scopes = ['Daily', 'Weekly', 'Monthly']
  const scope  = ref('Daily')
  
  function load() {
    try {
      return JSON.parse(localStorage.getItem('goals-v1') || '{}')
    } catch {
      return {}
    }
  }
  function save() {
    localStorage.setItem('goals-v1', JSON.stringify(goals))
  }
  
  const goals = reactive(load())
  scopes.forEach(s => {
    if (!Array.isArray(goals[s])) goals[s] = []
  })
  watch(goals, save, { deep: true })
  
  /* ---------- 交互状态 ---------- */
  const selected = ref(null)
  function select(idx) {
    selected.value = selected.value === idx ? null : idx
  }
  
  /* ---------- 操作 ---------- */
  function addGoal() {
    const txt = prompt('Enter new goal:')
    if (!txt) return
    goals[scope.value].push({ id: Date.now(), text: txt, done: false })
  }
  function markDone() {
    if (selected.value === null) return
    goals[scope.value][selected.value].done = true
    selected.value = null
  }
  
  /* ---------- 进度条百分比 ---------- */
  const percent = computed(() => {
    const list = goals[scope.value]
    if (!list.length) return 0
    const doneCount = list.filter(g => g.done).length
    return Math.round((doneCount / list.length) * 100)
  })
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  
  .goal-wrap {
    width: 420px;
    height: 340px;
    background: #ECE4DB;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #000;
    image-rendering: pixelated;
    font-family: 'Press Start 2P', monospace;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* --- tabs --- */
  .tab-row {
    display: flex;
    gap: 4px;
  }
  .tab-btn {
    flex: 1;
    text-transform: uppercase;
    background: #FAE1DD;
  }
  .tab-btn.active {
    background: #FFD7BA;
  }
  
  /* --- pixel 按钮 --- */
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #000;
    width: 100%;
    height: 28px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000, -2px -2px 0 #000 inset;
    background: #FAE1DD;
    cursor: pointer;
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .btn:hover:enabled {
    filter: brightness(1.25);
  }
  
  /* --- 列表 --- */
  .pixel-frame {
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000, -2px -2px 0 #000 inset;
    background: #FAE1DD;
  }
  .list-box {
    flex: 1;
    overflow: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .goal-item {
    background: #FFE5D9;
    border: 2px solid #000;
    padding: 2px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }
  .goal-item.done {
    background: #D8E2DC;
    color: #555;
    text-decoration: line-through;
  }
  
  /* --- 进度条 --- */
  .progress {
    height: 24px;
    position: relative;
  }
  .bar {
    /* background: #FFD7BA; */
    height: 100%;
    border-right: 3px solid #000;
    box-shadow: 2px 0 0 #000 inset;
  }
  
  /* --- 底部按钮行 --- */
  .btn-row {
    display: flex;
    gap: 4px;
  }
  </style>
  
