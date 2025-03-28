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

// Cek apakah pengguna adalah guest
const isGuestUser = () => {
  return localStorage.getItem('isGuest') === 'true';
};

// Data dummy untuk guest mode
const DUMMY_DATA = {
  cases: [
    {
      _id: 'case1',
      case_title: 'Kasus Perdata Pembagian Harta',
      case_description: 'Kasus perdata mengenai pembagian harta warisan keluarga Budi.',
      case_type: 'Perdata',
      case_status: 'Open',
      case_priority: 'High',
      case_total_billed_hour: 24,
      case_member_list: [
        { case_member_id: 'lawyer1', case_member_type: 'partner', case_member_role: 'Lead', case_member_name: 'Dewi Putri' },
        { case_member_id: 'user1', case_member_type: 'client', case_member_role: 'Client' }
      ]
    },
    {
      _id: 'case2',
      case_title: 'Kasus Bisnis Cidera Janji',
      case_description: 'Kasus bisnis mengenai cidera janji dalam perjanjian kerjasama.',
      case_type: 'Bisnis',
      case_status: 'Pending',
      case_priority: 'Medium',
      case_total_billed_hour: 12,
      case_member_list: [
        { case_member_id: 'lawyer2', case_member_type: 'associates', case_member_role: 'Lead', case_member_name: 'Ahmad Faisal' },
        { case_member_id: 'user1', case_member_type: 'client', case_member_role: 'Client' }
      ]
    }
  ],
  documents: [
    {
      _id: 'doc1',
      doc_title: 'Surat Perjanjian',
      doc_type: 'Contract',
      doc_description: 'Dokumen perjanjian kerjasama',
      doc_link_file: 'https://example.com/doc1.pdf',
      doc_link_onlineDrive: 'https://drive.google.com/file/d/example/view',
      uploaded_at: '2025-03-15T10:30:00',
      doc_case_related: 'case1',
      uploadedByUserName: { username: 'Dewi Putri' },
      lastAccessedByUserName: { username: 'Guest User' },
      relatedCaseName: { case_title: 'Kasus Perdata Pembagian Harta' }
    },
    {
      _id: 'doc2',
      doc_title: 'Bukti Pembayaran',
      doc_type: 'Evidence',
      doc_description: 'Bukti pembayaran transaksi',
      doc_link_file: 'https://example.com/doc2.pdf',
      doc_link_onlineDrive: 'https://drive.google.com/file/d/example2/view',
      uploaded_at: '2025-03-20T14:15:00',
      doc_case_related: 'case2',
      uploadedByUserName: { username: 'Ahmad Faisal' },
      lastAccessedByUserName: { username: 'Guest User' },
      relatedCaseName: { case_title: 'Kasus Bisnis Cidera Janji' }
    }
  ],
  appointments: {
    appointments: [
      {
        _id: 'appointment1',
        title: 'Konsultasi Hukum - Kasus Pembagian Harta',
        location: 'Kantor WWP Law Firm',
        dateStart: '2025-04-05',
        dateEnd: '2025-04-05',
        timeStart: '09:00',
        timeEnd: '10:30',
        details: 'Konsultasi mengenai langkah selanjutnya dalam kasus pembagian harta',
        status: 'scheduled',
        creator: 'Dewi Putri',
        attendees: [
          { name: 'Guest Client', response: 'accepted' },
          { name: 'Dewi Putri', response: 'accepted' }
        ]
      },
      {
        _id: 'appointment2',
        title: 'Sidang Kasus Cidera Janji',
        location: 'Pengadilan Negeri Jakarta Pusat',
        dateStart: '2025-04-12',
        dateEnd: '2025-04-12',
        timeStart: '13:00',
        timeEnd: '15:00',
        details: 'Sidang pembacaan putusan kasus cidera janji',
        status: 'scheduled',
        creator: 'Ahmad Faisal',
        attendees: [
          { name: 'Guest Client', response: 'pending' },
          { name: 'Ahmad Faisal', response: 'accepted' }
        ]
      }
    ]
  },
  users: [
    {
      _id: 'user1',
      username: 'Budi Santoso',
      email: 'budi@example.com',
      number: '+6281234567890',
      address: 'Jl. Sudirman No. 123, Jakarta',
      type: 'client'
    }
  ],
  employees: [
    {
      _id: 'lawyer1',
      username: 'Dewi Putri',
      email: 'dewi@wwplawfirm.com',
      number: '+6287654321098',
      address: 'Jl. Thamrin No. 45, Jakarta',
      type: 'partner'
    },
    {
      _id: 'lawyer2',
      username: 'Ahmad Faisal',
      email: 'ahmad@wwplawfirm.com',
      number: '+6289876543210',
      address: 'Jl. Gatot Subroto No. 67, Jakarta',
      type: 'associates'
    }
  ],
  statistics: {
    caseStatistic: {
      open: 3,
      close: 2,
      pending: 1
    },
    userStatistic: {
      admins: 1,
      paralegals: 2,
      clients: 5,
      partners: 2,
      associates: 3
    }
  }
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
    // Guest mode tidak menggunakan API call yang nyata
    if (isGuestUser()) {
      const guestType = localStorage.getItem('userType');
      return {
        token: getToken(),
        name: guestType === 'admin' ? 'Guest Admin' : 'Guest Client',
        type: guestType
      };
    }
    
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
    if (isGuestUser()) {
      return { message: 'User registered successfully' };
    }
    
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
    
    // Jika guest user, selalu kembalikan true
    if (isGuestUser()) {
      return true;
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
    localStorage.removeItem('isGuest');
    window.location.href = '/login.html';
  }
};

// Cases API
const casesAPI = {
  getCases: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.cases;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCase: async (caseId) => {
    if (isGuestUser()) {
      const foundCase = DUMMY_DATA.cases.find(c => c._id === caseId);
      if (foundCase) return foundCase;
      throw new Error('Case not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createCase: async (caseData) => {
    if (isGuestUser()) {
      // Buat kasus dummy dengan ID acak
      const newCase = {
        ...caseData,
        _id: 'case-' + Date.now()
      };
      DUMMY_DATA.cases.push(newCase);
      return newCase;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(caseData),
    });
    
    return handleResponse(response);
  },
  
  updateCase: async (caseId, caseData) => {
    if (isGuestUser()) {
      const caseIndex = DUMMY_DATA.cases.findIndex(c => c._id === caseId);
      if (caseIndex >= 0) {
        DUMMY_DATA.cases[caseIndex] = { ...DUMMY_DATA.cases[caseIndex], ...caseData };
        return DUMMY_DATA.cases[caseIndex];
      }
      throw new Error('Case not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(caseData),
    });
    
    return handleResponse(response);
  },
  
  deleteCase: async (caseId) => {
    if (isGuestUser()) {
      const caseIndex = DUMMY_DATA.cases.findIndex(c => c._id === caseId);
      if (caseIndex >= 0) {
        const deletedCase = DUMMY_DATA.cases[caseIndex];
        DUMMY_DATA.cases.splice(caseIndex, 1);
        return deletedCase;
      }
      throw new Error('Case not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getCaseMessages: async (caseId) => {
    if (isGuestUser()) {
      return { message_list: [] };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/message`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Documents API
const documentsAPI = {
  getAllDocuments: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.documents;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/documents/all`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getDocumentsByCaseId: async (caseId) => {
    if (isGuestUser()) {
      return DUMMY_DATA.documents.filter(doc => doc.doc_case_related === caseId);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/documents/all/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getDocument: async (docId, caseId) => {
    if (isGuestUser()) {
      const doc = DUMMY_DATA.documents.find(d => d._id === docId);
      if (doc) return doc;
      throw new Error('Document not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/${caseId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createDocument: async (formData) => {
    if (isGuestUser()) {
      // Dalam mode guest, kita tidak bisa upload file sungguhan
      // Tapi kita bisa berpura-pura menambahkan entri dokumen
      const newDoc = {
        _id: 'doc-' + Date.now(),
        doc_title: formData.get('doc_title'),
        doc_type: formData.get('doc_type'),
        doc_description: formData.get('doc_description'),
        doc_case_related: formData.get('doc_case_related'),
        doc_link_file: 'https://example.com/dummy.pdf',
        doc_link_onlineDrive: 'https://drive.google.com/dummy',
        uploaded_at: new Date().toISOString(),
        uploadedByUserName: { username: localStorage.getItem('userName') },
        lastAccessedByUserName: { username: localStorage.getItem('userName') },
        relatedCaseName: { 
          case_title: DUMMY_DATA.cases.find(c => c._id === formData.get('doc_case_related'))?.case_title || 'Unknown Case' 
        }
      };
      
      DUMMY_DATA.documents.push(newDoc);
      return newDoc;
    }
    
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
    if (isGuestUser()) {
      const docIndex = DUMMY_DATA.documents.findIndex(d => d._id === docData.q.q_id);
      if (docIndex >= 0) {
        DUMMY_DATA.documents[docIndex] = { ...DUMMY_DATA.documents[docIndex], ...docData };
        return DUMMY_DATA.documents[docIndex];
      }
      throw new Error('Document not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(docData),
    });
    
    return handleResponse(response);
  },
  
  deleteDocument: async (docId, caseId) => {
    if (isGuestUser()) {
      const docIndex = DUMMY_DATA.documents.findIndex(d => d._id === docId);
      if (docIndex >= 0) {
        const deletedDoc = DUMMY_DATA.documents[docIndex];
        DUMMY_DATA.documents.splice(docIndex, 1);
        return deletedDoc;
      }
      throw new Error('Document not found');
    }
    
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
    if (isGuestUser()) {
      return DUMMY_DATA.appointments;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getAppointment: async (appointmentId) => {
    if (isGuestUser()) {
      const appointment = DUMMY_DATA.appointments.appointments.find(a => a._id === appointmentId);
      if (appointment) return appointment;
      throw new Error('Appointment not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createAppointment: async (appointmentData) => {
    if (isGuestUser()) {
      const newAppointment = {
        ...appointmentData,
        _id: 'appointment-' + Date.now(),
        status: 'scheduled'
      };
      DUMMY_DATA.appointments.appointments.push(newAppointment);
      return {
        username: localStorage.getItem('userName'),
        isAdmin: localStorage.getItem('userType') === 'admin',
        appointments: DUMMY_DATA.appointments.appointments
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });
    
    return handleResponse(response);
  },
  
  updateAppointment: async (appointmentId, appointmentData) => {
    if (isGuestUser()) {
      const appointmentIndex = DUMMY_DATA.appointments.appointments.findIndex(a => a._id === appointmentId);
      if (appointmentIndex >= 0) {
        DUMMY_DATA.appointments.appointments[appointmentIndex] = { 
          ...DUMMY_DATA.appointments.appointments[appointmentIndex], 
          ...appointmentData 
        };
        return {
          username: localStorage.getItem('userName'),
          isAdmin: localStorage.getItem('userType') === 'admin',
          appointments: DUMMY_DATA.appointments.appointments
        };
      }
      throw new Error('Appointment not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });
    
    return handleResponse(response);
  },
  
  cancelAppointment: async (appointmentId) => {
    if (isGuestUser()) {
      const appointmentIndex = DUMMY_DATA.appointments.appointments.findIndex(a => a._id === appointmentId);
      if (appointmentIndex >= 0) {
        DUMMY_DATA.appointments.appointments[appointmentIndex].status = 'cancelled';
        return {
          username: localStorage.getItem('userName'),
          isAdmin: localStorage.getItem('userType') === 'admin',
          appointments: DUMMY_DATA.appointments.appointments
        };
      }
      throw new Error('Appointment not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUserList: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.users.map(user => user.username);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments/userlist`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  updateUserResponse: async (appointmentId, responseData) => {
    if (isGuestUser()) {
      const appointmentIndex = DUMMY_DATA.appointments.appointments.findIndex(a => a._id === appointmentId);
      if (appointmentIndex >= 0) {
        const userIndex = DUMMY_DATA.appointments.appointments[appointmentIndex].attendees.findIndex(
          a => a.name === localStorage.getItem('userName')
        );
        
        if (userIndex >= 0) {
          DUMMY_DATA.appointments.appointments[appointmentIndex].attendees[userIndex].response = responseData.response;
        }
        
        return {
          username: localStorage.getItem('userName'),
          isAdmin: localStorage.getItem('userType') === 'admin',
          appointments: DUMMY_DATA.appointments.appointments
        };
      }
      throw new Error('Appointment not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/appointments/response/${appointmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ response: responseData }),
    });
    
    return handleResponse(response);
  }
};

// Statistics API
const statisticsAPI = {
  getDashboardStatistics: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.statistics;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/statistics/dashboard`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getNotifications: async () => {
    if (isGuestUser()) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/api/statistics/notifications`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// CRM API
const crmAPI = {
  getUsers: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.users;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getEmployees: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.employees;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm/employee`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUser: async (userId) => {
    if (isGuestUser()) {
      if (userId === 'self') {
        const userType = localStorage.getItem('userType');
        return {
          _id: 'user-self',
          username: localStorage.getItem('userName'),
          email: userType === 'admin' ? 'admin@example.com' : 'client@example.com',
          number: '+6281234567890',
          address: 'Jl. Contoh No. 123, Jakarta',
          type: userType
        };
      }
      
      const user = [...DUMMY_DATA.users, ...DUMMY_DATA.employees].find(u => u._id === userId);
      if (user) return user;
      throw new Error('User not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createUser: async (userData) => {
    if (isGuestUser()) {
      // Tambahkan user baru ke data dummy
      const newUser = {
        ...userData,
        _id: 'user-' + Date.now()
      };
      
      if (userData.type === 'client') {
        DUMMY_DATA.users.push(newUser);
      } else {
        DUMMY_DATA.employees.push(newUser);
      }
      
      return newUser;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  updateUser: async (userId, userData) => {
    if (isGuestUser()) {
      if (userId === 'self') {
        // Update data guest user
        localStorage.setItem('userName', userData.username || localStorage.getItem('userName'));
        
        return {
          _id: 'user-self',
          username: userData.username || localStorage.getItem('userName'),
          email: userData.email || 'guest@example.com',
          number: userData.number || '+6281234567890',
          address: userData.address || 'Jl. Contoh No. 123, Jakarta',
          type: localStorage.getItem('userType')
        };
      }
      
      // Update data dummy user lain
      let userIndex = DUMMY_DATA.users.findIndex(u => u._id === userId);
      let collection = 'users';
      
      if (userIndex === -1) {
        userIndex = DUMMY_DATA.employees.findIndex(u => u._id === userId);
        collection = 'employees';
      }
      
      if (userIndex >= 0) {
        DUMMY_DATA[collection][userIndex] = { 
          ...DUMMY_DATA[collection][userIndex], 
          ...userData 
        };
        return DUMMY_DATA[collection][userIndex];
      }
      
      throw new Error('User not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  updatePassword: async (oldPassword, newPassword) => {
    if (isGuestUser()) {
      return { message: 'Password updated successfully' };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm/p`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldpassword: oldPassword, newpassword: newPassword }),
    });
    
    return handleResponse(response);
  },
  
  deleteUser: async (userId) => {
    if (isGuestUser()) {
      let userIndex = DUMMY_DATA.users.findIndex(u => u._id === userId);
      let collection = 'users';
      
      if (userIndex === -1) {
        userIndex = DUMMY_DATA.employees.findIndex(u => u._id === userId);
        collection = 'employees';
      }
      
      if (userIndex >= 0) {
        const deletedUser = DUMMY_DATA[collection][userIndex];
        DUMMY_DATA[collection].splice(userIndex, 1);
        return deletedUser;
      }
      
      throw new Error('User not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/crm/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  }
};

// Tasks API dengan dukungan untuk guest mode
const tasksAPI = {
  getTasks: async () => {
    if (isGuestUser()) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  createTask: async (taskData) => {
    if (isGuestUser()) {
      return { _id: 'task-' + Date.now(), ...taskData };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    
    return handleResponse(response);
  },
  
  // Implementasi metode lainnya...
  getTasksForUser: async () => {
    if (isGuestUser()) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks/user`, {
      headers: getHeaders(),
    });
    
    return handleResponse(response);
  },
  
  getUserList: async () => {
    if (isGuestUser()) {
      return DUMMY_DATA.users.map(user => ({ _id: user._id, username: user.username }));
    }
    
    const response = await fetch(`${API_BASE_URL}/api/tasks/userlist`, {
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
    
    // Jika guest user, selalu kembalikan true
    if (isGuestUser()) {
      return true;
    }
    
    try {
      // Untuk user biasa, bisa ditambahkan validasi token ke server
      return true;
    } catch (error) {
      console.error('Error validasi token:', error);
      clearToken();
      return false;
    }
  },
  
  logout: () => {
    clearToken();
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('isGuest');
    window.location.href = 'login.html';
  }
};