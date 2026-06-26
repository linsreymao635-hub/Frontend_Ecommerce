<template>
  <div class="container" style="padding: 32px 20px;">
    <h1 class="page-title">Shopping Cart</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="items.length === 0" style="text-align:center; padding:60px 20px;">
      <p style="font-size:1.5rem; margin-bottom:20px; color:var(--text-light);">🛒 Your cart is empty</p>
      <p v-if="debugInfo" style="font-size:0.85rem; color:#666; margin-top:10px;">Debug: {{ debugInfo }}</p>
      <router-link to="/products" class="btn btn-primary">Start Shopping</router-link>
    </div>
    <div v-else>
      <div class="product-grid">
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
            <p style="color:var(--primary); font-weight:700; margin-bottom:8px;">${{ item.product?.price }}</p>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
              <label style="font-size:0.9rem;">Qty:</label>
              <input type="number" :value="item.quantity" min="1" class="form-control" style="width:70px;"
                @change="updateQty(item, $event.target.value)" />
            </div>
            <p style="font-weight:700; font-size:1.1rem; margin-bottom:12px; padding-top:8px; border-top:1px solid var(--border);">
              Subtotal: ${{ (item.product?.price * item.quantity).toFixed(2) }}
            </p>
            <div style="display:flex; gap:8px;">
              <button 
                class="btn btn-sm" 
                :class="wishlistStatus[item.product_id] ? 'btn-danger' : 'btn-outline'"
                @click="toggleWishlist(item.product_id)"
                style="flex:1;"
              >
                {{ wishlistStatus[item.product_id] ? '❤️ Wishlisted' : '🤍 Wishlist' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="removeItem(item.id)" style="flex:1;">Remove</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="card card-body" style="max-width:400px; margin:32px auto;">
        <h3 style="margin-bottom:16px; text-align:center;">Order Summary</h3>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
          <span>Subtotal</span><span>${{ total.toFixed(2) }}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
          <span>Shipping</span><span style="color:var(--success);">Free</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding-top:12px; font-size:1.1rem; font-weight:700;">
          <span>Total</span><span>${{ total.toFixed(2) }}</span>
        </div>
        <router-link to="/checkout" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:16px;">
          Proceed to Checkout
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import cartService from '../services/cart'
import wishlistService from '../services/wishlist'

const store   = useStore()
const router  = useRouter()
const items   = ref([])
const total   = ref(0)
const loading = ref(true)
const wishlistStatus = ref({})
const debugInfo = ref('')

const fetchCart = async () => {
  loading.value = true
  debugInfo.value = ''
  try {
    console.log('Fetching cart...')
    const { data } = await cartService.getAll()
    console.log('Cart data received:', data)
    console.log('Items:', data.items)
    console.log('Items count:', data.items?.length)
    debugInfo.value = `Items: ${data.items?.length || 0}, Total: $${data.total || 0}`
    items.value   = data.items || []
    total.value   = data.total || 0
  } catch (error) {
    console.error('Error fetching cart:', error)
    console.error('Error response:', error.response?.data)
    debugInfo.value = 'Error: ' + (error.response?.data?.message || error.message)
  } finally {
    loading.value = false
  }
}

const checkAllWishlistStatus = async () => {
  if (!store.getters.isAuthenticated) return
  try {
    const { data } = await wishlistService.getAll()
    const statusMap = {}
    data.forEach(item => {
      statusMap[item.product_id] = true
    })
    wishlistStatus.value = statusMap
  } catch (error) {
    console.error('Error checking wishlist status:', error)
  }
}

const toggleWishlist = async (productId) => {
  if (!store.getters.isAuthenticated) {
    return router.push('/login')
  }
  try {
    const isInWishlist = wishlistStatus.value[productId]
    if (isInWishlist) {
      await wishlistService.removeFromWishlist(productId)
      wishlistStatus.value[productId] = false
    } else {
      await wishlistService.addToWishlist(productId)
      wishlistStatus.value[productId] = true
    }
    const currentCount = store.getters.wishlistCount
    const newCount = !isInWishlist ? currentCount + 1 : Math.max(0, currentCount - 1)
    store.commit('SET_WISHLIST_COUNT', newCount)
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    alert('Failed to update wishlist')
  }
}

const updateQty = async (item, qty) => {
  await cartService.updateQuantity(item.id, parseInt(qty))
  fetchCart()
  store.dispatch('fetchCartCount')
}

const removeItem = async (id) => {
  await cartService.removeFromCart(id)
  fetchCart()
  store.dispatch('fetchCartCount')
}

onMounted(async () => {
  await fetchCart()
  await checkAllWishlistStatus()
})
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