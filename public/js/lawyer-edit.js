// Variabel untuk menyimpan data pengacara
let lawyerData = null;
let lawyerId = null;

// Load data pengacara
async function loadLawyerData() {
  // Get lawyer ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  lawyerId = urlParams.get('id');
  
  if (!lawyerId) {
    showAlert('ID pengacara tidak ditemukan', 'danger');
    window.location.href = 'lawyers.html';
    return;
  }
  
  try {
    showLoading('edit-lawyer-container');
    
    // Fetch lawyer data
    lawyerData = await API.crm.getUser(lawyerId);
    
    // Populate form fields
    document.getElementById('edit-name').value = lawyerData.username || '';
    document.getElementById('edit-email').value = lawyerData.email || '';
    document.getElementById('edit-phone').value = lawyerData.number || '';
    document.getElementById('edit-address').value = lawyerData.address || '';
    
    // Set type
    const typeSelect = document.getElementById('edit-type');
    if (typeSelect) {
      typeSelect.value = lawyerData.type || '';
    }
    
    // Set avatar if exists
    if (lawyerData.avatar_url) {
      document.getElementById('current-avatar').src = lawyerData.avatar_url;
      document.getElementById('current-avatar-container').style.display = 'block';
    }
    
    hideLoading('edit-lawyer-container');
  } catch (error) {
    console.error('Error loading lawyer data:', error);
    showAlert(`Gagal memuat data pengacara: ${error.message}`, 'danger');
    hideLoading('edit-lawyer-container');
    
    // Redirect back after short delay
    setTimeout(() => {
      window.location.href = 'lawyers.html';
    }, 3000);
  }
}

// Update data pengacara
async function updateLawyer(formData) {
  if (!lawyerId) {
    showAlert('ID pengacara tidak ditemukan', 'danger');
    return;
  }
  
  try {
    // Update lawyer data
    await API.crm.updateUser(lawyerId, formData);
    
    showAlert('Data pengacara berhasil diperbarui', 'success');
    
    // Redirect back to lawyers list
    setTimeout(() => {
      window.location.href = 'lawyers.html';
    }, 1500);
  } catch (error) {
    console.error('Error updating lawyer:', error);
    showAlert(`Gagal memperbarui data pengacara: ${error.message}`, 'danger');
  }
}

// Reset password pengacara
async function resetLawyerPassword(newPassword) {
  if (!lawyerId) {
    showAlert('ID pengacara tidak ditemukan', 'danger');
    return;
  }
  
  try {
    // Update password
    await API.crm.updateUserPassword(lawyerId, newPassword);
    
    showAlert('Password pengacara berhasil direset', 'success');
    
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
    return null;
  }
  
  const file = fileInput.files[0];
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Hanya file gambar yang diperbolehkan', 'danger');
    return null;
  }
  
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Upload avatar
    const response = await API.crm.uploadAvatar(lawyerId, formData);
    
    return response.avatar_url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    showAlert(`Gagal mengunggah avatar: ${error.message}`, 'danger');
    return null;
  }
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function() {
  // Load lawyer data
  await loadLawyerData();
  
  // Setup form edit pengacara
  const editLawyerForm = document.getElementById('edit-lawyer-form');
  if (editLawyerForm) {
    editLawyerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        username: document.getElementById('edit-name').value,
        email: document.getElementById('edit-email').value,
        number: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
        type: document.getElementById('edit-type').value
      };
      
      // Handle avatar upload if selected
      const avatarInput = document.getElementById('edit-avatar');
      if (avatarInput.files && avatarInput.files.length > 0) {
        const avatarUrl = await uploadAvatar(avatarInput);
        if (avatarUrl) {
          formData.avatar_url = avatarUrl;
        }
      }
      
      // Update lawyer
      updateLawyer(formData);
    });
  }
  
  // Setup reset password button
  const resetPasswordBtn = document.getElementById('reset-password-btn');
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', function() {
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
      resetLawyerPassword(newPassword);
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
  const cancelBtn = document.querySelector('.btn-secondary[href="lawyers.html"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'lawyers.html';
    });
  }
});