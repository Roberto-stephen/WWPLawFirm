// Variabel global untuk menyimpan data pengacara
let lawyersData = [];

// Load semua pengacara dari API
async function loadLawyers() {
  try {
    console.log("Loading lawyers data");
    showLoading('lawyers-table');
    
    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Employees fetch timeout")), 15000)
    );
    
    // Use manual fetch with better error handling
    const employeesPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/crm/employees', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        
        console.log("Employees API response status:", response.status);
        
        if (!response.ok) {
          const text = await response.text();
          console.error("Error response:", text.substring(0, 200));
          throw new Error(`Failed to load employees: ${response.status} ${response.statusText}`);
        }
        
        // Try to parse as JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Server returned non-JSON response");
        }
        
        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    
    // Race between data fetching and timeout
    const employees = await Promise.race([employeesPromise, timeoutPromise]);
    
    console.log(`Received ${employees ? employees.length : 0} employees`);
    
    // Validate response
    if (!employees || !Array.isArray(employees)) {
      throw new Error("Invalid employees data received");
    }
    
    // Filter untuk mendapatkan pengacara (partner, associates, paralegal)
    lawyersData = employees.filter(emp => 
      emp && emp.type && (
        emp.type === 'partner' || 
        emp.type === 'associates' || 
        emp.type === 'paralegal'
      )
    );
    
    console.log(`Filtered ${lawyersData.length} lawyers from employees data`);
    
    displayLawyers(lawyersData);
    hideLoading('lawyers-table');
  } catch (error) {
    console.error('Error loading lawyers:', error);
    showAlert(`Gagal memuat data pengacara: ${error.message}`, 'danger');
    hideLoading('lawyers-table');
    
    // Display empty state with error
    const tableBody = document.querySelector('#lawyers-table tbody');
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

// Tampilkan data pengacara di tabel dengan validasi data
function displayLawyers(lawyers) {
  console.log("Displaying lawyers in table");
  
  const tableBody = document.querySelector('#lawyers-table tbody');
  if (!tableBody) {
    console.error("Lawyers table body not found");
    return;
  }
  
  tableBody.innerHTML = '';
  
  if (!lawyers || lawyers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Tidak ada pengacara ditemukan</td>
      </tr>
    `;
    return;
  }
  
  lawyers.forEach(lawyer => {
    // Validate lawyer data
    if (!lawyer || typeof lawyer !== 'object') {
      console.error("Invalid lawyer data:", lawyer);
      return;
    }
    
    const row = document.createElement('tr');
    
    // Safely format data with fallbacks
    const username = lawyer.username || 'Tidak ada nama';
    const email = lawyer.email || 'Tidak ada email';
    const phone = lawyer.number || '-';
    const lawyerId = lawyer._id || '';
    
    // Format jabatan
    let jobTitle = lawyer.type || 'Unknown';
    if (lawyer.type === 'partner') jobTitle = 'Partner';
    if (lawyer.type === 'associates') jobTitle = 'Associate';
    if (lawyer.type === 'paralegal') jobTitle = 'Paralegal';
    
    // Hitung jumlah kasus aktif jika tersedia
    let activeCases = '-';
    if (lawyer.activeCases) {
      activeCases = lawyer.activeCases;
    }
    
    row.innerHTML = `
      <td>${username}</td>
      <td>${email}</td>
      <td>${jobTitle}</td>
      <td>${phone}</td>
      <td>${activeCases}</td>
      <td>
        <a href="lawyer-detail.html?id=${lawyerId}" class="btn btn-primary btn-sm">
          <i class="fas fa-eye"></i>
        </a>
        <button class="btn btn-warning btn-sm edit-lawyer-btn" data-id="${lawyerId}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-lawyer-btn" data-id="${lawyerId}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Tambahkan event listener untuk tombol aksi
  setupLawyerActionButtons();
}

// Setup event listener untuk tombol aksi
function setupLawyerActionButtons() {
  console.log("Setting up lawyer action buttons");
  
  // Edit lawyer buttons
  document.querySelectorAll('.edit-lawyer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lawyerId = this.getAttribute('data-id');
      console.log("Edit lawyer clicked:", lawyerId);
      window.location.href = `lawyer-edit.html?id=${lawyerId}`;
    });
  });
  
  // Delete lawyer buttons
  document.querySelectorAll('.delete-lawyer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lawyerId = this.getAttribute('data-id');
      const lawyer = lawyersData.find(l => l._id === lawyerId);
      
      if (!lawyer) {
        console.error("Lawyer not found:", lawyerId);
        return;
      }
      
      if (confirm(`Apakah Anda yakin ingin menghapus pengacara "${lawyer.username}"?`)) {
        deleteLawyer(lawyerId);
      }
    });
  });
}

// Filter pengacara berdasarkan jabatan
function filterLawyers() {
  console.log("Filtering lawyers");
  
  const filterType = document.getElementById('filterType').value;
  const searchTerm = document.getElementById('searchLawyer').value.toLowerCase();
  
  console.log(`Filter criteria - Type: ${filterType}, Search: ${searchTerm}`);
  
  let filteredLawyers = [...lawyersData];
  
  // Filter berdasarkan jabatan
  if (filterType !== 'all') {
    filteredLawyers = filteredLawyers.filter(lawyer => lawyer.type === filterType);
  }
  
  // Filter berdasarkan pencarian
  if (searchTerm) {
    filteredLawyers = filteredLawyers.filter(lawyer => 
      (lawyer.username && lawyer.username.toLowerCase().includes(searchTerm)) || 
      (lawyer.email && lawyer.email.toLowerCase().includes(searchTerm)) ||
      (lawyer.number && lawyer.number.includes(searchTerm))
    );
  }
  
  console.log(`Filtered to ${filteredLawyers.length} lawyers`);
  
  // Tampilkan hasil filter
  displayLawyers(filteredLawyers);
}

// Hapus pengacara
async function deleteLawyer(lawyerId) {
  try {
    console.log("Deleting lawyer:", lawyerId);
    
    if (!lawyerId || lawyerId.length !== 24) {
      throw new Error("ID pengacara tidak valid");
    }
    
    await API.crm.deleteUser(lawyerId);
    showAlert('Pengacara berhasil dihapus', 'success');
    loadLawyers(); // Reload data
  } catch (error) {
    console.error('Error deleting lawyer:', error);
    showAlert(`Gagal menghapus pengacara: ${error.message}`, 'danger');
  }
}

// Tambah pengacara baru dengan validasi
async function addLawyer(lawyerData) {
  try {
    console.log("Adding lawyer with data:", lawyerData);
    
    // Validate minimal required data
    if (!lawyerData.username || !lawyerData.email || !lawyerData.password || !lawyerData.type) {
      throw new Error("Data wajib belum lengkap (nama, email, password, jabatan)");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lawyerData.email)) {
      throw new Error("Format email tidak valid");
    }
    
    // Password validation
    if (lawyerData.password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    
    // Type validation
    const validTypes = ['partner', 'associates', 'paralegal'];
    if (!validTypes.includes(lawyerData.type)) {
      throw new Error("Tipe/jabatan tidak valid");
    }
    
    // Manual fetch with better error handling
    const response = await fetch('/api/crm/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(lawyerData)
    });
    
    console.log("Create lawyer response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating lawyer:", errorText);
      throw new Error(`Failed to create lawyer: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Lawyer created successfully:", result);
    
    showAlert('Pengacara berhasil ditambahkan', 'success');
    
    // Reset form
    document.getElementById('add-lawyer-form').reset();
    
    // Close modal
    closeModal('add-lawyer-modal');
    
    // Reload data
    loadLawyers();
    
    return true;
  } catch (error) {
    console.error('Error adding lawyer:', error);
    showAlert(`Gagal menambahkan pengacara: ${error.message}`, 'danger');
    return false;
  }
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function() {
  console.log("Lawyers page initialized");
  
  try {
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
    
    // Load pengacara
    await loadLawyers();
    
    // Setup search and filter
    const searchInput = document.getElementById('searchLawyer');
    if (searchInput) {
      searchInput.addEventListener('input', filterLawyers);
    } else {
      console.warn("Search lawyer input not found");
    }
    
    const filterSelect = document.getElementById('filterType');
    if (filterSelect) {
      filterSelect.addEventListener('change', filterLawyers);
    } else {
      console.warn("Filter type select not found");
    }
    
    // Setup form tambah pengacara
    const addLawyerForm = document.getElementById('add-lawyer-form');
    if (addLawyerForm) {
      addLawyerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const lawyerData = {
          username: document.getElementById('username').value,
          email: document.getElementById('email').value,
          type: document.getElementById('type').value,
          number: document.getElementById('number').value,
          address: document.getElementById('address').value,
          password: document.getElementById('password').value,
          avatar_url: ''
        };
        
        addLawyer(lawyerData);
      });
    } else {
      console.warn("Add lawyer form not found");
    }
    
    // Setup tombol tambah pengacara
    const addLawyerBtn = document.querySelector('button[onclick="openModal(\'add-lawyer-modal\')"]');
    if (addLawyerBtn) {
      // Override the inline onclick
      addLawyerBtn.onclick = function(e) {
        e.preventDefault();
        console.log("Opening add lawyer modal");
        openModal('add-lawyer-modal');
      };
    } else {
      console.warn("Add lawyer button not found");
    }
  } catch (error) {
    console.error("Error initializing lawyers page:", error);
    showAlert("Terjadi kesalahan saat memuat halaman", "danger");
  }
});