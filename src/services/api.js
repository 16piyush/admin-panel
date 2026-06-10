import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// Request Interceptor: Token add karne ke liye
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('adminToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Response Interceptor: Error handling ke liye
api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || ''
    const isCreateOp = url.includes('create') || url.includes('register')
      || url.includes('approve') || url.includes('reject')

    if (err.response?.status === 401 && !isCreateOp) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:  (data) => api.post('/auth/internal/login', {
    mobileNo: data.mobileNo,
    password: data.password,
  }),
  me:     () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// ── Normalizers (Data structure theek karne ke liye) ───────────────────────────
const normalizeUsers = (res) => {
  const d = res.data?.data || {}
  return {
    ...res,
    data: {
      data: Array.isArray(d.users) ? d.users : [],
      meta: {
        total: d.total      || 0,
        page:  d.page       || 1,
        pages: d.totalPages || 1,
      }
    }
  }
}

const normalizeCustomers = (res) => {
  const d = res.data?.data || {}
  return {
    ...res,
    data: {
      data: Array.isArray(d.customers) ? d.customers
          : Array.isArray(d.users)     ? d.users
          : [],
      meta: {
        total: d.total      || 0,
        page:  d.page       || 1,
        pages: d.totalPages || 1,
      }
    }
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }).then(normalizeUsers),
  getPending: () => api.get('/admin/users/pending'),

  getNCSPPartners: (params) =>
    api.get('/admin/users', {
      params: { ...params, role: 'NC' }
    }).then(normalizeUsers),

  getNCSPPending: () =>
    api.get('/admin/users/pending', {
      params: { role: 'NC' }
    }),

  approveNCSP: (id) =>
    api.put(`/admin/users/${id}/approve`),

  rejectNCSP: (id) =>
    api.put(`/admin/users/${id}/reject`),

  createInternal: (data) => api.post('/admin/users/create', {
    name: data.name,
    mobileNo: data.mobile,
    email: data.email,
    password: data.password,
    role: data.role,
    notes: data.notes,
  }),


  // Customers (Filtered by role 'CU')
  getCustomers: (params) =>
    api.get('/admin/users', { params: { ...params, role: 'CU' } }).then(normalizeUsers),
  
  getCustomerStats: () => 
    api.get('/admin/stats/customers').catch(() => Promise.resolve({ data: { data: null } })),

  updateCustomer: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteCustomer: (id) => api.delete(`/admin/users/${id}`),

  // Approvals (Cleaner, Franchise, NCSP)
  approveUser: (id, data) => api.put(`/admin/users/${id}/approve`, data),
  rejectUser:  (id, data) => api.put(`/admin/users/${id}/reject`,  data),

  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // New Real Data Methods
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getBookings:      (params) => api.get('/admin/bookings', { params }),
  getRevenueStats:  ()       => api.get('/admin/stats/revenue'),

  // Franchise Partners
getFranchises: (params) =>
  api.get('/admin/users', {
    params: { ...params, role: 'FR' }
  }).then(normalizeUsers),

createFranchise: (data) =>
  api.post('/auth/register', {
    mobileNo: data.mobileNo || data.mobile,
    role: 'FR',
    name: data.name || data.businessName,
    entityType: data.entityType || 'company',
  }),

approveFranchise: (id) =>
  api.put(`/admin/users/${id}/approve`),

rejectFranchise: (id) =>
  api.put(`/admin/users/${id}/reject`),
}

export default api