<template>
  <div class="auth-page">
    <div class="card" style="width:100%; max-width:420px;">
      <div class="card-body">
        <h2 style="text-align:center; font-size:1.6rem; font-weight:700; margin-bottom:24px;">Create Account</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div class="form-group">
          <label>Name</label>
          <input v-model="form.name" class="form-control" placeholder="Your full name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div style="position: relative;">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': passwordError }" placeholder="Min. 8 characters" style="padding-right: 40px;" @input="validatePassword" />
            <button type="button" @click="showPassword = !showPassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 5px;">
              {{ showPassword ? '👁‍🗨' : '👁' }}
            </button>
          </div>
          <div v-if="passwordError" class="alert alert-danger" style="margin-top: 8px; padding: 8px; font-size: 0.9rem;">
            {{ passwordError }}
          </div>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <div style="position: relative;">
            <input v-model="form.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': confirmPasswordError }" placeholder="Repeat password" style="padding-right: 40px;" @input="validateConfirmPassword" />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 5px;">
              {{ showConfirmPassword ? '👁‍🗨' : '👁' }}
            </button>
          </div>
          <div v-if="confirmPasswordError" class="alert alert-danger" style="margin-top: 8px; padding: 8px; font-size: 0.9rem;">
            {{ confirmPasswordError }}
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%; justify-content:center; padding:12px;"
          :disabled="loading" @click="handleRegister">
          {{ loading ? 'Creating...' : 'Create Account' }}
        </button>
        <p style="text-align:center; margin-top:16px; color:var(--text-light);">
          Already have an account? <router-link to="/login" style="color:var(--primary)">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store   = useStore()
const router  = useRouter()
const form    = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const loading = ref(false)
const error   = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')

const validatePassword = () => {
  if (form.password.length > 0 && form.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
  } else {
    passwordError.value = ''
  }
  // Re-validate confirm password if it has value
  if (form.password_confirmation) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (form.password_confirmation && form.password !== form.password_confirmation) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
}

const handleRegister = async () => {
  // Validate before submission
  validatePassword()
  validateConfirmPassword()
  
  if (passwordError.value || confirmPasswordError.value) {
    return
  }
  
  if (!form.password || form.password.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }
  
  if (form.password !== form.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }
  
  loading.value = true
  error.value   = ''
  try {
    await store.dispatch('register', form)
    router.push('/')
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value  = errors ? Object.values(errors)[0][0] : (e.response?.data?.message || 'Registration failed.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 20px; }
</style>