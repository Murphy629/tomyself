<template>
  <div class="card">
    <p class="label">Organization you currently have</p>
    <p class="count">100</p>
  </div>
</template>

<style scoped>
.card {
  width: 180px;
  height: 180px;
  position: relative;
  background: #4cc3f7;
  border-radius: 6px;
  box-shadow: 12px 12px 0px #622bfa;
  padding: 20px;
}

.label {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #000;
}

.count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  font-weight: 800;
  color: #ffcf33;
  margin: 0;
}
</style>