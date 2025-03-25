// Fungsi-fungsi umum untuk UI

// Check apakah user sudah login
const checkAuthentication = async () => {
    const isAuthenticated = await API.auth.checkAuth();
    
    if (!isAuthenticated) {
      window.location.href = '/login.html';
      return false;
    }
    
    return true;
  };
  
  // Menampilkan alert message
  const showAlert = (message, type = 'info') => {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => {
        alertContainer.removeChild(alertDiv);
      }, 300);
    }, 5000);
  };
  
  // Format tanggal
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Format tanggal dengan waktu
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Tampilkan loading spinner
  const showLoading = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="loader-container">
        <div class="loader"></div>
      </div>
    `;
  };
  
  // Sembunyikan loading spinner
  const hideLoading = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const loader = container.querySelector('.loader-container');
    if (loader) {
      container.removeChild(loader);
    }
  };
  
  // Modal handling - DEPRECATED, gunakan fungsi di modal-fix.js
  // Fungsi ini dipertahankan untuk kompatibilitas dengan kode lama
  const openModal = (modalId) => {
    // Cek apakah fungsi dari modal-fix.js sudah tersedia
    if (typeof window.openModal === 'function') {
      window.openModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      modal.classList.add('show');
    }
  };
  
  // Fungsi ini dipertahankan untuk kompatibilitas dengan kode lama
  const closeModal = (modalId) => {
    // Cek apakah fungsi dari modal-fix.js sudah tersedia
    if (typeof window.closeModal === 'function') {
      window.closeModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      modal.classList.remove('show');
    }
  };
  
  // Navbar & user info
  const updateUserInfo = async () => {
    try {
      // Get user info from localStorage
      const userName = localStorage.getItem('userName');
      
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && userName) {
        userNameElement.textContent = userName;
      }
      
      // Try to get additional user info if needed
      try {
        // Get self user info
        const userData = await API.crm.getUser('self');
        
        // Update avatar if exists
        const userAvatarElement = document.getElementById('user-avatar');
        if (userAvatarElement && userData.avatar_url) {
          userAvatarElement.src = userData.avatar_url;
        }
      } catch (e) {
        console.log('Could not fetch detailed user info');
      }
      
      // Update notification badge
      updateNotificationBadge();
      
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  
  // Update notification badge
  const updateNotificationBadge = async () => {
    try {
      const notifications = await API.statistics.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      
      const notificationBadge = document.getElementById('notification-badge');
      if (notificationBadge) {
        if (unreadCount > 0) {
          notificationBadge.textContent = unreadCount;
          notificationBadge.style.display = 'flex';
        } else {
          notificationBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      showLoading('dashboard-stats');
      
      const stats = await API.statistics.getDashboardStatistics();
      
      // Update case stats
      const openCasesElement = document.getElementById('open-cases-count');
      if (openCasesElement) openCasesElement.textContent = stats.caseStatistic.open;
      
      const closedCasesElement = document.getElementById('closed-cases-count');
      if (closedCasesElement) closedCasesElement.textContent = stats.caseStatistic.close;
      
      const pendingCasesElement = document.getElementById('pending-cases-count');
      if (pendingCasesElement) pendingCasesElement.textContent = stats.caseStatistic.pending;
      
      // Update user stats
      const clientCountElement = document.getElementById('client-count');
      if (clientCountElement) clientCountElement.textContent = stats.userStatistic.clients;
      
      const lawyerCountElement = document.getElementById('lawyer-count');
      if (lawyerCountElement) {
        lawyerCountElement.textContent = 
          stats.userStatistic.associates + stats.userStatistic.partners;
      }
      
      hideLoading('dashboard-stats');
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      showAlert('Gagal memuat statistik dashboard', 'danger');
      hideLoading('dashboard-stats');
    }
  };
  
  // Load dashboard appointments
  const loadDashboardAppointments = async () => {
    try {
      showLoading('appointment-table');
      
      const appointments = await API.appointments.getAppointments();
      
      const tableBody = document.querySelector('#appointment-table tbody');
      if (!tableBody) return;
      
      tableBody.innerHTML = '';
      
      // Sort by date
      appointments.appointments.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));
      
      // Get only upcoming appointments (max 5)
      const upcomingAppointments = appointments.appointments
        .filter(appointment => appointment.status === 'scheduled' && new Date(appointment.dateStart) >= new Date())
        .slice(0, 5);
      
      if (upcomingAppointments.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">Tidak ada janji temu yang akan datang</td>
          </tr>
        `;
      } else {
        upcomingAppointments.forEach(appointment => {
          const row = document.createElement('tr');
          
          // Format date
          const dateStart = formatDate(appointment.dateStart);
          const timeDisplay = appointment.timeStart ? `${appointment.timeStart} - ${appointment.timeEnd}` : 'Sepanjang hari';
          
          row.innerHTML = `
            <td>${appointment.title}</td>
            <td>${appointment.location}</td>
            <td>${dateStart}</td>
            <td>${timeDisplay}</td>
            <td>
              <a href="appointment-detail.html?id=${appointment._id}" class="btn btn-primary btn-sm">Detail</a>
            </td>
          `;
          
          tableBody.appendChild(row);
        });
      }
      
      hideLoading('appointment-table');
    } catch (error) {
      console.error('Error loading appointments:', error);
      showAlert('Gagal memuat data janji temu', 'danger');
      hideLoading('appointment-table');
    }
  };
  
  // Load dashboard cases
  const loadDashboardCases = async () => {
    try {
      showLoading('case-table');
      
      const cases = await API.cases.getCases();
      
      const tableBody = document.querySelector('#case-table tbody');
      if (!tableBody) return;
      
      tableBody.innerHTML = '';
      
      // Sort by priority (high first) and then by status (open first)
      cases.sort((a, b) => {
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const statusOrder = { 'Open': 0, 'Pending': 1, 'Closed': 2 };
        
        if (priorityOrder[a.case_priority] !== priorityOrder[b.case_priority]) {
          return priorityOrder[a.case_priority] - priorityOrder[b.case_priority];
        }
        
        return statusOrder[a.case_status] - statusOrder[b.case_status];
      });
      
      // Get only top 5 cases
      const topCases = cases.slice(0, 5);
      
      if (topCases.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">Tidak ada kasus ditemukan</td>
          </tr>
        `;
      } else {
        topCases.forEach(caseItem => {
          const row = document.createElement('tr');
          
          // Status badge class
          let statusClass = 'badge-info';
          if (caseItem.case_status === 'Open') statusClass = 'badge-success';
          if (caseItem.case_status === 'Closed') statusClass = 'badge-danger';
          if (caseItem.case_status === 'Pending') statusClass = 'badge-warning';
          
          // Priority badge class
          let priorityClass = 'badge-info';
          if (caseItem.case_priority === 'High') priorityClass = 'badge-danger';
          if (caseItem.case_priority === 'Medium') priorityClass = 'badge-warning';
          if (caseItem.case_priority === 'Low') priorityClass = 'badge-success';
          
          row.innerHTML = `
            <td>${caseItem.case_title}</td>
            <td>${caseItem.case_type}</td>
            <td><span class="badge ${statusClass}">${caseItem.case_status}</span></td>
            <td><span class="badge ${priorityClass}">${caseItem.case_priority}</span></td>
            <td>
              <a href="case-detail.html?id=${caseItem._id}" class="btn btn-primary btn-sm">Detail</a>
            </td>
          `;
          
          tableBody.appendChild(row);
        });
      }
      
      hideLoading('case-table');
    } catch (error) {
      console.error('Error loading cases:', error);
      showAlert('Gagal memuat data kasus', 'danger');
      hideLoading('case-table');
    }
  };
  
  // Document ready
  document.addEventListener('DOMContentLoaded', async () => {
    // Update user info
    updateUserInfo();
    
    // Set up logout handler
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = 'login.html';
      });
    }
    
    // Page specific initialization
    if (document.body.classList.contains('dashboard-page')) {
      loadDashboardStats();
      loadDashboardAppointments();
      loadDashboardCases();
    }
    
    // Case page initialization
    if (document.body.classList.contains('case-page')) {
      if (typeof loadCases === 'function') {
        loadCases();
      }
    }
    
    // Case detail page
    if (document.body.classList.contains('case-detail-page')) {
      const urlParams = new URLSearchParams(window.location.search);
      const caseId = urlParams.get('id');
      
      if (caseId && typeof loadCaseDetail === 'function') {
        loadCaseDetail(caseId);
      } else if (caseId) {
        showAlert('Fungsi loadCaseDetail tidak tersedia', 'danger');
      } else {
        showAlert('ID kasus tidak ditemukan', 'danger');
      }
    }
    
    // Documents page
    if (document.body.classList.contains('document-page')) {
      if (typeof loadDocuments === 'function') {
        loadDocuments();
      }
    }
    
    // Appointment page
    if (document.body.classList.contains('appointment-page')) {
      if (typeof loadAppointments === 'function') {
        loadAppointments();
      }
    }
    
    // Task page
    if (document.body.classList.contains('task-page')) {
      if (typeof loadTasks === 'function') {
        loadTasks();
      }
    }
  });