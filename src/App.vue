<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
onMounted(async () => {
  // Don't fetch counts on mount - let optimistic updates handle it
  // Counts will be accurate when user clicks buttons or visits respective pages
})
</script>