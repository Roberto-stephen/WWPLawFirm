// API Service untuk komunikasi dengan backend
const API_BASE_URL = '';  // Empty string karena menggunakan relative URL

// Token handling
const getToken = () => {
  return localStorage.getItem('token');
};

const setToken = (token) => {
  localStorage.setItem('token', token);
};

const clearToken = () => {
  localStorage.removeItem('token');
};

// Headers umum untuk semua requests
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handler error
const handleResponse = async (response) => {
  // Jika response OK, return JSON-nya
  if (response.ok) {
    return response.json();
  }
  
  // Jika error, throw error message
  const errorData = await response.json().catch(() => ({
    error: 'Unknown error',
    message: 'An unknown error occurred'
  }));
  
  // Khusus untuk 401, hapus token dan redirect ke login
  if (response.status === 401) {
    clearToken();
    window.location.href = '/login.html';
    throw new Error('Authentication failed. Please login again.');
  }
  
  throw new Error(errorData.message || 'An error occurred');
};

// Authentication API
const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      return false;
    }
    
    try {
      // Coba akses endpoint yang memerlukan auth
      await casesAPI.getCases();
      return true;
    } catch (error) {
      clearToken();
      return false;
    }
  },
  
  logout: () => {
    clearToken();
    window.location.href = '/login.html';
  }
};

// Cases API
const casesAPI = {
  getCases: async () => {
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCase: async (caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createCase: async (caseData) => {
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(caseData),
    });
    
    return handleResponse(response);
  },
  
  updateCase: async (caseId, caseData) => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(caseData),
    });
    
    return handleResponse(response);
  },
  
  deleteCase: async (caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCaseMessages: async (caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/message`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Documents API
const documentsAPI = {
  getAllDocuments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/documents/all`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getDocumentsByCaseId: async (caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/documents/all/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getDocument: async (docId, caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createDocument: async (formData) => {
    // Untuk upload file, kita tidak menggunakan JSON
    const headers = {
      'Authorization': `Bearer ${getToken()}`,
      // Content-Type akan otomatis diatur oleh browser karena kita mengirim FormData
    };
    
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: headers,
      body: formData, // FormData untuk file upload
    });
    
    return handleResponse(response);
  },
  
  updateDocument: async (docData) => {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(docData),
    });
    
    return handleResponse(response);
  },
  
  deleteDocument: async (docId, caseId) => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/${caseId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Appointments API
const appointmentsAPI = {
  getAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createAppointment: async (appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });
    
    return handleResponse(response);
  },
  
  updateAppointment: async (appointmentId, appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });
    
    return handleResponse(response);
  },
  
  cancelAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUserList: async () => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/userlist`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  updateUserResponse: async (appointmentId, responseData) => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/response/${appointmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ response: responseData }),
    });
    
    return handleResponse(response);
  }
};

// Tasks API
const tasksAPI = {
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    
    return handleResponse(response);
  },
  
  updateTask: async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    
    return handleResponse(response);
  },
  
  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getTasksForUser: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/user`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUserList: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/userlist`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  updateStatus: async (taskId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/updateStatus/${status}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ _id: taskId }),
    });
    
    return handleResponse(response);
  }
};

// Statistics API
const statisticsAPI = {
  getDashboardStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/statistics/dashboard`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/api/statistics/notifications`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// CRM API
const crmAPI = {
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/crm`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getEmployees: async () => {
    const response = await fetch(`${API_BASE_URL}/api/crm/employee`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/crm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  updatePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/crm/p`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldpassword: oldPassword, newpassword: newPassword }),
    });
    
    return handleResponse(response);
  },
  
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Export semua API services
window.API = {
  auth: authAPI,
  cases: casesAPI,
  documents: documentsAPI,
  appointments: appointmentsAPI,
  tasks: tasksAPI,
  statistics: statisticsAPI,
  crm: crmAPI,
  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      return false;
    }
    return true;
  },
  
  logout: () => {
    clearToken();
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
  }
};