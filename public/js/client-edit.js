// Variabel untuk menyimpan data klien
let clientData = null;
let clientId = null;

// Load data klien
async function loadClientData() {
  console.log("Loading client data");
  
  // Get client ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  clientId = urlParams.get('id');
  
  if (!clientId) {
    showAlert('ID klien tidak ditemukan', 'danger');
    window.location.href = 'clients.html';
    return;
  }
  
  console.log("Client ID from URL:", clientId);
  
  try {
    showLoading('edit-client-container');
    
    // Validate ID format
    if (clientId.length !== 24) {
      throw new Error("ID klien tidak valid (harus 24 karakter)");
    }
    
    // Fetch client data
    console.log("Fetching client data from API");
    clientData = await API.crm.getUser(clientId);
    
    if (!clientData || typeof clientData !== 'object') {
      throw new Error("Data klien tidak valid");
    }
    
    console.log("Client data received:", clientData);
    
    // Populate form fields
    document.getElementById('edit-name').value = clientData.username || '';
    document.getElementById('edit-email').value = clientData.email || '';
    document.getElementById('edit-phone').value = clientData.number || '';
    document.getElementById('edit-address').value = clientData.address || '';
    
    // Set avatar if exists
    if (clientData.avatar_url) {
      document.getElementById('current-avatar').src = clientData.avatar_url;
      document.getElementById('current-avatar-container').style.display = 'block';
    }
    
    hideLoading('edit-client-container');
  } catch (error) {
    console.error('Error loading client data:', error);
    showAlert(`Gagal memuat data klien: ${error.message}`, 'danger');
    hideLoading('edit-client-container');
    
    // Redirect back after short delay
    setTimeout(() => {
      window.location.href = 'clients.html';
    }, 3000);
  }
}

// Update data klien
async function updateClient(formData) {
  if (!clientId) {
    showAlert('ID klien tidak ditemukan', 'danger');
    return;
  }
  
  try {
    console.log("Updating client data:", formData);
    
    // Validate form data
    if (!formData.username || !formData.email) {
      throw new Error("Nama dan email wajib diisi");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Format email tidak valid");
    }
    
    // Update client data
    const response = await API.crm.updateUser(clientId, formData);
    console.log("Update response:", response);
    
    showAlert('Data klien berhasil diperbarui', 'success');
    
    // Redirect back to clients list
    setTimeout(() => {
      window.location.href = 'clients.html';
    }, 1500);
  } catch (error) {
    console.error('Error updating client:', error);
    showAlert(`Gagal memperbarui data klien: ${error.message}`, 'danger');
  }
}

// Reset password klien
async function resetClientPassword(newPassword) {
  if (!clientId) {
    showAlert('ID klien tidak ditemukan', 'danger');
    return;
  }
  
  try {
    console.log("Resetting client password");
    
    // Password validation
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    
    // Update password
    await API.crm.updateUserPassword(clientId, newPassword);
    
    showAlert('Password klien berhasil direset', 'success');
    
    // Close modal
    closeModal('reset-password-modal');
  } catch (error) {
    console.error('Error resetting password:', error);
    showAlert(`Gagal mereset password: ${error.message}`, 'danger');
  }
}

// Upload avatar
async function uploadAvatar(fileInput) {
  if (!fileInput.files || fileInput.files.length === 0) {
    console.log("No file selected for avatar upload");
    return null;
  }
  
  const file = fileInput.files[0];
  console.log("Selected avatar file:", file.name, file.type, file.size);
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Hanya file gambar yang diperbolehkan', 'danger');
    return null;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showAlert('Ukuran file maksimal 2MB', 'danger');
    return null;
  }
  
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log("Uploading avatar...");
    
    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Avatar upload timeout")), 30000)
    );
    
    // Upload avatar with timeout
    const uploadPromise = API.crm.uploadAvatar(clientId, formData);
    const response = await Promise.race([uploadPromise, timeoutPromise]);
    
    console.log("Avatar upload response:", response);
    
    if (!response || !response.avatar_url) {
      throw new Error("Invalid response from server");
    }
    
    return response.avatar_url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    showAlert(`Gagal mengunggah avatar: ${error.message}`, 'danger');
    return null;
  }
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function() {
  console.log("Client edit page initialized");
  
  try {
    // Load client data
    await loadClientData();
    
    // Setup form edit klien
    const editClientForm = document.getElementById('edit-client-form');
    if (editClientForm) {
      editClientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
          username: document.getElementById('edit-name').value,
          email: document.getElementById('edit-email').value,
          number: document.getElementById('edit-phone').value,
          address: document.getElementById('edit-address').value
        };
        
        // Handle avatar upload if selected
        const avatarInput = document.getElementById('edit-avatar');
        if (avatarInput.files && avatarInput.files.length > 0) {
          try {
            const avatarUrl = await uploadAvatar(avatarInput);
            if (avatarUrl) {
              formData.avatar_url = avatarUrl;
            }
          } catch (error) {
            console.error("Avatar upload failed:", error);
            showAlert("Avatar gagal diunggah tetapi data lain akan tetap diperbarui", "warning");
          }
        }
        
        // Update client
        updateClient(formData);
      });
    } else {
      console.warn("Edit client form not found");
    }
    
    // Setup reset password button
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener('click', function() {
        console.log("Opening reset password modal");
        openModal('reset-password-modal');
      });
    }
    
    // Setup reset password form
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate password
        if (newPassword.length < 6) {
          showAlert('Password minimal 6 karakter', 'danger');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          showAlert('Password dan konfirmasi password tidak cocok', 'danger');
          return;
        }
        
        // Reset password
        resetClientPassword(newPassword);
      });
    }
    
    // Setup avatar preview
    const avatarInput = document.getElementById('edit-avatar');
    if (avatarInput) {
      avatarInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            document.getElementById('avatar-preview').src = e.target.result;
            document.getElementById('avatar-preview-container').style.display = 'block';
          };
          
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
    
    // Setup cancel button
    const cancelBtn = document.querySelector('.btn-secondary[href="clients.html"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'clients.html';
      });
    }
  } catch (error) {
    console.error("Error initializing client edit page:", error);
    showAlert("Terjadi kesalahan saat memuat halaman", "danger");
  }
});