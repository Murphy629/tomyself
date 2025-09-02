<template>
  <nav class="menu-bar">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/services">Services</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "MenuBar"
}
</script>

<style scoped>
.menu-bar {
  background-color: #333;
  padding: 0.5rem 1rem;
}
.menu-bar ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}
.menu-bar a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}
.menu-bar a:hover {
  text-decoration: underline;
}
</style>