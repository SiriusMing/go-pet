<template>
  <div id="app">
    <header>
      <h1>MyMemo</h1>
    </header>

    <main>
      <router-view></router-view> <!-- 路由视图，显示当前页面 -->
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
#app {
  font-family: 'Press Start 2P', monospace; /* 更加独特的字体 */
  background-color: #f4f4f9;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

header {
  background: linear-gradient(145deg, #ff8b8b, #fae1dd); /* 渐变背景 */
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: white;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

h1 {
  margin: 0;
  font-size: 2.5em; /* 更大字体 */
}

main {
  margin-top: 20px;
  padding: 20px;
  background-color: #ffe5d9; /* 轻柔的背景色 */
  border-radius: 10px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1); /* 软阴影效果 */
  width: 90%;  /* 增大宽度 */
  max-width: 1000px; /* 增大最大宽度 */
  min-width: 600px; /* 设置最小宽度，避免过于窄 */
}
</style>
