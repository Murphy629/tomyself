<template>
  <nav class="menu-bar">
    <div class="menu-container">
      <div class="logo">BetterInflux</div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/about">About</a></li>
        <!-- <li><a href="/contact">Contact</a></li> -->
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: "MenuBar"
}
</script>

<style scoped>
/* overall bar */
.menu-bar {
  width: 100%;
  background-color: #222;            /* darker background */
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
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
  color: #fff;
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
  color: #eee;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease, border-bottom 0.2s ease;
  padding-bottom: 0.2rem;
  border-bottom: 2px solid transparent;
}

.menu-bar a:hover {
  color: #fff;
  border-bottom: 2px solid #1976d2;  /* highlight underline */
}
</style>