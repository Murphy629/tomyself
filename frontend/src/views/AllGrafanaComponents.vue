<template>
  <div class="page">
    <h1 class="title">All Grafana Components</h1>

    <!-- Show login form if user is not logged in -->
    <div v-if="!loggedIn" class="login-container">
      <h2>Log in</h2>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />

        <input v-if="mfaEnabled" type="text" v-model="mfaCode" placeholder="MFA Verification Code" />

        <select v-model="role">
          <option value="general">Ordinary users</option>
          <option value="advanced">Advanced Users</option>
          <option value="dev">Developers</option>
        </select>

        <button type="submit">{{ loading ? "Logging in..." : "Log in" }}</button>
      </form>

      <p>Don't have an account yet? <a href="#">Go to register</a></p>
    </div>

    <!-- Show Grafana components if logged in -->
    <div v-else class="grafana-wrapper">
      <div>
        <p>Grafana Component - 01</p>
        <GrafanaComponentTest />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GrafanaComponentTest from '../components/GrafanaComponentTest.vue'

// Login state
const loggedIn = ref(false)
const email = ref('')
const password = ref('')
const mfaCode = ref('')
const role = ref('general')
const error = ref('')
const loading = ref(false)
const mfaEnabled = ref(true)

// Handle login
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        mfa: mfaEnabled.value ? mfaCode.value : null,
        role: role.value,
      }),
    })
    const data = await res.json()
    if (data.status === 'success' || data.reqStatus === 'success') {
      loggedIn.value = true
    } else {
      error.value = data.message || 'Login failed'
    }
  } catch (err) {
    error.value = 'Server connection failed. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}

.title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.grafana-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  min-height: 500px;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: "Segoe UI", Tahoma, sans-serif;
}

.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #fff;
}

.login-container input,
.login-container select,
.login-container button {
  width: 100%;
  box-sizing: border-box; 
  padding: 10px;
  margin: 8px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
}


button {
  background: #000000ff;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 10px;
}
</style>
