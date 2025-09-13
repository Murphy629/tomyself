<template>
  <MenuBar />
  <div class="login-page">
    <!-- top blue strip -->
    <div class="top-strip" aria-hidden="true"></div>

    <!-- card -->
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

          <!-- Password (with eye toggle inside) -->
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
                <!-- eye icon -->
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
          <button class="submit" type="submit">Login</button>

          <p class="minor">
            Don’t have an account?
            <router-link class="link" to="/signup">Sign up</router-link>
          </p>
        </form>
      </section>

      <!-- right: swipeable info carousel -->
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
          <!-- Slide 1 -->
          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 1 of 3`">
            <div class="illust">
              <div class="blob big"></div>
              <div class="blob small"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Check Your Project Progress</h2>
            <p>
              Leverage simple dashboards to track milestones and performance.
              Everything you need, in one place.
            </p>
          </article>

          <!-- Slide 2 -->
          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 2 of 3`">
            <div class="illust alt">
              <div class="blob big"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Collaborate Effortlessly</h2>
            <p>
              Invite teammates, assign tasks, and stay aligned with real-time updates
              across your projects.
            </p>
          </article>

          <!-- Slide 3 -->
          <article class="slide" aria-roledescription="slide" :aria-label="`Slide 3 of 3`">
            <div class="illust">
              <div class="blob small"></div>
              <div class="tile"></div>
              <div class="bar one"></div>
              <div class="bar two"></div>
            </div>
            <h2>Visualize Your Data</h2>
            <p>
              Turn metrics into insights with clean, customizable charts and
              shareable reports.
            </p>
          </article>
        </div>

        <!-- Controls -->
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
import MenuBar from '../components/MenuBar.vue';

onMounted(() => {
  document.title = "Login - BetterInflux";
  // Ensure we compute once mounted
  computeSlideWidth();
  window.addEventListener('resize', computeSlideWidth);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', computeSlideWidth);
});

const form = reactive({
  email: '',
  password: '',
  remember: true,
})

const showPwd = ref(false)
const carouselRef = ref<HTMLDivElement | null>(null)
const activeSlide = ref(0)
let slideWidth = 0

function handleSubmit() {
  alert(`Email: ${form.email}\nPassword: ${form.password}\nRemember: ${form.remember}`)
}

function computeSlideWidth() {
  if (!carouselRef.value) return
  // Each slide is 100% of the visible width
  slideWidth = carouselRef.value.clientWidth
  // Snap to current slide on resize to avoid partial offsets
  goTo(activeSlide.value, false)
}

function goTo(index: number, smooth = true) {
  if (!carouselRef.value) return
  activeSlide.value = Math.max(0, Math.min(2, index))
  const behavior = smooth ? 'smooth' : 'auto'
  carouselRef.value.scrollTo({ left: activeSlide.value * slideWidth, behavior })
}

function onScroll() {
  if (!carouselRef.value || slideWidth === 0) return
  const idx = Math.round(carouselRef.value.scrollLeft / slideWidth)
  activeSlide.value = Math.max(0, Math.min(2, idx))
}
</script>

<style scoped>
/* base */
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
  /* ✨ updated gradient background */
  background: linear-gradient(135deg, #5b54eb 0%, #f6b23b 0%, #43bfd4 100%);
  display: flex;
  justify-content: center;     /* center horizontally */
  align-items: center;         /* center vertically */
  padding: 24px;               /* small breathing room around */
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  color: var(--ink);
}

.top-strip { height: 0; } /* visual handled by body gradient */

.card {
  width: min(1040px, 92vw);
  background: var(--card);
  border-radius: 22px;
  box-shadow: 0 18px 50px rgba(16, 24, 40, 0.12);
  display: grid;
  grid-template-columns: 1fr 1fr;  /* two columns on desktop */
  overflow: hidden;
  border: 1px solid var(--line);
}

/* left form pane: vertically centered content */
.form-pane {
  background-color: white;
  padding: 40px 48px;
  display: grid;
  align-content: center;          /* <-- vertical centering of the whole form area */
  justify-items: stretch;
  gap: 18px;
  min-height: 100%;               /* ensure the column can center within available height */
}

.title {
  font-size: 28px;
  line-height: 1.2;
  margin: 4px 0 8px;
  font-weight: 700;
}

form { display: grid; gap: 14px; }

.field {
  display: grid;
  gap: 8px;
}

.label {
  font-size: 13px;
  color: var(--muted);
}

/* equal-sized inputs */
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

/* password with eye inside */
.password-wrap {
  position: relative;
  display: grid;
}

.password-wrap .toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 28px;
  width: 28px;
  border-radius: 8px;
  border: none;
  background: #f5f7ff;
  color: #334155;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.password-wrap .toggle:hover { background: #eef2ff; }

/* helpers */
.helpers {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #121826;
}

.link {
  font-size: 13px;
  color: var(--blue);
  text-decoration: none;
}
.link:hover { text-decoration: underline; }

.submit {
  margin-top: 6px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #1d4ed8; /* nice deep blue */
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: transform .02s ease, background .15s ease;
}

.submit:active {
  transform: translateY(1px);
}

.submit:hover {
  background: #2563eb; /* brighter blue on hover */
}


.minor {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

/* right promo pane */
.promo-pane {
  background: #f9fbff;
  border-left: 1px solid var(--line);
  padding: 32px 0 24px;  /* inner slides have their own side padding */
  display: grid;
  gap: 10px;
  align-content: start;
}

/* Carousel */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;     /* enables swipe + snap */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;              /* Firefox hide scrollbar */
}
.carousel::-webkit-scrollbar { display: none; } /* WebKit hide scrollbar */

.slide {
  flex: 0 0 100%;                     /* each slide is full width of the pane */
  scroll-snap-align: center;
  padding: 0 48px;                    /* side padding to match form pane */
}

.promo-pane h2 {
  margin-top: 12px;
  font-size: 20px;
}

.promo-pane p {
  color: #475467;
  font-size: 14px;
  line-height: 1.6;
}

/* simple illustration */
.illust {
  position: relative;
  height: 180px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.illust.alt { background: #fcfdff; }

.blob.big {
  position: absolute; inset: -30% auto auto -20%;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #a9c1ff, #6e8cff);
  opacity: .4;
}
.blob.small {
  position: absolute; right: -40px; top: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #ffd28f, #ffb74d);
  opacity: .55;
}
.tile {
  width: 120px; height: 80px; border-radius: 12px;
  background: #101828;
}
.bar { position: absolute; height: 6px; border-radius: 999px; background: var(--blue); }
.bar.one { width: 70px; bottom: 28px; left: 50%; transform: translateX(-50%); }
.bar.two { width: 40px; bottom: 14px; left: 50%; transform: translateX(-50%); opacity: .6; }

.pager {
  display: flex;
  gap: 8px;
  padding: 0 48px;
  margin-top: 8px;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #d1d5db;       /* inactive: medium gray */
  transition: background 0.2s, transform 0.2s;
}

.dot.active {
  transform: scale(1.3);     /* makes active dot visually pop */
}

/* responsive: on mobile the info section stacks below the login section */
@media (max-width: 900px) {
  .card { grid-template-columns: 1fr; }
  .promo-pane {
    border-left: none;
    border-top: 1px solid var(--line);
    padding-top: 24px;
  }
  .slide { padding: 0 24px; }      /* reduce side padding on small screens */
  .pager { padding: 0 24px; }
}

/* =========================
   Dark Mode (global `.dark`)
   ========================= */
.dark .login-page {
  /* deep, calm gradient for dark surface */
  background: linear-gradient(135deg, #391a78 0%, #af5e20 0%, #0f4170 100%);
  color: #e5e7eb;
}

.dark .card {
  background: #0f172a;
  border-color: #1f2937;
  box-shadow: 0 18px 50px rgba(0,0,0,0.45);
}

.dark .form-pane {
  background-color: #070a0f;
}

.dark .title {
  color: #e5e7eb;
}

.dark .label {
  color: #9ca3af;
}

.dark input[type="email"],
.dark .password-wrap > input {
  background: #0b1220;
  color: #e5e7eb;
  border-color: #1f2937;
}

.dark input::placeholder,
.dark .password-wrap > input::placeholder {
  color: #94a3b8; /* slate-400 */
}

.dark input:focus,
.dark .password-wrap > input:focus {
  border-color: #60a5fa; /* blue-400 */
  box-shadow: 0 0 0 3px rgba(96,165,250,0.25);
  outline: none;
}

.dark .password-wrap .toggle {
  background: #111827;
  color: #cbd5e1;
}

.dark .password-wrap .toggle:hover {
  background: #1f2937;
}

.dark .helpers .remember {
  color: #e5e7eb;
}

.dark .link {
  color: #60a5fa;
}

.dark .submit {
  background: #2563eb; /* blue-600 */
  color: #e5e7eb;
}
.dark .submit:hover {
  background: #1d4ed8; /* blue-700 */
}

.dark .minor {
  color: #9ca3af;
}

/* Right promo pane */
.dark .promo-pane {
  background: #0b1220;
  border-left-color: #1f2937;
}

.dark .promo-pane h2 {
  color: #e5e7eb;
}

.dark .promo-pane p {
  color: #cbd5e1;
}

.dark .illust {
  background: #0f172a;
  border-color: #1f2937;
}

.dark .tile {
  background: #111827;
}

.dark .bar { background: #60a5fa; } /* keep nice contrast in dark */

/* Carousel dots */
.dark .dot {
  background: #334155; /* slate-600 */
}
.dark .dot.active {
  background: #60a5fa; /* blue-400 to indicate active */
}
</style>