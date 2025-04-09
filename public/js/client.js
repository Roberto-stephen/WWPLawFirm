let clientsData = [];

// Load semua klien dari API
async function loadClients() {
  try {
    console.log("Starting to load clients...");
    showLoading('clients-table');
    
    // Ambil tipe pengguna dari local storage
    const userType = localStorage.getItem('userType') || '';
    
    // Gunakan endpoint yang sesuai berdasarkan role
    let clients;
    if (userType === 'admin') {
      // Admin menggunakan endpoint admin
      clients = await API.admin.getUsers({ type: 'client' });
    } else if (['partner', 'associates', 'paralegal'].includes(userType)) {
      // Lawyer menggunakan endpoint lawyer
      clients = await API.lawyer.getClients();
    } else {
      // Fallback ke endpoint legacy
      clients = await API.crm.getUsers();
    }
    
    console.log("API response received:", clients);
    
    // Pastikan respons valid
    if (!clients || (Array.isArray(clients) && clients.length === 0)) {
      console.log("No clients found or empty response");
      clientsData = [];
      displayClients(clientsData);
      hideLoading('clients-table');
      return;
    }
    
    // Jika respons adalah objek dengan property users (dari admin API)
    if (clients.users) {
      clients = clients.users;
    }
    
    // Pastikan clients adalah array
    if (!Array.isArray(clients)) {
      console.error("Response bukan array:", clients);
      throw new Error("Format data tidak valid");
    }
    
    // Filter hanya klien jika perlu
    clientsData = clients.filter(client => client && client.type === 'client');
    console.log(`${clientsData.length} clients filtered from ${clients.length} users`);
    
    displayClients(clientsData);
    hideLoading('clients-table');
  } catch (error) {
    console.error('Error loading clients:', error);
    showAlert(`Gagal memuat data klien: ${error.message}`, 'danger');
    hideLoading('clients-table');
    
    // Tampilkan error di tabel
    const tableBody = document.querySelector('#clients-table tbody');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <i class="fas fa-exclamation-triangle text-danger"></i> 
            Error: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

// Tampilkan data klien di tabel dengan validasi data
function displayClients(clients) {
  console.log("Displaying clients in table");
  
  const tableBody = document.querySelector('#clients-table tbody');
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }
  
  tableBody.innerHTML = '';
  
  if (!clients || clients.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Tidak ada klien ditemukan</td>
      </tr>
    `;
    return;
  }
  
  clients.forEach(client => {
    // Validasi data client
    if (!client || typeof client !== 'object') {
      console.error("Invalid client data:", client);
      return;
    }
    
    const row = document.createElement('tr');
    
    // Hitung jumlah kasus aktif jika tersedia
    let activeCases = '-';
    if (client.activeCases) {
      activeCases = client.activeCases;
    }
    
    // Gunakan nilai default untuk data yang mungkin null/undefined
    const username = client.username || 'Tidak ada nama';
    const email = client.email || 'Tidak ada email';
    const phone = client.number || '-';
    const address = client.address || '-';
    
    row.innerHTML = `
      <td>${username}</td>
      <td>${email}</td>
      <td>${phone}</td>
      <td>${address}</td>
      <td>${activeCases}</td>
      <td>
        <a href="client-detail.html?id=${client._id}" class="btn btn-primary btn-sm">
          <i class="fas fa-eye"></i>
        </a>
        <button class="btn btn-warning btn-sm edit-client-btn" data-id="${client._id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-client-btn" data-id="${client._id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Tambahkan event listener untuk tombol aksi
  setupClientActionButtons();
}

// Setup event listener untuk tombol aksi
function setupClientActionButtons() {
  console.log("Setting up client action buttons");
  
  // Edit client buttons
  document.querySelectorAll('.edit-client-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = this.getAttribute('data-id');
      console.log("Edit client clicked:", clientId);
      window.location.href = `client-edit.html?id=${clientId}`;
    });
  });
  
  // Delete client buttons
  document.querySelectorAll('.delete-client-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const clientId = this.getAttribute('data-id');
      const client = clientsData.find(c => c._id === clientId);
      
      if (!client) {
        console.error("Client not found:", clientId);
        return;
      }
      
      if (confirm(`Apakah Anda yakin ingin menghapus klien "${client.username}"?`)) {
        deleteClient(clientId);
      }
    });
  });
}

// Hapus klien
async function deleteClient(clientId) {
  try {
    console.log("Deleting client:", clientId);
    
    if (!clientId || clientId.length !== 24) {
      throw new Error("ID klien tidak valid");
    }
    
    // Gunakan endpoint yang sesuai berdasarkan role
    const userType = localStorage.getItem('userType') || '';
    
    if (userType === 'admin') {
      await API.admin.deleteUser(clientId);
    } else {
      await API.crm.deleteUser(clientId);
    }
    
    showAlert('Klien berhasil dihapus', 'success');
    loadClients(); // Reload data
  } catch (error) {
    console.error('Error deleting client:', error);
    showAlert(`Gagal menghapus klien: ${error.message}`, 'danger');
  }
}

// Tambah klien baru dengan validasi data
async function addClient(clientData) {
  try {
    console.log("Adding client with data:", clientData);
    
    // Validasi data minimal
    if (!clientData.username || !clientData.email || !clientData.password) {
      throw new Error("Data wajib belum lengkap (nama, email, password)");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      throw new Error("Format email tidak valid");
    }
    
    // Password validation
    if (clientData.password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    
    // Default type to 'client'
    if (!clientData.type) {
      clientData.type = 'client';
    }
    
    // Set empty fields to empty string instead of undefined
    Object.keys(clientData).forEach(key => {
      if (clientData[key] === undefined) {
        clientData[key] = '';
      }
    });
    
    // Gunakan endpoint yang sesuai berdasarkan role
    const userType = localStorage.getItem('userType') || '';
    let result;
    
    if (userType === 'admin') {
      result = await API.admin.createUser(clientData);
    } else {
      result = await API.crm.createUser(clientData);
    }
    
    console.log("Client created successfully:", result);
    
    showAlert('Klien berhasil ditambahkan', 'success');
    
    // Reset form
    document.getElementById('add-client-form').reset();
    
    // Close modal
    closeModal('add-client-modal');
    
    // Reload data
    loadClients();
    
    return true;
  } catch (error) {
    console.error('Error adding client:', error);
    showAlert(`Gagal menambahkan klien: ${error.message}`, 'danger');
    return false;
  }
}

// Inisialisasi halaman dengan penanganan error
document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log("Initializing clients page...");
    
    // Setup global error handler
    window.addEventListener('error', function(event) {
      console.error("Global error:", event.error);
    });
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found, redirecting to login");
      window.location.href = 'login.html';
      return;
    }
    
    // Load klien
    await loadClients();
    
    // Setup form tambah klien
    const addClientForm = document.getElementById('add-client-form');
    if (addClientForm) {
      addClientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clientData = {
          username: document.getElementById('username').value,
          email: document.getElementById('email').value,
          number: document.getElementById('number').value,
          address: document.getElementById('address').value,
          password: document.getElementById('password').value,
          type: 'client',
          avatar_url: ''
        };
        
        addClient(clientData);
      });
    } else {
      console.warn("Add client form not found");
    }
    
    // Setup tombol tambah klien
    const addClientBtn = document.querySelector('.tambah-klien');
    if (addClientBtn) {
      addClientBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Opening add client modal");
        openModal('add-client-modal');
      });
    } else {
      console.warn("Add client button not found");
    }
  } catch (error) {
    console.error("Error initializing clients page:", error);
    showAlert("Terjadi kesalahan saat memuat halaman", "danger");
  }
});

// Fungsi utility
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('loading');
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.parentNode.insertBefore(loadingElement, element.nextSibling);
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('loading');
    const loadingElement = element.parentNode.querySelector('.loading-spinner');
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    console.warn("Alert container not found, creating one");
    const newAlertContainer = document.createElement('div');
    newAlertContainer.id = 'alert-container';
    newAlertContainer.style.position = 'fixed';
    newAlertContainer.style.top = '20px';
    newAlertContainer.style.right = '20px';
    newAlertContainer.style.zIndex = '9999';
    document.body.appendChild(newAlertContainer);
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;
  
  document.getElementById('alert-container').appendChild(alert);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 5000);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Create backdrop if not exists
    if (!document.querySelector('.modal-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }
}