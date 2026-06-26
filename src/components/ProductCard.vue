<template>
  <div class="product-card" @click="handleView">
      <div class="product-img-wrap">
        <img 
          v-if="product.image_url"
          :src="product.image_url" 
          :alt="product.name"
          loading="lazy"
        />
        <div v-if="!product.image_url" class="image-placeholder">
          <span class="placeholder-text">{{ product.name }}</span>
        </div>
      </div>
    <div class="product-info">
      <p class="product-category">{{ product.category?.name }}</p>
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-footer">
        <span class="product-price">${{ product.price }}</span>
        <button 
          class="wishlist-btn-sm" 
          :class="{ 'active': isInWishlist }"
          @click.stop="toggleWishlist"
          :disabled="loadingWishlist"
          title="Add to Wishlist"
        >
          {{ isInWishlist ? '❤️' : '🤍' }}
        </button>
        <button class="btn btn-primary btn-sm" @click.stop="handleAddToCart">+ Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { defineEmits, defineProps } from 'vue'

const props  = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'add-to-cart', 'wishlist-toggle'])
const store  = useStore()
const router = useRouter()

const isInWishlist = ref(false)
const loadingWishlist = ref(false)
const wishlistChecked = ref(false)

const handleView = () => {
  emit('view', props.product.id)
}

const handleAddToCart = async () => {
  if (!store.getters.isAuthenticated) return router.push('/login')
  try {
    await api.post('/cart', { product_id: props.product.id, quantity: 1 })
    // Optimistic update - immediately increment cart count
    const currentCount = store.getters.cartCount
    store.commit('SET_CART_COUNT', currentCount + 1)
    emit('add-to-cart', props.product)
  } catch (error) {
    console.error('Error adding to cart:', error)
    alert('Failed to add to cart')
  }
}

const checkWishlistStatus = async () => {
  if (!store.getters.isAuthenticated || wishlistChecked.value) return
  
  try {
    const response = await api.get('/wishlist')
    const wishlistItems = response.data
    isInWishlist.value = wishlistItems.some(item => item.product_id === props.product.id)
    wishlistChecked.value = true
  } catch (error) {
    console.error('Error checking wishlist:', error)
  }
}

const toggleWishlist = async () => {
  if (!store.getters.isAuthenticated) {
    return router.push('/login')
  }

  loadingWishlist.value = true
  try {
    if (isInWishlist.value) {
      // Remove from wishlist
      await api.delete(`/wishlist/${props.product.id}`)
      isInWishlist.value = false
    } else {
      // Add to wishlist
      await api.post('/wishlist', { product_id: props.product.id })
      isInWishlist.value = true
    }
    
    // Immediately update wishlist count in UI (optimistic update)
    const currentCount = store.getters.wishlistCount
    const newCount = isInWishlist.value ? currentCount + 1 : Math.max(0, currentCount - 1)
    store.commit('SET_WISHLIST_COUNT', newCount)
    
    console.log('Wishlist updated. New count:', newCount)
    
    // Don't fetch from server here - it will overwrite our optimistic update
    // The count will be refreshed when user visits wishlist page or on app reload
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    alert('Failed to update wishlist: ' + (error.response?.data?.message || error.message))
    // Revert the UI state on error
    isInWishlist.value = !isInWishlist.value
  } finally {
    loadingWishlist.value = false
  }
}

// Check wishlist status when component mounts or product changes
onMounted(() => {
  if (store.getters.isAuthenticated) {
    checkWishlistStatus()
  }
})

watch(() => props.product.id, () => {
  wishlistChecked.value = false
  if (store.getters.isAuthenticated) {
    checkWishlistStatus()
  }
})
</script>

<style scoped>
.product-card { 
  background: white; 
  border-radius: var(--radius); 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); 
  overflow: hidden; 
  cursor: pointer; 
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}
.product-card:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary);
}
.product-img-wrap { 
  height: 220px; 
  overflow: hidden; 
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.product-img-wrap img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.placeholder-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.product-card:hover .product-img-wrap img {
  transform: scale(1.05);
}
.product-info { 
  padding: 18px; 
  background: white;
}
.product-category { 
  font-size: 0.75rem; 
  color: var(--primary); 
  font-weight: 600; 
  text-transform: uppercase; 
  margin-bottom: 6px; 
  letter-spacing: 0.5px;
}
.product-name { 
  font-size: 1.05rem; 
  font-weight: 700; 
  margin-bottom: 12px; 
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-price { 
  font-size: 1.25rem; 
  font-weight: 700; 
  color: var(--primary);
}

.product-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wishlist-btn-sm {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.wishlist-btn-sm:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.wishlist-btn-sm.active {
  background: #ef4444;
}

.wishlist-btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>