import api from './api'

export default {
  login(credentials) {
    return api.post('/login', credentials)
  },
  
  register(userData) {
    return api.post('/register', userData)
  },
  
  logout() {
    return api.post('/logout').catch(() => {
      // Even if logout fails on server, we still want to clear local data
      return Promise.resolve()
    })
  },
  
  getProfile() {
    return api.get('/profile')
  },
  
  updateProfile(data) {
    return api.put('/profile', data)
  },
  
  changePassword(data) {
    return api.put('/change-password', data)
  }
}