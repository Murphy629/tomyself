<template>
  <div class="page">
    <h1 class="title">All Grafana Components</h1>
    <div class="grafana-wrapper">

      <!-- 原来的 GrafanaComponentTest -->
      <div class="grafana-component">
        <p>Grafana Component - 01 (Test)</p>
        <GrafanaComponentTest />
      </div>

      <!-- 原来的 Skeleton 样式组件 -->
      <div class="grafana-component">
        <p>Grafana Component - 02 (Skeleton Line Chart)</p>
        <LineChartSkeletonStyle01 width="720" height="260" :points="30" :speed="1.8" />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 03 (Skeleton Gauge)</p>
        <GaugeSkeletonStyle01 :count="3" :size="160" :thickness="20" :speed="1.6" />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 04 (Skeleton Line Chart 2)</p>
        <LineChartSkeletonStyle02 theme="light" />
      </div>

      <hr class="sep" />

      <!-- 新的 Panel UI 组件 -->
      <div class="grafana-component">
        <p>Grafana Component - 05 (Bar Chart)</p>
        <PanelBarChart />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 06 (Stat)</p>
        <PanelStat />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 07 (Time Series)</p>
        <PanelTimeSeries />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 08 (Bar Gauge)</p>
        <PanelBarGauge />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 09 (Table)</p>
        <PanelTable />
      </div>

      <div class="grafana-component">
        <p>Grafana Component - 10 (Pie Chart)</p>
        <PanelPieChart />
      </div>

    </div>
  </div>
</template>

<script setup>
import GrafanaComponentTest from '../components/panels/GrafanaComponentTest.vue'
import LineChartSkeletonStyle01 from '../components/skeletons/LineChartSkeletonStyle01.vue'
import LineChartSkeletonStyle02 from '../components/skeletons/LineChartSkeletonStyle02.vue'
import GaugeSkeletonStyle01 from '../components/skeletons/GaugeSkeletonStyle01.vue'

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
  flex-wrap: wrap;                /* allow items to move to next row */
  justify-content: center;        /* center horizontally */
  align-items: flex-start;        /* align items at the top of each row */
  gap: 1.5rem;                    /* spacing between wrapped items */
  
  width: 100%;
  max-width: 1200px;
  min-height: 500px;              /* ensures a tall enough area */
  
  padding: 10.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: "Segoe UI", Tahoma, sans-serif;
  box-sizing: border-box;         /* include padding in width calc */
  overflow: hidden;               /* ensure no scrollbar/overflow */
}
</style>
