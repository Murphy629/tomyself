<template>
  <div class="init-page">
    <!-- Top strip like login page -->
    <div class="top-strip"></div>
    <div class="card">
      <section class="form">
        <h2>Choose Your Profile</h2>
        <p class="muted">Select the type of user that best fits your usage.</p>
        <div class="options">
          <button
            class="option-btn"
            :class="{ selected: selectedType === 'General User' }"
            @click="selectedType = 'General User'"
          >General User</button>
          <button
            class="option-btn"
            :class="{ selected: selectedType === 'Advanced User' }"
            @click="selectedType = 'Advanced User'"
          >Advanced User</button>
          <button
            class="option-btn"
            :class="{ selected: selectedType === 'Developer' }"
            @click="selectedType = 'Developer'"
          >Developer</button>
        </div>
        <button
          v-if="selectedType"
          class="confirm-btn"
          @click="confirmSelection"
        >
          Confirm
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedType = ref('')

function confirmSelection() {
  console.log('Confirmed role:', selectedType.value)
  // 这里可以存到 store 或 localStorage
  router.push('/') // 点击确认跳转主页
}
</script>

<style scoped>
/* 按钮样式 - 保持现在的版本 */
.option-btn {
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #8ec5ff; /* 直接使用颜色值 */
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: transform .02s, filter .15s, background .2s;
}

.option-btn:hover {
  filter: brightness(1.05);
}

.option-btn.selected {
  background: #abd3fdff;
  color: #fff;
}

.confirm-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: #8ec5ff; /* 直接使用颜色值 */
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: transform .02s, filter .15s;
}

.confirm-btn:hover {
  filter: brightness(1.05);
}

/* 背景样式 - 改回原来的版本 */
.init-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8fc); /* 使用原来的渐变 */
  display: flex;
  flex-direction: column;
}

.top-strip {
  height: 120px;
  background: linear-gradient(180deg, #f6f8fc); /* 使用原来的颜色 */
}

.card {
  width: min(500px, 90vw);
  margin: -70px auto 40px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44px 40px;
  text-align: center;
  position: relative;
}

.form h2 {
  margin-bottom: 12px;
  font-size: 28px;
  color: #0f172a;
}

.muted {
  color: #475569;
  font-size: 14px;
  margin-bottom: 24px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

/* 小屏幕适配 */
@media (max-width: 600px) {
  .card { 
    width: 90vw; 
    padding: 32px 20px; 
  }
  .form h2 { 
    font-size: 24px; 
  }
  .confirm-btn { 
    position: static; 
    margin-top: 24px; 
  }
}
</style>