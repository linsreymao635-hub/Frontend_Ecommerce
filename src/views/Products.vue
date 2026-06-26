<template>
  <div class="container">
    <div class="page-header">
    </div>
    <div class="products-layout">
      <!-- Sidebar filter -->
      <aside class="filters">
        <h3>Filters</h3>
        <div class="filter-group">
          <label>Category</label>
          <select v-model="filters.category_id" class="form-select" @change="fetchProducts(1)">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search</label>
          <input v-model="filters.search" class="form-control" placeholder="Search..." @input="debounceSearch">
        </div>
        <div class="filter-group">
          <label>Min Price</label>
          <input v-model="filters.min_price" type="number" class="form-control" @change="fetchProducts(1)">
        </div>
        <div class="filter-group">
          <label>Max Price</label>
          <input v-model="filters.max_price" type="number" class="form-control" @change="fetchProducts(1)">
        </div>
        <button class="btn btn-secondary btn-sm w-100" @click="clearFilters">Clear Filters</button>
      </aside>

      <!-- Products grid -->
      <div class="products-main">
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
        <template v-else>
          <p class="results-count">{{ pagination.total }} products found</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ProductCard from '../components/ProductCard.vue'
const route       = useRoute()
const router      = useRouter()
const products    = ref([])
const categories  = ref([])
const loading     = ref(true)
const filters     = reactive({ category_id: '', search: '', min_price: '', max_price: '' })
const pagination  = ref({})
let searchTimer   = null

const fetchProducts = async (page = 1) => {
  loading.value = true
  const params  = { page, ...filters }
  Object.keys(params).forEach(k => !params[k] && delete params[k])
  const { data } = await axios.get('/products', { params })
  products.value   = data.data
  pagination.value = { total: data.total, last_page: data.last_page, current_page: data.current_page }
  loading.value    = false
}

const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(1), 400)
}

const clearFilters = () => { Object.assign(filters, { category_id: '', search: '', min_price: '', max_price: '' }); fetchProducts(1) }

const viewProduct = (id) => {
  router.push(`/products/${id}`)
}

onMounted(async () => {
  // Check for search query in URL
  if (route.query.search) {
    filters.search = route.query.search
  }
  // Check for category in URL
  if (route.query.category) {
    filters.category_id = route.query.category
  }
  
  const { data } = await axios.get('/categories')
  categories.value = data
  fetchProducts()
})
</script>

<style scoped>
.products-layout { display: grid; grid-template-columns: 220px 1fr; gap: 28px; }
.filters { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); height: fit-content; position: sticky; top: 80px; }
.filters h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.filter-group { margin-bottom: 16px; }
.filter-group label { display: block; font-size: .85rem; font-weight: 500; margin-bottom: 5px; color: var(--text-light); }
.w-100 { width: 100%; }
.results-count { color: var(--text-light); font-size: .9rem; margin-bottom: 16px; }
@media(max-width:768px){ .products-layout { grid-template-columns: 1fr; } .filters { position: static; } }
</style>