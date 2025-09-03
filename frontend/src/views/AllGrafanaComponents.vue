<template>
  <div class="page">
    <h1 class="title">All Grafana Components</h1>
    <div class="grafana-wrapper">

        <div class="grafana-component">
            <p>Grafana Component - 01</p>
            <GrafanaComponentTest />
        </div>

        <div class="grafana-component">
          <!-- Dark - currently not needed, put it here anyway -->
          <!-- <LineChartSkeletonStyle01 :width="720" :height="260" :points="30" :speed="1.8" dark /> -->
          <p>Grafana Component - 02</p>
          <LineChartSkeletonStyle01 :width="720" :height="260" :points="30" :speed="1.8" />
        </div>

      <div class="grafana-component">
        <p>Grafana Component - 03</p>
        <GaugeSkeletonStyle01 :count="3" :size="160" :thickness="20" :speed="1.6" />
      </div>
      
      <div class="grafana-component">
        <p>Grafana Component - 04</p>
        <LineChartSkeletonStyle02 theme="light" />
      </div>

    </div>
  </div>
</template>

<script setup>
import GrafanaComponentTest from '../components/GrafanaComponentTest.vue'
  
import LineChartSkeletonStyle01 from '../components/LineChartSkeletonStyle01.vue';
import LineChartSkeletonStyle02 from '../components/LineChartSkeletonStyle02.vue';
import GaugeSkeletonStyle01 from '../components/GaugeSkeletonStyle01.vue';

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