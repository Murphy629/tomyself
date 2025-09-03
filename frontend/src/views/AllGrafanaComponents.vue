<template>
  <div class="page">
    <h1 class="title">All Grafana Components</h1>
    <div class="grafana-wrapper">
        <div>
            
            <hr class="sep" />
            <p>Grafana Component - 01 (Bar Chart)</p>
            <PanelBarChart />

            <p>Grafana Component - 02 (Stat)</p>
            <PanelStat />

            <p>Grafana Component - 03 (Time Series)</p>
            <PanelTimeSeries />

            <p>Grafana Component - 04 (Bar Gauge)</p>
            <PanelBarGauge />

            <p>Grafana Component - 05 (Table)</p>
            <PanelTable />

            <p>Grafana Component - 06 (Pie Chart)</p>
            <PanelPieChart />

            

        </div>

    </div>
  </div>
</template>

<script setup>
//import GrafanaComponentTest from '../components/GrafanaComponentTest.vue'
import PanelBarChart from '../components/panels/PanelBarChart.vue'
import PanelStat from '../components/panels/PanelStat.vue'
import PanelTimeSeries from '../components/panels/PanelTimeSeries.vue'
import PanelBarGauge from '../components/panels/PanelBarGauge.vue'
import PanelTable from '../components/panels/PanelTable.vue'
import PanelPieChart from '../components/panels/PanelPieChart.vue'
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;   /* center heading + wrapper */
  padding: 2rem 1rem;
}

.title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.grafana-wrapper {
  display: flex;                  /* enables flexbox */
  justify-content: center;        /* center horizontally */
  align-items: center;            /* center vertically (within wrapper) */
  
  width: 100%;
  max-width: 1200px;
  min-height: 500px;              /* ensures a tall enough area */
  
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: "Segoe UI", Tahoma, sans-serif;
}
</style>
