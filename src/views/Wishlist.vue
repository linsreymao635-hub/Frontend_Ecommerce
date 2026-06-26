<template>
  <div class="container" style="padding: 32px 20px;">
    <h1 class="page-title">My Wishlist</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="items.length === 0" style="text-align:center; padding:60px 20px;">
      <p style="font-size:1.5rem; margin-bottom:20px; color:var(--text-light);">❤️ Wishlist is empty</p>
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
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await wishlistService.getAll()
    items.value   = data
  } catch (error) {
    console.error('Error fetching wishlist:', error)
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
