<template>
    <!-- 永驻的桌宠 -->
    <DeskPet @open="openPanel" />
  
    <!-- 只有当 panelMap[panel] 有对应组件时才渲染 -->
    <div v-if="panelMap[panel]" class="main-container">
      <component :is="panelMap[panel]" class="panel"/>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // 注意路径要对应到你的实际文件
  // 如果桌宠就是你之前的 home.vue，就改成：
  import DeskPet   from '@renderer/components/pet/pet.vue'
  // 如果你有专门的 pet.vue，则路径按项目别名
  // import DeskPet from '@/components/pet/pet.vue'
  
  // Fun3Panel 实际就是你的 goal_manager.vue
  import Fun3Panel from '@renderer/components/function/fun3/goal_manager.vue'
  
  const panel = ref(null)
  function openPanel(name) {
    panel.value = name
  }
  
  const panelMap = {
    // 按你之前的 features 列表来对应
    //Fun1: /* Fun1Panel */,
    //Fun2: /* Fun2Panel */,
    Fun3: Fun3Panel,
    //Chat: /* ChatPanel */,
    //Dress: /* DressPanel */,
    //Info:  /* InfoPanel */,
    //Settings: /* SettingsPanel */,
    //Switch: /* SwitchPanel */,
  }
  </script>
  
  <style scoped> 
  /* 到时候再看窗口大小是否需要统一还是把这个删了 ...*/
  .main-container { 
    position: fixed;
    left: 40px;
    top: 40px;
    width: 420px;
    height: 480px;
    background: #00000000;
    /* box-shadow: 0 4px 12px rgba(0,0,0,.12); */
    margin-left: 160px; /* 根据桌宠宽度调整 */
  }
</style>

  
  