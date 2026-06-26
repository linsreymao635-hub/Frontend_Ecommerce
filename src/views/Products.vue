<template>
  <div class="container" style="padding: 32px 20px;">
    <div class="page-header">
      <div>
      </div>
    </div>

    <div v-if="loading" class="loading-center">
      <div class="spinner"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12 text-gray-500">
      <i class="fas fa-box-open text-5xl mb-3 text-gray-300"></i>
    </div>

    <div v-else>
      <div class="product-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
          @view="viewProduct"
          @add-to-cart="addToCart"
        />
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <button 
          @click="fetchProducts(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="page-btn"
        >
          Previous
        </button>
        
        <button 
          v-for="page in pagination.last_page" 
          :key="page"
          @click="fetchProducts(page)"
          :class="['page-btn', { active: page === pagination.current_page }]"
        >
          {{ page }}
        </button>
        
        <button 
          @click="fetchProducts(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import api from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const store = useStore()
const router = useRouter()

const products = ref([])
const loading = ref(true)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

// Use cached products from store if available
const cachedProducts = computed(() => store.getters.products)
const useCache = computed(() => cachedProducts.value.length > 0)

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get('/products', {
      params: {
        page: page,
        per_page: 12
      }
    })
    products.value = response.data.data
    pagination.value = {
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      total: response.data.total
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Use cached products if available to avoid refetching
  if (useCache.value) {
    products.value = cachedProducts.value
    loading.value = false
  } else {
    await fetchProducts(1)
    // Cache first 5 products in store for navbar dropdown
    if (products.value.length > 0) {
      store.commit('SET_PRODUCTS', products.value.slice(0, 5))
    }
  }
})

const viewProduct = (id) => {
  router.push(`/products/${id}`)
}

const addToCart = async (product) => {
  if (!store.getters.isAuthenticated) {
    return router.push('/login')
  }
  try {
    await api.post('/cart', { product_id: product.id, quantity: 1 })
    store.dispatch('fetchCartCount')
    alert('Product added to cart!')
  } catch (error) {
    console.error('Error adding to cart:', error)
    alert('Failed to add product to cart')
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}

.page-btn {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>