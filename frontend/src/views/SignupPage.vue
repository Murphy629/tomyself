<!-- src/views/SignupView.vue -->
<template>
  <div class="signup-page">
    <!-- Background top bar (light blue) -->
    <div class="top-strip"></div>

    <div class="card">
      <!-- Left visual area -->
      <section class="visual">
        <div class="illus">
          <!-- Placeholder illustration: can be replaced with your own image -->
          <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#8ec5ff"/>
                <stop offset="1" stop-color="#cfe7ff"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="300" height="220" rx="16" fill="url(#g1)"/>
            <g opacity="0.9">
              <rect x="28" y="28" width="110" height="70" rx="8" fill="white"/>
              <rect x="48" y="45" width="70" height="12" rx="6" fill="#e7f1ff"/>
              <rect x="48" y="65" width="46" height="10" rx="5" fill="#d2e7ff"/>
              <rect x="168" y="28" width="110" height="70" rx="8" fill="white"/>
              <circle cx="194" cy="63" r="20" fill="#d9ecff"/>
              <rect x="168" y="110" width="110" height="70" rx="8" fill="white"/>
              <rect x="184" y="130" width="78" height="12" rx="6" fill="#e7f1ff"/>
              <rect x="184" y="150" width="52" height="10" rx="5" fill="#d2e7ff"/>
            </g>
          </svg>
        </div>
        <div class="copy">
          <h3>Check Your Project Progress</h3>
          <p>Create an account to build queries, organize data, and view beautiful trend charts.</p>
          <div class="divider">
            <span></span><span></span>
          </div>
        </div>
      </section>

      <!-- Right-side registration form (Note: Contrary to the reference visual, we placed it on the right) -->
      <section class="form">
        <h2>Sign up</h2>

        <form @submit.prevent="onSubmit">
          <label>
            <span>Email</span>
            <input
              type="email"
              v-model.trim="form.email"
              placeholder="name@example.com"
              autocomplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <div class="password">
              <input
                :type="showPwd ? 'text' : 'password'"
                v-model="form.password"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                minlength="8"
                required
              />
              <button type="button" class="toggle" @click="showPwd = !showPwd" aria-label="toggle password">
                {{ showPwd ? '🙈' : '👁️' }}
              </button>
            </div>
          </label>

          <label>
            <span>Confirm password</span>
            <input
              :type="showPwd ? 'text' : 'password'"
              v-model="form.confirm"
              placeholder="Repeat your password"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </label>

          <label>
            <span>Name <i class="muted">(optional)</i></span>
            <input
              type="text"
              v-model.trim="form.name"
              placeholder="Your display name"
              autocomplete="name"
            />
          </label>

          <label class="remember">
            <input type="checkbox" v-model="form.remember" />
            <span>Remember me</span>
          </label>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="primary" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create account' }}
          </button>

          <p class="muted small">
            Already have an account?
            <RouterLink to="/login">Log in</RouterLink>
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
onMounted(() => {
  document.title = 'BetterInflux - Signup'
})

const router = useRouter()
const form = reactive({
  email: '',
  password: '',
  confirm: '',
  name: '',
  remember: true,
})
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')

// Simple front-end verification + simulated submission; you can change it to actual API：POST /auth/signup
async function onSubmit() {
  error.value = ''
  // Basic verification
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  if (!emailOk) {
    error.value = 'Please enter a valid email.'
    return
  }
  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (form.password !== form.confirm) {
    error.value = 'Passwords do not match.'
    return
  }

  
  try {
    loading.value = true
    // eg：
    // const res = await fetch('/api/auth/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form),
    // })
    // if (!res.ok) throw new Error(await res.text())

    // Demo：Fake it and make it
    await new Promise(r => setTimeout(r, 800))

    // Jump to the login page after success
    router.push('/login')
  } catch (e) {
    error.value = e?.message || 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root {
  --blue-50: #f3f8ff;
  --blue-100: #e6f1ff;
  --blue-200: #d2e7ff;
  --blue-300: #b7d8ff;
  --blue-400: #8ec5ff;
  --blue-500: #5aa8ff; 
  --text-900: #0f172a;
  --text-600: #475569;
  --muted: #94a3b8;
  --card-bg: #ffffff;
}

.signup-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--blue-100), #f8fbff 40%, #f6f8fc);
  display: flex;
  flex-direction: column;
}

.top-strip {
  height: 120px;
  background: var(--blue-400);
}

.card {
  width: min(1100px, 92vw);
  margin: -70px auto 40px;
  background: var(--card-bg);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.12);
  display: grid;
  grid-template-columns: 1fr 1fr; 
  overflow: hidden;
}

.visual {
  padding: 44px 40px;
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--blue-100);
}

.illus {
  display: grid;
  place-items: center;
}

.illus svg {
  max-width: 90%;
  height: auto;
}

.copy {
  text-align: left;
  margin-top: 18px;
}

.copy h3 {
  margin: 0 0 8px;
  font-weight: 700;
  color: var(--text-900);
}

.copy p {
  color: var(--text-600);
  line-height: 1.6;
}

.divider { display: flex; gap: 8px; margin-top: 14px; }
.divider span {
  height: 4px; width: 36px; border-radius: 4px;
  background: var(--blue-300);
}
.divider span:last-child { width: 22px; background: var(--blue-200); }

.form {
  padding: 44px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form h2 {
  margin: 0 0 18px;
  font-size: 28px;
}

form { display: grid; gap: 14px; }

label { display: grid; gap: 8px; }

label > span { font-size: 14px; color: var(--text-600); }

input[type="text"],
input[type="email"],
input[type="password"] {
  height: 44px;
  padding: 0 12px;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  outline: none;
  background: #fff;
  transition: box-shadow .2s, border-color .2s;
}
input:focus {
  border-color: var(--blue-300);
  box-shadow: 0 0 0 4px rgba(90, 168, 255, .15);
}

.password { position: relative; }
.password .toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  height: 28px; padding: 0 8px;
  background: transparent; border: 0; cursor: pointer; font-size: 16px;
}

.remember { display: flex; align-items: center; gap: 8px; margin-top: 2px; }

.primary {
  margin-top: 6px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: var(--blue-500);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform .02s, filter .15s;
}
.primary:disabled { opacity: .6; cursor: not-allowed; }
.primary:active { transform: translateY(1px); }
.primary:hover { filter: brightness(1.03); }

.error {
  margin: 2px 0 0;
  color: #b91c1c;
  font-size: 13px;
}

.muted { color: var(--muted); }
.small { font-size: 13px; }

@media (max-width: 980px) {
  .card { grid-template-columns: 1fr; }
  .visual { display: none; } 
}
</style>
