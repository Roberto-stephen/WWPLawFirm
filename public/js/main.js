/**
 * Fungsi-fungsi utilitas umum untuk WWP Law Firm
 * File ini berisi fungsi-fungsi yang digunakan di seluruh aplikasi
 */

// =========== FUNGSI UTILITAS UI ===========

/**
 * Tampilkan pesan alert kepada pengguna
 * @param {string} message - Pesan yang ditampilkan
 * @param {string} type - Jenis alert: success, info, warning, danger
 * @param {number} duration - Durasi tampilan dalam milidetik (default: 5000)
 */
function showAlert(message, type = 'info', duration = 5000) {
  console.log(`Alert: ${type} - ${message}`);
  
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    console.error('Alert container not found');
    return;
  }
  
  // Buat elemen alert
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = message;
  
  alertContainer.appendChild(alertDiv);
  
  // Auto hide after duration
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    setTimeout(() => {
      if (alertContainer.contains(alertDiv)) {
        alertContainer.removeChild(alertDiv);
      }
    }, 300);
  }, duration);
}

/**
 * Tampilkan loading spinner
 * @param {string} elementId - ID elemen yang akan ditambahkan loading spinner
 */
function showLoading(elementId) {
  console.log(`Showing loading for: ${elementId}`);
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element not found: ${elementId}`);
    return;
  }
  
  // Jika elemen adalah tabel, tampilkan pesan loading
  if (element.tagName === 'TABLE') {
    const tbody = element.querySelector('tbody');
    if (tbody) {
      const colSpan = element.querySelectorAll('th').length || 1;
      tbody.innerHTML = `
        <tr>
          <td colspan="${colSpan}" class="text-center">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </td>
        </tr>
      `;
    }
  } else {
    // Untuk elemen lain
    element.innerHTML = `<div class="text-center"><div class="loader"></div></div>`;
  }
}

/**
 * Sembunyikan loading spinner
 * @param {string} elementId - ID elemen yang akan dihapus loading spinner
 */
function hideLoading(elementId) {
  console.log(`Hiding loading for: ${elementId}`);
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element not found: ${elementId}`);
    return;
  }
  
  // Untuk tabel, jangan hapus semua isi
  if (element.tagName === 'TABLE') {
    // Loading akan digantikan dengan konten yang sebenarnya
    return;
  }
  
  // Untuk elemen lain, hapus loading container
  const loaderContainer = element.querySelector('.text-center');
  if (loaderContainer && loaderContainer.querySelector('.loader')) {
    loaderContainer.remove();
  }
}

/**
 * Buka modal
 * @param {string} modalId - ID elemen modal yang akan dibuka
 */
function openModal(modalId) {
  console.log('Opening modal:', modalId);
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error('Modal not found:', modalId);
    return;
  }
  
  // Tampilkan modal dengan animasi
  modal.style.display = 'flex';
  
  // Force reflow
  void modal.offsetWidth;
  
  // Pastikan modal mendapat focus
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }, 100);
  
  // Tambahkan event listener untuk tombol close
  const closeButtons = modal.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.onclick = function() {
      closeModal(modalId);
    };
  });
  
  // Tambahkan event listener untuk klik di luar modal
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal(modalId);
    }
  });
  
  // Tambahkan event listener untuk ESC key
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeModal(modalId);
      document.removeEventListener('keydown', escHandler);
    }
  });
}

/**
 * Tutup modal
 * @param {string} modalId - ID elemen modal yang akan ditutup
 */
function closeModal(modalId) {
  console.log('Closing modal:', modalId);
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error('Modal not found:', modalId);
    return;
  }
  
  // Animasi close
  modal.style.opacity = '0';
  
  // Delay hiding the modal to allow animation
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.opacity = '1';
    
    // Reset form jika ada
    const form = modal.querySelector('form');
    if (form) form.reset();
  }, 300);
}

// =========== FUNGSI FORMAT ===========

/**
 * Format tanggal ke format yang lebih mudah dibaca
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {boolean} includeTime - Apakah akan menyertakan waktu
 * @returns {string} - Tanggal yang sudah diformat
 */
function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString.toString();
    }
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString.toString();
  }
}

/**
 * Format angka ke format mata uang
 * @param {number} amount - Jumlah yang akan diformat
 * @param {string} currency - Mata uang (default: 'IDR')
 * @returns {string} - Jumlah yang sudah diformat
 */
function formatCurrency(amount, currency = 'IDR') {
  if (amount == null) return '-';
  
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount}`;
  }
}

// =========== FUNGSI VALIDASI ===========

/**
 * Validasi email
 * @param {string} email - Email yang akan divalidasi
 * @returns {boolean} - Hasil validasi
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validasi nomor telepon Indonesia
 * @param {string} phone - Nomor telepon yang akan divalidasi
 * @returns {boolean} - Hasil validasi
 */
function validatePhone(phone) {
  // Format: +62xxxxxxxxxxx atau 08xxxxxxxxxx
  const re = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return re.test(String(phone).replace(/[\s-]/g, ''));
}

// =========== FUNGSI AUTENTIKASI ===========

/**
 * Periksa autentikasi pengguna
 * @returns {Promise<boolean>} - Status autentikasi
 */
async function checkAuthentication() {
  try {
    console.log("Checking authentication");
    // Periksa apakah token tersedia
    const isAuthenticated = await window.API.auth.checkAuth();
    
    if (!isAuthenticated) {
      console.log("Authentication failed, redirecting to login");
      window.location.href = 'login.html';
      return false;
    }
    
    // Update user info
    console.log("Authentication successful");
    updateUserInfo();
    
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    window.location.href = 'login.html';
    return false;
  }
}

/**
 * Update informasi pengguna di UI
 */
async function updateUserInfo() {
  try {
    console.log("Updating user info in UI");
    // Dapatkan info dari localStorage
    const userName = localStorage.getItem('userName');
    const userType = localStorage.getItem('userType');
    
    // Update username di navbar
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && userName) {
      userNameElement.textContent = userName;
    }
    
    // Update avatar jika ada
    try {
      console.log("Fetching user details from /api/crm/me");
      
      const response = await fetch('http://localhost:9000/api/crm/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log("User data received:", userData);
      
      // Update avatar jika tersedia
      const userAvatarElement = document.getElementById('user-avatar');
      if (userAvatarElement && userData.avatar_url) {
        userAvatarElement.src = userData.avatar_url;
      } else if (userAvatarElement) {
        // Fallback to default avatar
        userAvatarElement.src = "https://via.placeholder.com/30";
      }
      
    } catch (error) {
      console.error('Could not fetch user details:', error);
      // Fallback untuk avatar - menggunakan default
      const userAvatarElement = document.getElementById('user-avatar');
      if (userAvatarElement) {
        userAvatarElement.src = "https://via.placeholder.com/30";
      }
    }
    
    // Setup tombol logout
    setupLogoutButton();
    
    // Sesuaikan tampilan berdasarkan tipe pengguna
    adjustUIByUserType(userType);
  } catch (error) {
    console.error('Error updating user info:', error);
  }
}

/**
 * Setup tombol logout
 */
function setupLogoutButton() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.API.auth.logout();
    });
  }
}

/**
 * Sesuaikan UI berdasarkan tipe pengguna
 * @param {string} userType - Tipe pengguna (admin, partner, associates, paralegal, client)
 */
function adjustUIByUserType(userType) {
  if (userType === 'client') {
    // Sembunyikan menu admin
    const adminMenus = document.querySelectorAll('.menu-section:last-child');
    adminMenus.forEach(menu => {
      menu.style.display = 'none';
    });
  }
}

// =========== INISIALISASI HALAMAN ===========

// Document ready handler
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Document ready, setting up app...');
  
  // Setup manual modal triggers
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Check for data-modal attribute
    if (target.hasAttribute('data-modal')) {
      event.preventDefault();
      openModal(target.getAttribute('data-modal'));
      return;
    }
    
    // Check for onclick="openModal()" in attributes
    if (target.hasAttribute('onclick')) {
      const onclickAttr = target.getAttribute('onclick');
      if (onclickAttr.includes('openModal')) {
        event.preventDefault();
        
        // Extract modal ID
        const modalIdMatch = onclickAttr.match(/openModal\(['"]([^'"]+)['"]\)/);
        if (modalIdMatch && modalIdMatch[1]) {
          const modalId = modalIdMatch[1];
          console.log(`Intercepted click on element with openModal: ${modalId}`);
          openModal(modalId);
        }
      }
    }
  });
  
  // Check if we need to authenticate
  if (window.location.pathname !== '/login.html' && window.location.pathname !== '/index.html') {
    try {
      const authenticated = await window.API.auth.checkAuth();
      if (!authenticated) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'login.html';
      } else {
        console.log('Authentication successful');
        updateUserInfo();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      showAlert('Terjadi kesalahan pada autentikasi. Silakan login kembali.', 'danger');
      window.location.href = 'login.html';
    }
  }
});