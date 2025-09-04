<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink to="/" class="brand">BetterInflux</RouterLink>
      <nav class="nav">
       <RouterLink to="/login" class="btn-login">Log in</RouterLink>
       <RouterLink to="/signup" class="btn-signup">Sign up</RouterLink>
      </nav>
    </header>

    <!-- 路由页面渲染区：主页 / 注册页等都会渲染到这里 -->
    <main class="site-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
// 根组件不再直接渲染具体页面，只提供外壳
</script>

<style scoped>
.site-header{
  position: sticky; top: 0; z-index: 10;
  height: 56px; padding: 0 20px;
  display:flex; align-items:center; justify-content:space-between;
  background:#ffffffcc; backdrop-filter: blur(6px);
  border-bottom:1px solid #eef2f7;
}
.brand{ font-weight:700; color:#0f172a; text-decoration:none; }
.nav{ display:flex; align-items:center; gap:10px; }
.btn-signup{
  height:36px; padding:0 14px; border-radius:999px;
  background:#5aa8ff; color:#fff; text-decoration:none; font-weight:600;
}
.btn-signup:hover{ filter:brightness(1.05); }
.btn-login, .btn-signup {
  height:36px; padding:0 14px; border-radius:999px;
  text-decoration:none; font-weight:600;
  display:flex; align-items:center; justify-content:center;
}

.btn-login {
  background:#e2e8f0; color:#0f172a;
}
.btn-login:hover { filter:brightness(0.95); }

.btn-signup {
  background:#5aa8ff; color:#fff;
}
.btn-signup:hover { filter:brightness(1.05); }

.site-main{ min-height: calc(100vh - 56px); }
</style>
