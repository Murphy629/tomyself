<!-- src/views/LoginPage.vue -->
<template>
  <div class="login-page">
    <div class="top-strip" aria-hidden="true"></div>

    <div class="card" role="main">
      <!-- left: form (centered) -->
      <section class="form-pane">
        <h1 class="title">Login</h1>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Email -->
          <label class="field">
            <span class="label">Email</span>
            <input
              type="email"
              v-model.trim="form.email"
              placeholder="name@example.com"
              autocomplete="email"
              required
            />
          </label>

          <!-- Password -->
          <label class="field">
            <span class="label">Password</span>
            <div class="password-wrap">
              <input
                :type="showPwd ? 'text' : 'password'"
                v-model="form.password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="toggle"
                @click="showPwd = !showPwd"
                :aria-label="showPwd ? 'Hide password' : 'Show password'"
              >
                <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="currentColor"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M2.1 3.51 3.5 2.1l18.4 18.4-1.41 1.41-3.1-3.1A12.9 12.9 0 0 1 12 19C7 19 2.73 15.89 1 12a14.27 14.27 0 0 1 4.27-5.36L2.1 3.5ZM12 7c5 0 9.27 3.11 11 7a14.2 14.2 0 0 1-3.14 4.22l-2.18-2.18A5.98 5.98 0 0 0 12 8c-.54 0-1.06.07-1.56.2L8.83 6.59A12.8 12.8 0 0 1 12 7Zm0 10a6 6 0 0 0 4.22-1.78l-2.02-2.02A3.99 3.99 0 0 1 8.8 10.8L6.76 8.76A6 6 0 0 0 12 17Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </label>

          <!-- helpers -->
          <div class="helpers">
            <label class="remember">
              <input type="checkbox" v-model="form.remember" />
              <span>Remember me</span>
            </label>
            <a class="link" href="#" @click.prevent>Forgot password?</a>
          </div>

          <!-- submit -->
          <button class="submit" type="submit">
            <span>Log in</span>
          </button>

          <p class="minor">
            Don’t have an account?
            <a class="link" href="#" @click.prevent>Sign up</a>
          </p>
        </form>
      </section>

      <!-- right: carousel (unchanged) -->
      <aside class="promo-pane" aria-label="Product highlights">
        <div
          class="carousel"
          ref="carouselRef"
          @scroll.passive="onScroll"
          tabindex="0"
          role="region"
          aria-roledescription="carousel"
          aria-label="Information slides"
        >
          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 1 of 3`">
            <div class="illust">
              <div class="blob big"></div>
              <div class="blob small"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Check Your Project Progress</h2>
            <p>Leverage simple dashboards to track milestones and performance. Everything you need, in one place.</p>
          </article>

          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 2 of 3`">
            <div class="illust alt">
              <div class="blob big"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Collaborate Effortlessly</h2>
            <p>Invite teammates, assign tasks, and stay aligned with real-time updates across your projects.</p>
          </article>

          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 3 of 3`">
            <div class="illust">
              <div class="blob small"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Visualize Your Data</h2>
            <p>Turn metrics into insights with clean, customizable charts and shareable reports.</p>
          </article>
        </div>

        <div class="pager" role="tablist" aria-label="Select slide">
          <button
            v-for="n in 3"
            :key="n"
            class="dot"
            :class="{ active: activeSlide === (n-1) }"
            role="tab"
            :aria-selected="activeSlide === (n-1)"
            :aria-controls="`slide-${n}`"
            @click="goTo(n - 1)"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  document.title = "Login - BetterInflux";
  computeSlideWidth();
  window.addEventListener('resize', computeSlideWidth);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', computeSlideWidth);
});

const form = reactive({ email: '', password: '', remember: true })
const showPwd = ref(false)
const carouselRef = ref<HTMLDivElement | null>(null)
const activeSlide = ref(0)
let slideWidth = 0

function handleSubmit() {
  alert(`Email: ${form.email}\nPassword: ${form.password}\nRemember: ${form.remember}`)
}

function computeSlideWidth() {
  if (!carouselRef.value) return
  slideWidth = carouselRef.value.clientWidth
  goTo(activeSlide.value, false)
}
function goTo(index: number, smooth = true) {
  if (!carouselRef.value) return
  activeSlide.value = Math.max(0, Math.min(2, index))
  carouselRef.value.scrollTo({ left: activeSlide.value * slideWidth, behavior: smooth ? 'smooth' : 'auto' })
}
function onScroll() {
  if (!carouselRef.value || slideWidth === 0) return
  activeSlide.value = Math.max(0, Math.min(2, Math.round(carouselRef.value.scrollLeft / slideWidth)))
}
</script>

<style scoped>
/* ---- variables & base (unchanged) ---- */
:root {
  --blue: #3b6cff;
  --blue-600: #2f5af0;
  --ink: #0b1020;
  --muted: #667085;
  --line: #eceef3;
  --bg: #f3f6ff;
  --card: #ffffff;
}
* { box-sizing: border-box; }

.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--blue) 0 220px, var(--bg) 220px 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  color: var(--ink);
}
.top-strip { height: 0; }

.card {
  width: min(1040px, 92vw);
  background: var(--card);
  border-radius: 22px;
  box-shadow: 0 18px 50px rgba(16, 24, 40, 0.12);
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border: 1px solid var(--line);
}

/* ---- left pane ---- */
.form-pane {
  padding: 40px 48px;
  display: grid;
  align-content: center;
  justify-items: stretch;
  gap: 18px;
  min-height: 100%;
}
.title { font-size: 28px; line-height: 1.2; margin: 4px 0 8px; font-weight: 700; }
form { display: grid; gap: 14px; }
.field { display: grid; gap: 8px; }
.label { font-size: 13px; color: var(--muted); }

input[type="email"],
.password-wrap > input {
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
  outline: none;
  width: 100%;
  transition: border-color .15s ease, box-shadow .15s ease;
}
input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59,108,255,0.15);
}

/* password eye */
.password-wrap { position: relative; display: grid; }
.password-wrap .toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  height: 28px; width: 28px; border-radius: 8px; border: none;
  background: #f5f7ff; color: #334155; display: grid; place-items: center; cursor: pointer;
}
.password-wrap .toggle:hover { background: #eef2ff; }

/* helpers */
.helpers { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.remember { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #121826; }
.link { font-size: 13px; color: var(--blue); text-decoration: none; }
.link:hover { text-decoration: underline; }

/* ---- SUBMIT button (hardened) ---- */
.form-pane .submit {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 44px;
  margin-top: 6px;

  /* neutralize resets */
  appearance: none;
  -webkit-appearance: none;
  border: 1px solid transparent;
  background-color: var(--blue);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(16,24,40,0.06);
  transition: transform .02s ease, background-color .15s ease, box-shadow .15s ease;
}
.form-pane .submit:hover { background-color: var(--blue-600); box-shadow: 0 3px 10px rgba(16,24,40,0.12); }
.form-pane .submit:active { transform: translateY(1px); }
.form-pane .submit:disabled { opacity: .6; cursor: not-allowed; }

/* minor text */
.minor { margin: 4px 0 0; font-size: 13px; color: var(--muted); }

/* ---- right pane & carousel (unchanged) ---- */
.promo-pane {
  background: #f9fbff;
  border-left: 1px solid var(--line);
  padding: 32px 0 24px;
  display: grid;
  gap: 10px;
  align-content: start;
}

.carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.carousel::-webkit-scrollbar { display: none; }
.slide { flex: 0 0 100%; scroll-snap-align: center; padding: 0 48px; }
.promo-pane h2 { margin-top: 12px; font-size: 20px; }
.promo-pane p { color: #475467; font-size: 14px; line-height: 1.6; }
.illust { position: relative; height: 180px; border-radius: 14px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; overflow: hidden; }
.illust.alt { background: #fcfdff; }
.blob.big { position: absolute; inset: -30% auto auto -20%; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #a9c1ff, #6e8cff); opacity: .4; }
.blob.small { position: absolute; right: -40px; top: -40px; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #ffd28f, #ffb74d); opacity: .55; }
.tile { width: 120px; height: 80px; border-radius: 12px; background: #101828; }
.bar { position: absolute; height: 6px; border-radius: 999px; background: var(--blue); }
.bar.one { width: 70px; bottom: 28px; left: 50%; transform: translateX(-50%); }
.bar.two { width: 40px; bottom: 14px; left: 50%; transform: translateX(-50%); opacity: .6; }

.pager { display: flex; gap: 8px; padding: 0 48px; margin-top: 8px; justify-content: center; }
.dot { width: 10px; height: 10px; border-radius: 999px; border: none; cursor: pointer; background: #d1d5db; transition: background .2s, transform .2s; }
.dot.active { transform: scale(1.3); }

/* responsive */
@media (max-width: 900px) {
  .card { grid-template-columns: 1fr; }
  .promo-pane { border-left: none; border-top: 1px solid var(--line); padding-top: 24px; }
  .slide { padding: 0 24px; }
  .pager { padding: 0 24px; }
}
</style>