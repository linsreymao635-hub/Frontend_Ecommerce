<template>
  <div class="container">
    <div class="page-header">
    </div>
    <div class="products-main">
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
        <template v-else>
          <p class="results-count">
            <span v-if="searchQuery">Search results for "{{ searchQuery }}" ({{ pagination.total }} products)</span>
            <span v-else>{{ pagination.total }} products found</span>
          </p>
          <div class="product-grid">
            <ProductCard 
              v-for="p in products" 
              :key="p.id" 
              :product="p"
              @view="viewProduct"
            />
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="pagination.last_page > 1">
            <button v-for="p in pagination.last_page" :key="p" class="page-btn"
                    :class="{ active: p === pagination.current_page }" @click="fetchProducts(p)">{{ p }}</button>
          </div>
        </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import api from '../services/api'
import ProductCard from '../components/ProductCard.vue'
const route       = useRoute()
const router      = useRouter()
const products    = ref([])
const loading     = ref(true)
const pagination  = ref({})
const searchQuery = ref('')

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const params = { page }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const { data } = await api.get('/products', { params })
    products.value   = data.data
    pagination.value = { total: data.total, last_page: data.last_page, current_page: data.current_page }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
  loading.value    = false
}

const viewProduct = (id) => {
  router.push(`/products/${id}`)
}

// Watch for search query changes in URL
watch(() => route.query.search, (newSearch) => {
  searchQuery.value = newSearch || ''
  fetchProducts(1)
})

onMounted(async () => {
  // Check for search query in URL
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  fetchProducts()
})
</script>

<style scoped>
.products-main {
  max-width: 1400px;
  margin: 0 auto;
}

.results-count {
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 20px 0;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  background: white;
  color: var(--text-color);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.page-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.page-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>
