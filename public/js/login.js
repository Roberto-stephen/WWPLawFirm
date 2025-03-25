// Enhanced Login handling
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // Debugging: Log current token and user type
  console.log('Stored Token:', token);
  console.log('User Type:', userType);
  
  if (token) {
    // More verbose redirection logic with console logging
    try {
      console.log('Attempting automatic redirection');
      
      if (userType === 'admin' || userType === 'partner') {
        console.log('Redirecting to admin dashboard');
        window.location.href = 'admin-dashboard.html';
      } else if (userType === 'client') {
        console.log('Redirecting to landing page');
        window.location.href = 'index.html';
      } else {
        console.warn('Unknown user type, clearing token');
        localStorage.clear();
      }
    } catch (redirectError) {
      console.error('Redirection error:', redirectError);
      localStorage.clear(); // Clear problematic token
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
      
      console.log('Login Response:', data); // Add detailed logging
      
      if (response.ok && data.token) {
        // Save token and user info with more comprehensive details
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userType', data.type);
        
        // Centralized redirection logic
        switch(data.type) {
          case 'admin':
          case 'partner':
            window.location.href = 'admin-dashboard.html';
            break;
          case 'client':
            window.location.href = 'index.html';
            break;
          default:
            throw new Error('Invalid user type');
        }
      } else {
        // Enhanced error handling
        alert.className = 'alert alert-danger';
        alert.textContent = data.error || 'Login failed. Please check your credentials.';
        alert.style.display = 'block';
        console.error('Login failed:', data.error);
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert.className = 'alert alert-danger';
      alert.textContent = 'An error occurred during login. Please try again.';
      alert.style.display = 'block';
    } finally {
      // Hide loader
      loader.style.display = 'none';
    }
  });
});