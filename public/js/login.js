// Login handling
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token) {
      // Redirect based on user type
      if (userType === 'admin' || userType === 'partner') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }
    
    const form = document.getElementById('login-form');
    const alert = document.getElementById('alert');
    const loader = document.getElementById('login-loader');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loader
      loader.style.display = 'inline-block';
      
      // Hide previous alerts
      alert.style.display = 'none';
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
          // Save token and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('userName', data.name);
          localStorage.setItem('userType', data.type);
          
          // Redirect based on user type
          if (data.type === 'admin' || data.type === 'partner') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'index.html';
          }
        } else {
          // Show error
          alert.className = 'alert alert-danger';
          alert.textContent = data.error || 'Login gagal. Periksa email dan password Anda.';
          alert.style.display = 'block';
        }
      } catch (error) {
        // Show error
        alert.className = 'alert alert-danger';
        alert.textContent = 'Terjadi kesalahan saat mencoba login. Silakan coba lagi.';
        alert.style.display = 'block';
      } finally {
        // Hide loader
        loader.style.display = 'none';
      }
    });
  });