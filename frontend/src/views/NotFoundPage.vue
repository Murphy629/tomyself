

<template>
  <div class="notfound">
    <h1>404</h1>
    <p>Oops! The page you are looking for doesn't exist.</p>
    <RouterLink class="btn" to="/">Go Home</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.notfound {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
}

h1 {
  font-size: 6rem;
  font-weight: 800;
  color: #3b82f6;
  margin: 0;
}

p {
  font-size: 1.2rem;
  margin: 16px 0;
  color: #1e293b;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: #2563eb;
}
</style>