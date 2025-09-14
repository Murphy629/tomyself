<template>
  <div class="verify-page">
    <h1>✅ Email Verified</h1>
    <p>Your account has been successfully verified. Redirecting to home...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  // 2秒后跳到首页
  setTimeout(() => {
    router.push("/");
  }, 2000);
});
</script>

<style scoped>
.verify-page {
  text-align: center;
  margin-top: 100px;
}
</style>