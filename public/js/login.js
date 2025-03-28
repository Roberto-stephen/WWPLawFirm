// login.js - Optimized untuk Vercel
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login script loaded - Vercel optimized version');
  
  // Hapus token lama
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userType');
  
  // Referensi elemen DOM
  const form = document.getElementById('login-form');
  const alert = document.getElementById('alert');
  const alertMessage = document.getElementById('alert-message');
  const loader = document.getElementById('login-loader');
  
  // Handler untuk form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset UI
    if (alert) alert.style.display = 'none';
    if (loader) loader.style.display = 'inline-block';
    
    // Ambil nilai input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Gunakan URL relatif, bukan absolut
    const loginUrl = '/auth/login';
    
    console.log('Mencoba login dengan:', email);
    console.log('URL login:', loginUrl);
    
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Status respons:', response.status);
      
      if (!response.ok) {
        // Coba ambil detil error jika ada
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Login failed with status ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Login failed with status ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Data respons:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || 'User');
        localStorage.setItem('userType', data.type || 'client');
        
        // Redirect berdasarkan tipe user
        if (data.type === 'admin' || data.type === 'partner') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
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