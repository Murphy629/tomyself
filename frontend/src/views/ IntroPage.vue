<template>
  <div class="intro">
    <!-- Header / Top Nav -->
    <MenuBar></MenuBar>

    <!-- HERO -->
    <section class="hero">
      <div class="container grid hero-grid">
        <div class="hero-copy">
          <h1>Query time‑series data without code.</h1>
          <p>
            Build trends by clicking, dragging, and dropping. Generate Flux automatically, preview instantly, and save panels to Grafana — all on a single page.
          </p>
          <div class="cta row">
            <RouterLink class="btn" to="/app">Open App</RouterLink>
            <a class="btn ghost" href="#demo">View Demo</a>
          </div>

          <ul class="hero-bullets">
            <li>Visual query builder for InfluxDB</li>
            <li>Auto‑generated Flux with optional code view</li>
            <li>One‑click export to Grafana dashboards</li>
          </ul>
        </div>

        <div class="hero-card">
          <div class="card">
            <div class="card-head row between center">
              <strong>Live Trend</strong>
              <span class="pill">Preview</span>
            </div>
            <div class="mini-chart" aria-hidden="true">
              <svg viewBox="0 0 300 120" preserveAspectRatio="none">
                <polyline fill="none" stroke="currentColor" stroke-width="2" points="0,100 20,95 40,85 60,88 80,70 100,72 120,55 140,58 160,45 180,60 200,48 220,65 240,52 260,70 280,60 300,75"/>
              </svg>
            </div>
            <div class="card-foot row between center">
              <span class="muted">bucket: prod/iot</span>
              <span class="muted">field: temperature</span>
            </div>
          </div>
        </div>
      </div>

      <div class="partners container row wrap center muted logos">
        <span>Integrates with</span>
        <img alt="InfluxDB" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='20'%3E%3Ctext x='0' y='15' font-size='14' font-family='Arial'%3EInfluxDB%3C/text%3E%3C/svg%3E"/>
        <img alt="Grafana"  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='20'%3E%3Ctext x='0' y='15' font-size='14' font-family='Arial'%3EGrafana%3C/text%3E%3C/svg%3E"/>
      </div>
    </section>

    <!-- Feature tiles -->
    <section id="features" class="features container grid three">
      <article class="tile">
        <div class="icon">⬈</div>
        <h3>Visual Query Builder</h3>
        <p>Pick bucket, measurement, and fields with clicks or drag‑and‑drop. Add filters and a time‑range picker with ease.</p>
      </article>
      <article class="tile">
        <div class="icon">{ }</div>
        <h3>Automatic Code</h3>
        <p>Flux query is generated behind the scenes — reveal it anytime, edit inline, and keep the preview in sync.</p>
      </article>
      <article class="tile">
        <div class="icon">★</div>
        <h3>Grafana Integration</h3>
        <p>Save current trends as Grafana panels/dashboards, then continue editing in Grafana if needed.</p>
      </article>
      <article class="tile">
        <div class="icon">#</div>
        <h3>Custom Tag Hierarchy</h3>
        <p>Organise tags beyond buckets/measurements with aliases and your own logical tree.</p>
      </article>
      <article class="tile">
        <div class="icon">🔐</div>
        <h3>Auth & Permissions</h3>
        <p>Login with your existing InfluxDB credentials and keep the same level of access.</p>
      </article>
      <article class="tile">
        <div class="icon">API</div>
        <h3>Fast APIs</h3>
        <p>Programmatic access to the same queries — optimised for speed and large data scans.</p>
      </article>
    </section>

    <!-- Why prefer -->
    <section id="how-it-works" class="why container grid two">
      <div class="panel">
        <h4>Instant trends</h4>
        <p>Create a trend immediately after selecting fields. No code required. Toggle to Flux view anytime.</p>
      </div>
      <div class="panel">
        <h4>Export to Grafana</h4>
        <p>Turn your preview into a saved Grafana panel with one click. Keep the Flux and panel config linked.</p>
      </div>
      <div class="panel">
        <h4>No asset volatility</h4>
        <p>Stable results and reproducible queries for audits and hand‑offs.</p>
      </div>
      <div class="panel">
        <h4>Withdraw anytime</h4>
        <p>Switch between visual and code editing seamlessly without losing state.</p>
      </div>
    </section>

    <!-- Dark CTA strip -->
    <section class="cta-strip">
      <div class="container">
        <h2>Maximize your insights with a Reserve dashboard.</h2>
        <p>Open a workspace, connect InfluxDB & Grafana, and watch your balance of knowledge grow.</p>
        <div class="row">
          <RouterLink class="btn inverted" to="/signup">Create workspace</RouterLink>
          <a class="btn ghost-inverted" href="#docs">Read docs</a>
        </div>
      </div>
    </section>

    <!-- Plans -->
    <section id="plans" class="plans container grid two">
      <div class="plan">
        <h3>Plus</h3>
        <p class="price">Free</p>
        <ul>
          <li>Visual builder & preview</li>
          <li>Export single panel to Grafana</li>
          <li>Local workspace</li>
        </ul>
        <RouterLink class="btn ghost" to="/signup">Start Free</RouterLink>
      </div>
      <div class="plan highlighted">
        <h3>Premium</h3>
        <p class="price">Team</p>
        <ul>
          <li>Shared workspaces</li>
          <li>Panel ↔ Flux live sync</li>
          <li>APIs & caching optimisations</li>
        </ul>
        <RouterLink class="btn" to="/contact">Talk to us</RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container grid three">
        <div>
          <div class="brand row center">
            <div class="logo">BI</div>
            <div class="name">BetterInflux</div>
          </div>
          <p class="muted small">© {{ new Date().getFullYear() }} BetterInflux. All rights reserved.</p>
        </div>
        <div>
          <h4>Solutions</h4>
          <ul class="list">
            <li><a href="#">No‑code querying</a></li>
            <li><a href="#">Grafana sync</a></li>
            <li><a href="#">APIs</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul class="list">
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/contact">Contact</RouterLink></li>
            <li><a href="#docs">Docs</a></li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// purely presentational
import { onMounted } from 'vue'
import MenuBar from '../components/MenuBar.vue'
onMounted(() => {
  document.title = 'BetterInflux - Intro'
})

</script>

<style scoped>
:root { --bg:#f4f7f8; --card:#ffffff; --ink:#0c1a1f; --muted:#5a6b73; --brand:#0b7cff; --brand-ink:#0a2230; --border:#e6ecef; --dark:#0b2a34; }
* { box-sizing: border-box; }
.intro { background: var(--bg); color: var(--ink); }
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.row { display:flex; gap:12px; }
.row.center { align-items:center; }
.row.between { justify-content: space-between; }
.row.wrap { flex-wrap: wrap; }
.grid { display:grid; gap: 20px; }
.grid.two { grid-template-columns: repeat(2, minmax(0,1fr)); }
.grid.three { grid-template-columns: repeat(3, minmax(0,1fr)); }
@media (max-width: 900px){ .grid.two, .grid.three { grid-template-columns: 1fr; } }

.topbar { background: transparent; position: sticky; top: 0; z-index: 5; backdrop-filter: blur(6px); }
.brand .logo { width:32px; height:32px; border-radius:8px; background: var(--brand); color:#fff; display:grid; place-items:center; font-weight:700; }
.brand .name { margin-left:8px; font-weight:700; }
.nav a { margin-left:16px; text-decoration:none; color: var(--ink); }
.nav .btn { margin-left: 16px; }

.btn { padding: 10px 14px; border-radius: 10px; background: var(--brand); color:#fff; text-decoration:none; font-weight:600; border:1px solid var(--brand); display:inline-block; }
.btn.ghost { background: transparent; color: var(--brand); border-color: var(--border); }
.btn.inverted { background:#fff; color: var(--dark); border-color:#fff; }
.btn.ghost-inverted { background: transparent; color:#fff; border-color: rgba(255,255,255,.25); }

.muted { color: var(--muted); }
.small { font-size: 12px; }
.pill { background:#e8f1ff; color:#2b5fe8; padding:4px 8px; border-radius:999px; font-size:12px; }

/* HERO */
.hero { padding: 56px 0 24px; position: relative; }
.hero::before{ content:""; position:absolute; inset:0; background: radial-gradient(600px 200px at right top, rgba(11,124,255,.08), transparent 60%); pointer-events:none; }
.hero-grid { grid-template-columns: 1.1fr .9fr; align-items:center; }
.hero-copy h1 { font-size: 44px; line-height: 1.1; margin: 0 0 12px; }
.hero-copy p { color: var(--muted); font-size: 18px; }
.hero-bullets { margin:16px 0 0; padding:0; list-style:none; color: var(--muted); }
.hero-bullets li { padding-left: 18px; position: relative; margin: 6px 0; }
.hero-bullets li::before{ content:"•"; position:absolute; left:0; color: var(--brand); }

.hero-card .card { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.05); }
.card-head { margin-bottom: 6px; }
.mini-chart { color:#2b5fe8; height: 140px; background: linear-gradient(#f9fbff,#fff); border-radius: 12px; display:grid; place-items:center; }
.mini-chart svg { width: 100%; height: 100%; opacity:.9; }
.card-foot { margin-top: 10px; }

.partners.logos { gap: 18px; font-size: 14px; margin-top: 20px; }
.partners img { height: 18px; opacity: .7; }

/* TILES */
.features { padding: 36px 0; }
.tile { background: var(--card); border:1px solid var(--border); border-radius: 14px; padding: 18px; }
.tile .icon { width: 36px; height:36px; border-radius: 10px; background: #eef5ff; display:grid; place-items:center; color:#2b5fe8; margin-bottom: 8px; font-weight:700; }
.tile h3 { margin: 6px 0 6px; }
.tile p { color: var(--muted); }

/* WHY */
.why { padding: 10px 0 36px; }
.panel { background: var(--card); border:1px solid var(--border); border-radius: 14px; padding: 18px; }
.panel h4 { margin: 0 0 6px; }
.panel p { color: var(--muted); }

/* CTA STRIP */
.cta-strip { background: var(--dark); color:#cfe6f2; padding: 48px 0; margin: 20px 0 30px; }
.cta-strip h2 { color:#fff; margin:0 0 6px; }
.cta-strip p { margin:0 0 14px; }

/* PLANS */
.plans { padding: 10px 0 40px; }
.plan { background: var(--card); border:1px solid var(--border); border-radius: 16px; padding: 20px; }
.plan.highlighted { border-color:#bcd8ff; box-shadow: 0 12px 24px rgba(11,124,255,.12); }
.plan .price { font-size: 28px; margin: 4px 0 10px; }
.plan ul { margin:0 0 12px; padding:0 0 0 16px; color: var(--muted); }

/* FOOTER */
.footer { border-top:1px solid var(--border); padding: 28px 0 40px; background: #f7fafb; }
.list { list-style:none; padding:0; margin: 8px 0 0; }
.list li { margin: 6px 0; }
.list a { color: var(--ink); text-decoration:none; }
</style>
