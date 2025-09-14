<template>
  <div class="verify-page">
    <h1>❌ Verification Failed</h1>
    <p>The verification link is invalid or expired. Please try signing up again.</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.verify-page {
  text-align: center;
  margin-top: 100px;
  color: red;
}
</style>