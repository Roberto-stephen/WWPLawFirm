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
    // Untuk implementasi lebih lanjut, bisa ditambahkan validasi token ke server
    // const response = await fetch('/auth/validate-token', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // if (!response.ok) throw new Error('Token tidak valid');
    
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
  
  // Jika halaman admin, periksa apakah pengguna adalah admin/partner/associates/paralegal
  if (adminPages.includes(fileName)) {
    if (userType === 'client') {
      window.location.href = 'index.html';
      return false;
    }
  }
  
  // Jika halaman client, periksa apakah pengguna adalah client
  if (clientPages.includes(fileName)) {
    if (userType !== 'client') {
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
  
  // Dapat ditambahkan: Update avatar pengguna jika tersedia
  // const avatarUrl = localStorage.getItem('avatar_url');
  // const avatarElement = document.getElementById('user-avatar');
  // if (avatarUrl && avatarElement) {
  //   avatarElement.src = avatarUrl;
  // }
  
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
  // Jika ini adalah halaman login, tidak perlu pengecekan
  if (window.location.pathname.includes('login.html')) {
    return;
  }
  
  // Jalankan pengecekan autentikasi
  const isAuthenticated = await checkAuthentication();
  if (isAuthenticated) {
    // Jika terotentikasi, periksa apakah memiliki akses ke halaman
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
  
  // Cek notifikasi (jika ada)
  await checkNotifications();
});

/**
 * Fungsi untuk memeriksa notifikasi
 */
async function checkNotifications() {
  const notificationBadge = document.getElementById('notification-badge');
  
  if (!notificationBadge) return;
  
  try {
    const response = await fetch('/api/notifications', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Untuk mengirim cookie
    });
    
    if (response.ok) {
      const notifications = await response.json();
      const unreadCount = notifications.filter(n => !n.read).length;
      
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'inline-block';
      } else {
        notificationBadge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}