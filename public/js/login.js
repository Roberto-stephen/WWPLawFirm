// login.js - Dengan handling error yang lebih baik dan opsi login guest
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login script loaded');
  
  // Hapus token lama
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userType');
  
  // Referensi elemen DOM
  const form = document.getElementById('login-form');
  const alert = document.getElementById('alert');
  const alertMessage = document.getElementById('alert-message');
  const loader = document.getElementById('login-loader');
  const guestClientBtn = document.getElementById('guest-client-btn');
  const guestAdminBtn = document.getElementById('guest-admin-btn');
  
  // Login sebagai Guest Client
  guestClientBtn.addEventListener('click', () => {
    loginAsGuest('client');
  });
  
  // Login sebagai Guest Admin
  guestAdminBtn.addEventListener('click', () => {
    loginAsGuest('admin');
  });
  
  // Fungsi login sebagai guest
  function loginAsGuest(type) {
    // Set data guest di localStorage
    const guestToken = `guest-token-${Date.now()}`;
    const guestName = type === 'admin' ? 'Guest Admin' : 'Guest Client';
    
    localStorage.setItem('token', guestToken);
    localStorage.setItem('userName', guestName);
    localStorage.setItem('userType', type);
    localStorage.setItem('isGuest', 'true');
    
    // Redirect ke halaman yang sesuai
    if (type === 'admin' || type === 'partner') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  }
  
  // Handler untuk form submit (login normal)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset UI
    if (alert) alert.style.display = 'none';
    if (loader) loader.style.display = 'inline-block';
    
    // Ambil nilai input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Mencoba login dengan:', email);
    
    try {
      // Request login
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      console.log('Status respons:', response.status);
      
      // Handle non-JSON response error
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error. Mohon coba lagi nanti.');
      }
      
      const data = await response.json();
      console.log('Data respons:', data);
      
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || 'User');
        localStorage.setItem('userType', data.type || 'client');
        localStorage.setItem('isGuest', 'false');
        
        // Redirect berdasarkan tipe user
        if (data.type === 'admin' || data.type === 'partner') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        // Tampilkan pesan error dari server jika ada
        throw new Error(data.error || 'Login gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (alert && alertMessage) {
        alertMessage.textContent = error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.';
        alert.style.display = 'flex';
      }
    } finally {
      if (loader) loader.style.display = 'none';
    }
  });
});