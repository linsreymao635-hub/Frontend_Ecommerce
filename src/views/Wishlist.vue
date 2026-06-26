<template>
  <div class="container" style="padding: 32px 20px;">
    <h1 class="page-title">My Wishlist</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="items.length === 0" style="text-align:center; padding:60px 20px;">
      <p style="font-size:1.5rem; margin-bottom:20px; color:var(--text-light);">❤️ Wishlist is empty</p>
      <p v-if="rawData" style="font-size:0.9rem; color:#666; margin-top:10px;">Debug: {{ rawData }}</p>
      <router-link to="/products" class="btn btn-primary">Discover Products</router-link>
    </div>
      <div v-else class="product-grid">
        <div v-for="item in items" :key="item.id" class="card">
          <div class="wishlist-img-wrap">
            <img v-if="item.product?.image_url" :src="item.product.image_url" style="width:100%; height:180px; object-fit:cover;" />
            <div v-if="!item.product?.image_url" class="wishlist-placeholder">
              {{ item.product?.name }}
            </div>
          </div>
          <div class="card-body">
          <p style="color:var(--primary); font-size:.78rem; font-weight:600; text-transform:uppercase;">{{ item.product?.category?.name }}</p>
          <h3 style="font-weight:600; margin:4px 0 6px;">{{ item.product?.name }}</h3>
          <p style="color:var(--primary); font-weight:700; margin-bottom:12px;">${{ item.product?.price }}</p>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" @click="addToCart(item.product)">Add to Cart</button>
            <button class="btn btn-danger btn-sm" @click="remove(item.product_id)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import wishlistService from '../services/wishlist'
import cartService from '../services/cart'

const store   = useStore()
const items   = ref([])
const rawData = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // Refresh wishlist count first
    await store.dispatch('fetchWishlistCount')
    
    console.log('Fetching wishlist items...')
    const { data } = await wishlistService.getAll()
    console.log('Wishlist data received:', data)
    console.log('Data type:', typeof data)
    console.log('Is array:', Array.isArray(data))
    rawData.value = JSON.stringify(data)
    
    // Ensure data is an array
    if (Array.isArray(data)) {
      items.value = data
    } else if (data && typeof data === 'object') {
      // If it's an object, try to get the data property
      items.value = data.data || [data]
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    items.value = []
  } finally {
    loading.value = false
  }
})
  const remove = async (id) => {
    await wishlistService.removeFromWishlist(id)
    items.value = items.value.filter(i => i.product_id !== id)
    // Refresh wishlist count
    store.dispatch('fetchWishlistCount')
  }
  const addToCart = async (p) => {
    await cartService.addToCart(p.id, 1)
    store.dispatch('fetchCartCount')
  }
</script>

<style scoped>
.wishlist-img-wrap {
  height: 180px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.wishlist-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
