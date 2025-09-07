<!-- src/views/SignupPage.vue -->
<template>
  <div class="login-page">
    <div class="top-strip" aria-hidden="true"></div>

    <div class="card" role="main">
      <!-- LEFT: promo (mirrored) -->
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
            <h2>Create Your Account</h2>
            <p>
              Start tracking progress, collaborate with your team, and keep
              your projects on course—everything in one place.
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
            <h2>Invite Teammates</h2>
            <p>
              Share access, assign roles, and get everyone aligned from day one.
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
            <h2>Kick Off Faster</h2>
            <p>
              Use templates and clean dashboards to turn metrics into action.
            </p>
          </article>
        </div>

        <!-- pager controls -->
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

      <!-- RIGHT: form -->
      <section class="form-pane">
        <h1 class="title">Sign up</h1>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Full name -->
          <label class="field">
            <span class="label">Full name</span>
            <input
              type="text"
              v-model.trim="form.name"
              placeholder="Your name"
              autocomplete="name"
              required
            />
          </label>

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
                placeholder="Create a password"
                autocomplete="new-password"
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

          <!-- Confirm Password -->
          <label class="field">
            <span class="label">Confirm password</span>
            <div class="password-wrap">
              <input
                :type="showConfirm ? 'text' : 'password'"
                v-model="form.confirm"
                placeholder="Re-enter your password"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="toggle"
                @click="showConfirm = !showConfirm"
                :aria-label="showConfirm ? 'Hide password' : 'Show password'"
              >
                <svg v-if="!showConfirm" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="currentColor"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M2.1 3.51 3.5 2.1l18.4 18.4-1.41 1.41-3.1-3.1A12.9 12.9 0 0 1 12 19C7 19 2.73 15.89 1 12a14.27 14.27 0 0 1 4.27-5.36L2.1 3.5ZM12 7c5 0 9.27 3.11 11 7a14.2 14.2 0 0 1-3.14 4.22l-2.18-2.18A5.98 5.98 0 0 0 12 8c-.54 0-1.06.07-1.56.2L8.83 6.59A12.8 12.8 0 0 1 12 7Zm0 10a6 6 0 0 0 4.22-1.78l-2.02-2.02A3.99 3.99 0 0 1 8.8 10.8L6.76 8.76A6 6 0 0 0 12 17Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </label>

          <!-- Terms -->
          <label class="remember" style="margin-top:2px;">
            <input type="checkbox" v-model="form.accept" required />
            <span>I agree to the <a href="#" class="link" @click.prevent>Terms</a> &amp; <a href="#" class="link" @click.prevent>Privacy</a></span>
          </label>

          <!-- Submit -->
          <button class="submit" type="submit">Create account</button>

          <p class="minor">
            Already have an account?
            <router-link class="link" to="/login">Login</router-link>
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  document.title = "Sign Up - BetterInflux";
  computeSlideWidth();
  window.addEventListener('resize', computeSlideWidth);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', computeSlideWidth);
});

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  accept: false,
})

const showPwd = ref(false)
const showConfirm = ref(false)

/* Carousel state/logic (same behavior as Login) */
const carouselRef = ref<HTMLDivElement | null>(null)
const activeSlide = ref(0)
let slideWidth = 0

function computeSlideWidth() {
  if (!carouselRef.value) return
  slideWidth = carouselRef.value.clientWidth
  goTo(activeSlide.value, false) // keep slide snapped on resize
}
function goTo(index: number, smooth = true) {
  if (!carouselRef.value) return
  activeSlide.value = Math.max(0, Math.min(2, index))
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'
  carouselRef.value.scrollTo({ left: activeSlide.value * slideWidth, behavior })
}
function onScroll() {
  if (!carouselRef.value || slideWidth === 0) return
  const idx = Math.round(carouselRef.value.scrollLeft / slideWidth)
  activeSlide.value = Math.max(0, Math.min(2, idx))
}

function handleSubmit() {
  if (form.password !== form.confirm) {
    alert('Passwords do not match.')
    return
  }
  if (!form.accept) {
    alert('Please accept the Terms & Privacy.')
    return
  }
  alert(
    `Signed up!\nName: ${form.name}\nEmail: ${form.email}\n(Password length: ${form.password.length})`
  )
}
</script>

<style scoped>
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
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 40%, #06b6d4 100%);
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
  grid-template-columns: 1fr 1fr;  /* promo | form */
  overflow: hidden;
  border: 1px solid var(--line);
}

/* promo (left) */
.promo-pane {
  background: #f9fbff;
  border-right: 1px solid var(--line);
  padding: 32px 0 24px; /* slides have side padding */
  display: grid;
  gap: 10px;
  align-content: start;
}

/* Carousel (same as Login) */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  padding: 0 48px;   /* side padding to match form pane */
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

/* illustration bits */
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
.tile { width: 120px; height: 80px; border-radius: 12px; background: #101828; }
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
  background: #d1d5db;
  transition: background 0.2s, transform 0.2s;
}
.dot.active {
  transform: scale(1.3);
  /* background: #1d4ed8;  */
  /* match login button hue */
}

/* form (right) */
.form-pane {
  background-color: white;
  padding: 40px 48px;
  display: grid;
  align-content: center;
  justify-items: stretch;
  gap: 18px;
}

.title { font-size: 28px; line-height: 1.2; margin: 4px 0 8px; font-weight: 700; }
form { display: grid; gap: 14px; }

.field { display: grid; gap: 8px; }
.label { font-size: 13px; color: var(--muted); }

/* equal-sized inputs */
input[type="text"],
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
.password-wrap { position: relative; display: grid; }
.password-wrap .toggle {
  position: absolute;
  right: 8px; top: 50%; transform: translateY(-50%);
  height: 28px; width: 28px;
  border-radius: 8px; border: none;
  background: #f5f7ff; color: #334155;
  display: grid; place-items: center;
  cursor: pointer;
}
.password-wrap .toggle:hover { background: #eef2ff; }

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #121826;
}

/* links */
.link { font-size: 13px; color: var(--blue); text-decoration: none; }
.link:hover { text-decoration: underline; }

/* submit button (hard-coded color; no CSS vars) */
.submit {
  margin-top: 6px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #1d4ed8;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: transform .02s ease, background .15s ease;
}
.submit:active { transform: translateY(1px); }
.submit:hover { background: #2563eb; }

/* responsive: on mobile stack; keep promo visible like Login */
@media (max-width: 900px) {
  .card { grid-template-columns: 1fr; }
  .promo-pane {
    border-right: none;
    border-top: 1px solid var(--line);
    padding-top: 24px;
  }
  .slide { padding: 0 24px; }
  .pager { padding: 0 24px; }
}
</style>