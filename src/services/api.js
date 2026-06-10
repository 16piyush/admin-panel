import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

// Request Interceptor
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('adminToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Response Interceptor
api.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
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

// ── Normalizers ───────────────────────────────────────────────────────────────
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

  getUsers:   (params) => api.get('/admin/users', { params }).then(normalizeUsers),
  getPending: ()       => api.get('/admin/users/pending'),

  getNCSPPartners: (params) =>
    api.get('/admin/users', { params: { ...params, role:'NC' } }).then(normalizeUsers),

  getNCSPPending: () =>
    api.get('/admin/users/pending', { params: { role:'NC' } }),

  approveNCSP: (id) => api.put(`/admin/users/${id}/approve`),
  rejectNCSP:  (id) => api.put(`/admin/users/${id}/reject`),

  // ── Internal User Creation (role-wise correct endpoint) ───────────────────
  createInternal: (data) => {
    if (data.role === 'SU') {
      return api.post('/admin/supervisor', {
        name:     data.name,
        mobileNo: data.mobile,
        email:    data.email,
        password: data.password,
      })
    }
    if (data.role === 'OT') {
      return api.post('/admin/operations-team', {
        name:     data.name,
        mobileNo: data.mobile,
        email:    data.email,
        password: data.password,
      })
    }
    if (data.role === 'IT') {
      return api.post('/admin/admin-user', {
        name:     data.name,
        mobileNo: data.mobile,
        email:    data.email,
        password: data.password,
      })
    }
    // fallback for other roles
    return api.post('/admin/internal-user', {
      name:     data.name,
      mobileNo: data.mobile,
      email:    data.email,
      password: data.password,
      role:     data.role,
      notes:    data.notes,
    })
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers: (params) =>
    api.get('/admin/users', { params: { ...params, role:'CU' } }).then(normalizeUsers),

  getCustomerStats: () =>
    api.get('/admin/stats/customers')
      .catch(() => Promise.resolve({ data: { data: null } })),

  updateCustomer: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteCustomer: (id)       => api.delete(`/admin/users/${id}`),

  // ── Approvals ─────────────────────────────────────────────────────────────
  approveUser: (id, data) => api.put(`/admin/users/${id}/approve`, data),
  rejectUser:  (id, data) => api.put(`/admin/users/${id}/reject`,  data),

  activateUser:   (id) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),

  // ── Cleaner Approvals ─────────────────────────────────────────────────────
  getCleanerPending:  () =>
    api.get('/admin/users/pending', { params: { role:'CL' } }),
  approveCleaner: (id) => api.put(`/admin/users/${id}/approve`),
  rejectCleaner:  (id) => api.put(`/admin/users/${id}/reject`),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSubscriptions:  (params) => api.get('/admin/subscriptions', { params }),
  getBookings:       (params) => api.get('/admin/bookings', { params }),
  getRevenueStats:   ()       => api.get('/admin/stats/revenue'),

  // ── Franchise Partners ────────────────────────────────────────────────────
  getFranchises: (params) =>
    api.get('/admin/users', { params: { ...params, role:'FR' } }).then(normalizeUsers),

  createFranchise: (data) =>
    api.post('/auth/register', {
      mobileNo:   data.mobileNo || data.mobile,
      role:       'FR',
      name:       data.name || data.businessName,
      entityType: data.entityType || 'company',
    }),

  approveFranchise: (id) => api.put(`/admin/users/${id}/approve`),
  rejectFranchise:  (id) => api.put(`/admin/users/${id}/reject`),

  createCleaner:(data)=> api.post('/auth/register',{
    mobileNo:data.mobileNo,
    role:'CL',
    name:data.name,
    profilePhoto: data.profilePhoto,

  }),
}

export default api