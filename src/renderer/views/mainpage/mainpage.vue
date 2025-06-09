<template>
  <DeskPet @open="openPanel" />

  <div v-if="panel" class="main-container">
    <!-- 其他普通面板 -->
    <component
      v-if="panel.type !== 'ProfilePanel' && panel.type !== 'SettingsPanel'"
      :is="panelMap[panel.type]"
      class="panel"
      v-bind="panel.props"
      @close="closePanel"
      @openpanel="openPanel"
      @add-event="addEvent"
      @update-event="updateEvent"
      @delete-event="deleteEvent"
    />
    <!-- ProfilePanel，单独加 ref 用于热更新 -->
    <component
      v-else-if="panel.type === 'ProfilePanel'"
      ref="profilePanelRef"
      :is="panelMap[panel.type]"
      class="panel"
      v-bind="panel.props"
      @close="closePanel"
    />
    <!-- SettingsPanel，关闭时触发 profile 更新 -->
    <component
      v-else-if="panel.type === 'SettingsPanel'"
      :is="panelMap[panel.type]"
      class="panel"
      v-bind="panel.props"
      @close="closePanel"
      @profile-updated="onProfileUpdated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 组件导入（根据你的目录结构调整路径）
import DeskPet       from '@renderer/components/pet/pet.vue'
import Fun3Panel     from '@renderer/components/function/fun3/goal_manager.vue'
import Character     from '@renderer/components/function/fun3/character/character.vue'
import Fun1Panel     from '@renderer/components/function/fun1/MyCalendar.vue'
import Fun2Panel     from '@renderer/components/function/fun2/mood.vue'
import MoodStats     from '@renderer/components/function/fun2/stats.vue'
import MemoPanel     from '@renderer/components/function/fun1/MemoPanel.vue'
import EventFormPanel from '@renderer/components/function/fun1/EventFormPanel.vue'
import ProfilePanel  from '@renderer/components/setting/ProfilePanel.vue'
import SettingsPanel from '@renderer/components/setting/SettingsPanel.vue'

const events = ref([]) // 所有事件统一管理

const panel = ref(null)
const profilePanelRef = ref(null) // 获取 ProfilePanel 组件实例

const panelMap = {
  Fun3: Fun3Panel,
  character: Character,
  Fun2: Fun2Panel,
  stats: MoodStats,
  Fun1: Fun1Panel,
  MemoPanel: MemoPanel,
  EventFormPanel: EventFormPanel,
  ProfilePanel: ProfilePanel,
  SettingsPanel: SettingsPanel
}

function openPanel(payload) {
  if (typeof payload === 'string') {
    panel.value = { type: payload, props: {} }
    return
  }
  if (payload.type === 'MemoPanel') {
    panel.value = { type: 'MemoPanel', props: { date: payload.date, events: events.value } }
    return
  }
  if (payload.type === 'EventFormPanel') {
    panel.value = { type: 'EventFormPanel', props: { event: payload.event || {}, events: events.value } }
    return
  }
  panel.value = { type: payload.type, props: payload.props || {} }
}

function closePanel() {
  panel.value = null
}

function addEvent(event) {
  event.id = Date.now()
  events.value.push({ ...event })
  closePanel()
}
function updateEvent(event) {
  const idx = events.value.findIndex(e => e.id === event.id)
  if (idx > -1) events.value[idx] = { ...event }
  closePanel()
}
function deleteEvent(id) {
  events.value = events.value.filter(e => e.id !== id)
}

// 【关键】Settings保存后，刷新Profile
function onProfileUpdated() {
  // ref 方式调用 ProfilePanel 组件里暴露出来的 fetchUserProfile 方法
  if (profilePanelRef.value && profilePanelRef.value.fetchUserProfile) {
    profilePanelRef.value.fetchUserProfile()
  }
}
</script>

<style scoped>
.main-container {
  position: fixed;
  left: 40px;
  top: 40px;
  width: 420px;
  height: 480px;
  background: #00000000;
  margin-left: 160px;
}
</style>




  
  