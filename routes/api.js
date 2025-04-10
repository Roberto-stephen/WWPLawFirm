/**
 * API Client untuk WWP Law Firm
 * File ini berisi fungsi-fungsi untuk berkomunikasi dengan backend API
 */

// Buat namespace API global
window.API = {};

// Fungsi helper untuk request API
const apiRequest = async (endpoint, method = 'GET', data = null, customHeaders = {}) => {
  try {
    const baseUrl = window.location.origin; // Diubah dari 'http://localhost:9000' ke window.location.origin
    const url = `${baseUrl}${endpoint}`;
    console.log(`API Request: ${method} ${url}`);
    
    // Siapkan headers
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Siapkan opsi request
    const options = {
      method,
      headers,
      credentials: 'same-origin'
    };
    
    // Tambahkan body jika ada data
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    // Kirim request
    const response = await fetch(url, options);
    
    // Handle error HTTP
    if (!response.ok) {
      // Coba parse error JSON jika ada
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP Error: ${response.status}`);
      } catch (jsonError) {
        // Jika tidak bisa parse JSON, gunakan error standar
        throw new Error(`HTTP Error: ${response.status}`);
      }
    }
    
    // Parse response sebagai JSON
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
  
};

// API Autentikasi
window.API.auth = {
  // Login user
  login: async (email, password) => {
    return apiRequest('/api/auth/login', 'POST', { email, password });
  },
  
  // Register user
  register: async (userData) => {
    return apiRequest('/api/auth/register', 'POST', userData);
  },
  
  // Check autentikasi
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Verifikasi token dengan server
      try {
        await apiRequest('/api/auth/verify');
        return true;
      } catch (error) {
        console.log('Token verification failed:', error.message);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    window.location.href = 'login.html';
  }
};

// API Kasus
window.API.cases = {
  getCases: async () => {  // Tambahkan metode ini
    return apiRequest('/api/cases');
  },
  getAllCases: async () => {  // Pertahankan yang lama untuk kompatibilitas
    return apiRequest('/api/cases');
  },
  
  // Ambil detail kasus
  getCaseById: async (caseId) => {
    return apiRequest(`/api/cases/${caseId}`);
  },
  
  // Buat kasus baru
  createCase: async (caseData) => {
    return apiRequest('/api/cases', 'POST', caseData);
  },
  
  // Update kasus
  updateCase: async (caseId, caseData) => {
    return apiRequest(`/api/cases/${caseId}`, 'PUT', caseData);
  },
  
  // Hapus kasus
  deleteCase: async (caseId) => {
    return apiRequest(`/api/cases/${caseId}`, 'DELETE');
  }
};

// API Dokumen
window.API.documents = {
  // Ambil semua dokumen
  getAllDocuments: async () => {
    return apiRequest('/api/documents');
  },
  
  // Ambil detail dokumen
  getDocumentById: async (documentId) => {
    return apiRequest(`/api/documents/${documentId}`);
  },
  
  // Upload dokumen
  uploadDocument: async (formData) => {
    return fetch(`${window.location.origin}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(response => {
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    });
  },
  
  // Hapus dokumen
  deleteDocument: async (documentId) => {
    return apiRequest(`/api/documents/${documentId}`, 'DELETE');
  }
};

// API CRM
window.API.crm = {
  // Pastikan endpoint ini sesuai dengan routes/crm.js
  getUsers: async () => {
    try {
      return apiRequest('/api/crm/clients'); // Sesuai dengan endpoint di crm.js yang baru
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  
  getEmployees: async () => {
    try {
      return apiRequest('/api/crm/employees'); // Sesuai dengan endpoint di crm.js yang baru
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },
  
  // Ambil detail user
  getUserById: async (userId) => {
    return apiRequest(`/api/crm/${userId}`);
  },
  
  // Create user (DITAMBAHKAN)
  createUser: async (userData) => {
    try {
      console.log('createUser called with:', userData);
      return apiRequest('/api/crm', 'POST', userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    return apiRequest(`/api/crm/${userId}`, 'PUT', userData);
  },
  
  // Delete user
  deleteUser: async (userId) => {
    return apiRequest(`/api/crm/${userId}`, 'DELETE');
  },

  // Ambil data user sendiri
  listSelectedUser: async (userType) => {
    console.log(`listSelectedUser called with userType: ${userType}`);
    
    if (userType === 'self') {
      try {
        console.log("Fetching self data from /api/crm/me");
        const userData = await apiRequest('/api/crm/me');
        console.log("Self data fetched successfully:", userData);
        return userData;
      } catch (error) {
        console.error('Error fetching self data:', error);
        // Fallback ke data localStorage
        return { 
          username: localStorage.getItem('userName') || 'User',
          type: localStorage.getItem('userType') || 'user'
        };
      }
    }
    
    // Untuk tipe pengguna lain
    return apiRequest(`/api/crm/${userType}`);
  },
  
  // Fungsi yang lebih robust untuk mengambil data user sendiri
  getSelfData: async () => {
    try {
      console.log("getSelfData: Fetching user data");
      const userData = await apiRequest('/api/crm/me');
      return userData;
    } catch (error) {
      console.error('getSelfData error:', error);
      throw error;
    }
  }
};

// API Statistik
window.API.statistics = {
  // Ambil statistik dashboard
  getDashboardStatistics: async () => {
    try {
      return apiRequest('/api/statistics/dashboard');
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      
      // Return dummy data if API fails
      return {
        caseStatistic: {
          open: 8,
          close: 12
        },
        userStatistic: {
          admins: 3,
          partners: 5,
          associates: 8,
          paralegals: 4,
          clients: 32
        }
      };
    }
  },
  
  // Ambil statistik kasus
  getCaseStatistics: async () => {
    return apiRequest('/api/statistics/cases');
  }
};

// API Jadwal
window.API.appointments = {
  getAppointments: async () => {  // Tambahkan metode ini
    return apiRequest('/api/appointments');
  },
  getAllAppointments: async () => {  // Pertahankan yang lama
    return apiRequest('/api/appointments');
  },
  
  // Ambil detail jadwal
  getAppointmentById: async (appointmentId) => {
    return apiRequest(`/api/appointments/${appointmentId}`);
  },
  
  // Buat jadwal baru
  createAppointment: async (appointmentData) => {
    return apiRequest('/api/appointments', 'POST', appointmentData);
  },
  
  // Update jadwal
  updateAppointment: async (appointmentId, appointmentData) => {
    return apiRequest(`/api/appointments/${appointmentId}`, 'PUT', appointmentData);
  },
  
  // Hapus jadwal
  deleteAppointment: async (appointmentId) => {
    return apiRequest(`/api/appointments/${appointmentId}`, 'DELETE');
  }
};