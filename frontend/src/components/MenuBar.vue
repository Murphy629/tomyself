<template>
  <nav class="menu-bar">
    <div class="menu-container">
      <div class="logo">
        <router-link to="/">BetterInflux</router-link>
      </div>
      <ul>
        <li><ThemeSwitchMini /></li>
        <!-- <li><router-link to="/">Home</router-link></li> -->
        <!-- <li><router-link to="/services">Services</router-link></li> -->
        <!-- <li><router-link to="/about">About</router-link></li> -->
        <!-- <li><router-link to="/login">Login</router-link></li> -->
        <!-- <li><router-link to="/signup">Signup</router-link></li> -->
      </ul>
    </div>
  </nav>
</template>

<script setup>
import ThemeSwitchMini from './ThemeSwitchMini.vue';

</script>

<style scoped>
/* overall bar */
.menu-bar {
  width: 100%;
  background-color: #ffffff;         /* light background */
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color .2s ease, box-shadow .2s ease;
}

/* inner wrapper to control spacing */
.menu-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* brand/logo */
.logo {
  color: #0b1020;                    /* dark ink */
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
}

/* nav list */
.menu-bar ul {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

/* nav items */
.menu-bar li {
  margin-left: 2rem;
}

/* nav links */
.menu-bar a {
  color: #334155;                    /* slate-700 */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease, border-bottom 0.2s ease;
  padding-bottom: 0.2rem;
  border-bottom: 2px solid transparent;
}

.menu-bar a:hover {
  color: #0b1020;
  border-bottom: 2px solid #1d4ed8;  /* blue-700 underline */
}

/* =========================
   Dark Mode (global `.dark`)
   ========================= */
.dark .menu-bar {
  background-color: #111827;      /* slate-900 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
}
.dark .logo {
  color: #e5e7eb;
}
.dark .menu-bar a {
  color: #f4f4f4;                 /* slate-300 */
}
.dark .menu-bar a:hover {
  color: #ffffff;
  border-bottom: 2px solid #60a5fa; /* blue-400 underline */
}
</style>