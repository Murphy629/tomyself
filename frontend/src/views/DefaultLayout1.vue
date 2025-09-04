<template>
    <h1>Default Layout 1</h1>
    <div class="cards">
        <!-- ⚠️ this should be drifting from strong to light, need to dev later  -->
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
        <CardSkeleton :speed="2"/>
    </div>
</template>

<script setup>
import CardSkeleton from '../components/CardSkeleton.vue';
</script>

<style scoped>
h1 {
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 600;
  text-align: center;
  margin: 1.5rem 0;
  color: #333;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto; /* center horizontally */
  box-sizing: border-box;
}
</style>