const express = require('express');
const router = express.Router();

// Auth routes
router.post('/auth/login', (req, res) => { /* implementation */ });
router.post('/auth/logout', (req, res) => { /* implementation */ });
router.get('/auth/verify', (req, res) => { /* implementation */ });

// Admin routes
router.get('/admin/dashboard', (req, res) => { /* implementation */ });

const API = {
    // Base request function
    async request(endpoint, options = {}) {
      try {
        // Default options
        const defaultOptions = {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        };
        
        // Merge options
        const mergedOptions = {
          ...defaultOptions,
          ...options,
          headers: {
            ...defaultOptions.headers,
            ...options.headers
          }
        };
        
        // Tambahkan Content-Type untuk request non-GET dengan body
        if (mergedOptions.body && !mergedOptions.headers['Content-Type'] && !(mergedOptions.body instanceof FormData)) {
          mergedOptions.headers['Content-Type'] = 'application/json';
        }
        
        // Stringify body jika bukan FormData atau string
        if (mergedOptions.body && !(mergedOptions.body instanceof FormData) && typeof mergedOptions.body !== 'string') {
          mergedOptions.body = JSON.stringify(mergedOptions.body);
        }
        
        // Add timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout after 15 seconds")), 15000)
        );
        
        // Buat request dengan timeout
        const fetchPromise = fetch(endpoint, mergedOptions)
          .then(async response => {
            console.log(`API ${endpoint} response status:`, response.status);
            
            // Tangani respons error
            if (!response.ok) {
              const contentType = response.headers.get('content-type');
              let errorMessage;
              
              if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.message || `HTTP error ${response.status}`;
                throw new Error(errorMessage);
              } else {
                const text = await response.text();
                throw new Error(`HTTP error ${response.status}: ${text.substring(0, 100)}`);
              }
            }
            
            // Parse response based on content type
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return response.json();
            }
            
            return response.text();
          });
        
        // Race between fetch and timeout
        return Promise.race([fetchPromise, timeoutPromise]);
      } catch (error) {
        console.error(`API error for ${endpoint}:`, error);
        throw error;
      }
    },
    
    // Authentication
    auth: {
      login: (credentials) => API.request('/api/auth/login', {
        method: 'POST',
        body: credentials
      }),
      
      logout: () => API.request('/api/auth/logout', {
        method: 'POST'
      }),
      
      verify: () => API.request('/api/auth/verify')
    },

    
    
    // Admin endpoints
    admin: {
      // Dashboard
      getDashboard: () => API.request('/api/admin/dashboard'),
      
      // User management
      getUsers: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/users${queryParams ? `?${queryParams}` : ''}`);
      },
      
      getUser: (id) => API.request(`/api/admin/users/${id}`),
      
      createUser: (userData) => API.request('/api/admin/users', {
        method: 'POST',
        body: userData
      }),
      
      updateUser: (id, userData) => API.request(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: userData
      }),
      
      deleteUser: (id) => API.request(`/api/admin/users/${id}`, {
        method: 'DELETE'
      }),
      
      // Case management
      getCases: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/cases${queryParams ? `?${queryParams}` : ''}`);
      },
      
      getCase: (id) => API.request(`/api/admin/cases/${id}`),
      
      createCase: (caseData) => API.request('/api/admin/cases', {
        method: 'POST',
        body: caseData
      }),
      
      updateCase: (id, caseData) => API.request(`/api/admin/cases/${id}`, {
        method: 'PUT',
        body: caseData
      }),
      
      deleteCase: (id) => API.request(`/api/admin/cases/${id}`, {
        method: 'DELETE'
      }),
      
      // Document management
      getDocuments: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/documents${queryParams ? `?${queryParams}` : ''}`);
      },
      
      uploadDocument: (documentData) => API.request('/api/admin/documents', {
        method: 'POST',
        body: documentData
      }),
      
      // Hearing management
      getHearings: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/hearings${queryParams ? `?${queryParams}` : ''}`);
      },
      
      createHearing: (hearingData) => API.request('/api/admin/hearings', {
        method: 'POST',
        body: hearingData
      }),
      
      // Finance management
      getFinanceTransactions: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/finance${queryParams ? `?${queryParams}` : ''}`);
      },
      
      getFinanceSummary: () => API.request('/api/admin/finance/summary'),
      
      // Statistics
      getCaseStatistics: () => API.request('/api/admin/statistics/cases'),
      getUserStatistics: () => API.request('/api/admin/statistics/users'),
      getAppointmentStatistics: () => API.request('/api/admin/statistics/appointments'),
      getIncomeStatistics: () => API.request('/api/admin/statistics/income'),
      
      // System logs
      getLogs: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/admin/logs${queryParams ? `?${queryParams}` : ''}`);
      },
      
      // Backup and restore
      getBackups: () => API.request('/api/admin/backup'),
      createBackup: () => API.request('/api/admin/backup', { method: 'POST' }),
      restoreBackup: (id) => API.request(`/api/admin/backup/restore/${id}`, { method: 'POST' })
    },
    
    // Client endpoints
    client: {
      // Dashboard
      getDashboard: () => API.request('/api/client/dashboard'),
      
      // Profile management
      getProfile: () => API.request('/api/client/profile'),
      
      updateProfile: (profileData) => API.request('/api/client/profile', {
        method: 'PUT',
        body: profileData
      }),
      
      updatePassword: (passwordData) => API.request('/api/client/profile/password', {
        method: 'PUT',
        body: passwordData
      }),
      
      // Case management
      getCases: () => API.request('/api/client/cases'),
      getCase: (id) => API.request(`/api/client/cases/${id}`),
      getCaseDocuments: (id) => API.request(`/api/client/cases/${id}/documents`),
      getCaseTimeline: (id) => API.request(`/api/client/cases/${id}/timeline`),
      
      // Document management
      getDocuments: () => API.request('/api/client/documents'),
      getDocument: (id) => API.request(`/api/client/documents/${id}`),
      uploadDocument: (documentData) => API.request('/api/client/documents', {
        method: 'POST',
        body: documentData
      }),
      
      // Appointment management
      getAppointments: () => API.request('/api/client/appointments'),
      requestAppointment: (appointmentData) => API.request('/api/client/appointments', {
        method: 'POST',
        body: appointmentData
      }),
      cancelAppointment: (id) => API.request(`/api/client/appointments/${id}/cancel`, {
        method: 'PUT'
      }),
      
      // Invoice management
      getInvoices: () => API.request('/api/client/invoices')
    },
    
    // Lawyer endpoints
    lawyer: {
      // Dashboard
      getDashboard: () => API.request('/api/lawyer/dashboard'),
      
      // Case management
      getCases: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/lawyer/cases${queryParams ? `?${queryParams}` : ''}`);
      },
      getCase: (id) => API.request(`/api/lawyer/cases/${id}`),
      updateCaseStatus: (id, status) => API.request(`/api/lawyer/cases/${id}/status`, {
        method: 'PUT',
        body: { status }
      }),
      
      // Client management
      getClients: () => API.request('/api/lawyer/clients'),
      getClient: (id) => API.request(`/api/lawyer/clients/${id}`),
      
      // Task management
      getTasks: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.request(`/api/lawyer/tasks${queryParams ? `?${queryParams}` : ''}`);
      },
      createTask: (taskData) => API.request('/api/lawyer/tasks', {
        method: 'POST',
        body: taskData
      }),
      updateTaskStatus: (id, status) => API.request(`/api/lawyer/tasks/${id}/status`, {
        method: 'PUT',
        body: { status }
      }),
      
      // Calendar management
      getCalendar: (month, year) => API.request(`/api/lawyer/calendar?month=${month}&year=${year}`),
      
      // Hearing management
      getHearings: () => API.request('/api/lawyer/hearings'),
      getHearing: (id) => API.request(`/api/lawyer/hearings/${id}`),
      updateHearing: (id, hearingData) => API.request(`/api/lawyer/hearings/${id}`, {
        method: 'PUT',
        body: hearingData
      })
    },
    
    // CRM (Legacy endpoint)
    crm: {
      getUsers: () => API.request('/api/crm/users'),
      getUser: (id) => API.request(`/api/crm/users/${id}`),
      createUser: (userData) => API.request('/api/crm/users', {
        method: 'POST',
        body: userData
      }),
      updateUser: (id, userData) => API.request(`/api/crm/users/${id}`, {
        method: 'PUT',
        body: userData
      }),
      deleteUser: (id) => API.request(`/api/crm/users/${id}`, {
        method: 'DELETE'
      })
    },
    
    // Cases (Legacy endpoint)
    cases: {
      getCases: () => API.request('/api/cases'),
      getCase: (id) => API.request(`/api/cases/${id}`),
      createCase: (caseData) => API.request('/api/cases', {
        method: 'POST',
        body: caseData
      }),
      updateCase: (id, caseData) => API.request(`/api/cases/${id}`, {
        method: 'PUT',
        body: caseData
      }),
      deleteCase: (id) => API.request(`/api/cases/${id}`, {
        method: 'DELETE'
      })
    },
    
    // Documents (Legacy endpoint)
    documents: {
      getDocuments: () => API.request('/api/documents'),
      getDocument: (id) => API.request(`/api/documents/${id}`),
      uploadDocument: (documentData) => API.request('/api/documents', {
        method: 'POST',
        body: documentData
      }),
      updateDocument: (id, documentData) => API.request(`/api/documents/${id}`, {
        method: 'PUT',
        body: documentData
      }),
      deleteDocument: (id) => API.request(`/api/documents/${id}`, {
        method: 'DELETE'
      })
    }
  };
  
  // Export API globally
  module.exports = router;