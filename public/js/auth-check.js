/**
 * WWP Law Firm - Authentication Check System
 * File ini mengontrol pengecekan autentikasi di semua halaman
 */

/**
 * Fungsi untuk memeriksa apakah pengguna sudah login
 * @returns {boolean} Status autentikasi pengguna
 */
async function checkAuthentication() {
  // Periksa token di localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect ke halaman login jika tidak ada token
    window.location.href = 'login.html';
    return false;
  }
  
  try {
    // Verifikasi token dengan server
    const baseUrl = window.location.origin;
    const verifyUrl = `${baseUrl}/api/auth/verify`;
    
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Token tidak valid');
    }
    
    // Set nama pengguna di header
    updateUserInfo();
    return true;
  } catch (error) {
    console.error('Error validasi token:', error);
    logout();
    return false;
  }
}

/**
 * Memeriksa apakah pengguna memiliki akses ke halaman berdasarkan tipe pengguna
 * @returns {boolean} Status akses pengguna
 */
function checkUserAccess() {
  const userType = localStorage.getItem('userType');
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';
  
  // Halaman admin
  const adminPages = [
    'admin-dashboard.html',
    'user-management.html',
    'system-log.html',
    'backup.html',
    'cases.html',
    'lawyers.html',
    'clients.html',
    'court.html',
    'documents.html',
    'finance.html',
    'reports.html',
    'appointments.html'
  ];
  
  // Halaman khusus client
  const clientPages = [
    'index.html',
    'my-cases.html',
    'my-documents.html',
    'my-appointments.html',
    'profile.html',
    'change-password.html',
    'support.html'
  ];
  
  console.log("Current file:", fileName, "User type:", userType);
  
  // Jika halaman admin, periksa apakah pengguna adalah admin/partner/associates/paralegal
  if (adminPages.includes(fileName)) {
    if (userType === 'client') {
      console.log("Client trying to access admin page. Redirecting to client dashboard.");
      window.location.href = 'index.html';
      return false;
    }
  }
  
  // Jika halaman client, periksa apakah pengguna adalah client
  if (clientPages.includes(fileName)) {
    if (userType !== 'client' && fileName !== 'index.html') {
      console.log("Non-client trying to access client page. Redirecting to admin dashboard.");
      window.location.href = 'admin-dashboard.html';
      return false;
    }
  }
  
  return true;
}

/**
 * Update informasi pengguna di header
 */
function updateUserInfo() {
  const userName = localStorage.getItem('userName');
  const userType = localStorage.getItem('userType');
  
  // Update nama pengguna di header
  const userNameElement = document.getElementById('user-name');
  if (userName && userNameElement) {
    userNameElement.textContent = userName;
  }
  
  // Tampilkan menu khusus berdasarkan tipe pengguna
  if (userType) {
    document.body.setAttribute('data-user-type', userType);
  }
}

/**
 * Fungsi logout
 */
function logout() {
  // Hapus token dan informasi pengguna dari localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userType');
  
  // Hapus cookie token (jika ada)
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect ke halaman login
  window.location.href = 'login.html';
}

// Event listener saat DOM sudah siap
document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log("Authentication check started");
    
    // Jika ini adalah halaman login, tidak perlu pengecekan
    if (window.location.pathname.includes('login.html')) {
      console.log("Login page detected. Skipping authentication check.");
      return;
    }
    
    // Jalankan pengecekan autentikasi
    console.log("Running authentication check...");
    const isAuthenticated = await checkAuthentication();
    console.log("Authentication result:", isAuthenticated);
    
    if (isAuthenticated) {
      // Jika terotentikasi, periksa apakah memiliki akses ke halaman
      console.log("Checking user access...");
      checkUserAccess();
    }
    
    // Setup tombol logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
    
    // Cek notifikasi (jika ada) dengan error handling yang lebih baik
    try {
      await safeCheckNotifications();
    } catch (error) {
      console.error("Failed to check notifications, but continuing:", error);
    }
  } catch (error) {
    console.error("Error during authentication check:", error);
    // Handle gracefully - redirect to login if needed
    window.location.href = 'login.html';
  }
});

/**
 * Fungsi yang lebih aman untuk memeriksa notifikasi
 */
async function safeCheckNotifications() {
  const notificationBadge = document.getElementById('notification-badge');
  
  if (!notificationBadge) {
    console.log("Notification badge not found in page, skipping notification check");
    return;
  }
  
  try {
    // Semua request seharusnya menggunakan token yang sama
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No authentication token found, skipping notification check");
      return;
    }
    
    // Gunakan fetch dengan timeout dan error handling yang baik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const baseUrl = window.location.origin;
    const notifUrl = `${baseUrl}/api/notifications`;
    
    console.log("Fetching notifications from:", notifUrl);
    
    const response = await fetch(notifUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).catch(error => {
      console.log("Network error fetching notifications:", error.message);
      return null;
    });
    
    clearTimeout(timeoutId);
    
    // Jika response null (fetch gagal) atau tidak OK, skip
    if (!response || !response.ok) {
      console.log("Notification endpoint unavailable, status:", response?.status);
      return;
    }
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log("Non-JSON response from notifications endpoint");
      return;
    }
    
    const notifications = await response.json();
    
    // Validasi bahwa notifications adalah array
    if (!Array.isArray(notifications)) {
      console.log("Invalid notifications data structure");
      return;
    }
    
    const unreadCount = notifications.filter(n => n && !n.read).length;
    console.log("Unread notifications:", unreadCount);
    
    if (unreadCount > 0) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = 'inline-block';
    } else {
      notificationBadge.style.display = 'none';
    }
  } catch (error) {
    console.error('Error in notification processing:', error);
    // Jangan crash - ini fitur non-kritis
  }
}