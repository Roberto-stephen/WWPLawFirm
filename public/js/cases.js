// Variabel global untuk menyimpan data kasus
let casesData = [];
let usersData = []; // Untuk menyimpan data user dan ditampilkan di form

// Load semua kasus dari API
async function loadCases() {
  try {
    showLoading('cases-table');
    
    const cases = await API.cases.getCases();
    casesData = cases;
    
    displayCases(casesData);
    hideLoading('cases-table');
  } catch (error) {
    console.error('Error loading cases:', error);
    showAlert('Gagal memuat data kasus', 'danger');
    hideLoading('cases-table');
  }
}

// Tampilkan data kasus di tabel
function displayCases(cases) {
  const tableBody = document.querySelector('#cases-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (cases.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Tidak ada kasus ditemukan</td>
      </tr>
    `;
    return;
  }
  
  cases.forEach(caseItem => {
    const row = document.createElement('tr');
    row.setAttribute('data-status', caseItem.case_status); // Untuk filter
    
    // Status badge class
    let statusClass = 'badge-info';
    if (caseItem.case_status === 'Open') statusClass = 'badge-success';
    if (caseItem.case_status === 'Closed') statusClass = 'badge-danger';
    if (caseItem.case_status === 'Pending') statusClass = 'badge-warning';
    
    // Priority badge class
    let priorityClass = 'badge-info';
    if (caseItem.case_priority === 'High') priorityClass = 'badge-danger';
    if (caseItem.case_priority === 'Medium') priorityClass = 'badge-warning';
    if (caseItem.case_priority === 'Low') priorityClass = 'badge-success';
    
    row.innerHTML = `
      <td>${caseItem.case_title}</td>
      <td>${caseItem.case_type}</td>
      <td><span class="badge ${statusClass}">${caseItem.case_status}</span></td>
      <td><span class="badge ${priorityClass}">${caseItem.case_priority}</span></td>
      <td>${caseItem.case_total_billed_hour}</td>
      <td>
        <a href="case-detail.html?id=${caseItem._id}" class="btn btn-primary btn-sm">
          <i class="fas fa-eye"></i>
        </a>
        <button class="btn btn-warning btn-sm edit-case-btn" data-id="${caseItem._id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-case-btn" data-id="${caseItem._id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Tambahkan event listener untuk tombol aksi
  setupCaseActionButtons();
}

// Setup event listener untuk tombol aksi
function setupCaseActionButtons() {
  // Edit case buttons
  document.querySelectorAll('.edit-case-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const caseId = this.getAttribute('data-id');
      window.location.href = `case-edit.html?id=${caseId}`;
    });
  });
  
  // Delete case buttons
  document.querySelectorAll('.delete-case-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const caseId = this.getAttribute('data-id');
      const caseItem = casesData.find(c => c._id === caseId);
      
      if (confirm(`Apakah Anda yakin ingin menghapus kasus "${caseItem.case_title}"?`)) {
        deleteCase(caseId);
      }
    });
  });
}

// Filter kasus berdasarkan status
function filterCases() {
  const filterStatus = document.getElementById('filterStatus').value;
  const searchTerm = document.getElementById('searchCase').value.toLowerCase();
  
  let filteredCases = [...casesData];
  
  // Filter berdasarkan status
  if (filterStatus !== 'all') {
    filteredCases = filteredCases.filter(caseItem => caseItem.case_status === filterStatus);
  }
  
  // Filter berdasarkan pencarian
  if (searchTerm) {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.case_title.toLowerCase().includes(searchTerm) || 
      caseItem.case_type.toLowerCase().includes(searchTerm) ||
      caseItem.case_description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Tampilkan hasil filter
  displayCases(filteredCases);
}

// Hapus kasus
async function deleteCase(caseId) {
  try {
    await API.cases.deleteCase(caseId);
    showAlert('Kasus berhasil dihapus', 'success');
    loadCases(); // Reload data
  } catch (error) {
    console.error('Error deleting case:', error);
    showAlert(`Gagal menghapus kasus: ${error.message}`, 'danger');
  }
}

// Load users for case member selection
async function loadUsers() {
  try {
    const [clients, employees] = await Promise.all([
      API.crm.getUsers(),
      API.crm.getEmployees()
    ]);
    
    usersData = [...clients, ...employees];
    
    // Populate user selection dropdown
    populateUserSelection();
  } catch (error) {
    console.error('Error loading users:', error);
    showAlert('Gagal memuat data pengguna', 'danger');
  }
}

// Populate user selection dropdowns
function populateUserSelection() {
  const memberSelects = document.querySelectorAll('.member-id');
  if (!memberSelects.length) return;
  
  memberSelects.forEach(select => {
    // Clear existing options
    select.innerHTML = '<option value="">Pilih Anggota</option>';
    
    // Add users grouped by type
    const partnerGroup = document.createElement('optgroup');
    partnerGroup.label = 'Partner';
    
    const associateGroup = document.createElement('optgroup');
    associateGroup.label = 'Associate';
    
    const paralegalGroup = document.createElement('optgroup');
    paralegalGroup.label = 'Paralegal';
    
    const clientGroup = document.createElement('optgroup');
    clientGroup.label = 'Klien';
    
    usersData.forEach(user => {
      const option = document.createElement('option');
      option.value = user._id;
      option.textContent = user.username;
      
      if (user.type === 'partner') {
        partnerGroup.appendChild(option.cloneNode(true));
      } else if (user.type === 'associates') {
        associateGroup.appendChild(option.cloneNode(true));
      } else if (user.type === 'paralegal') {
        paralegalGroup.appendChild(option.cloneNode(true));
      } else if (user.type === 'client') {
        clientGroup.appendChild(option.cloneNode(true));
      }
    });
    
    // Add optgroups to select if they have options
    if (partnerGroup.childElementCount > 0) select.appendChild(partnerGroup);
    if (associateGroup.childElementCount > 0) select.appendChild(associateGroup);
    if (paralegalGroup.childElementCount > 0) select.appendChild(paralegalGroup);
    if (clientGroup.childElementCount > 0) select.appendChild(clientGroup);
  });
}

// Add member row to case form
function addMemberRow() {
  const container = document.getElementById('case-members-container');
  if (!container) return;
  
  const memberRow = document.createElement('div');
  memberRow.className = 'case-member';
  memberRow.style.display = 'flex';
  memberRow.style.gap = '10px';
  memberRow.style.marginBottom = '10px';
  
  memberRow.innerHTML = `
    <select class="form-control member-id" style="flex: 2;" required>
      <option value="">Pilih Anggota</option>
    </select>
    <select class="form-control member-type" style="flex: 1;" required>
      <option value="">Tipe</option>
      <option value="partners">Partner</option>
      <option value="associates">Associate</option>
      <option value="paralegal">Paralegal</option>
      <option value="client">Klien</option>
    </select>
    <select class="form-control member-role" style="flex: 1;" required>
      <option value="">Peran</option>
      <option value="Lead">Utama</option>
      <option value="Support">Pendukung</option>
      <option value="Admin">Admin</option>
      <option value="Client">Klien</option>
    </select>
    <button type="button" class="btn btn-danger remove-member" style="width: auto;">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(memberRow);
  
  // Add event listener for remove button
  memberRow.querySelector('.remove-member').addEventListener('click', function() {
    container.removeChild(memberRow);
  });
  
  // Populate user selection
  populateUserSelection();
  
  // Update member type based on selected user
  const memberIdSelect = memberRow.querySelector('.member-id');
  memberIdSelect.addEventListener('change', function() {
    const userId = this.value;
    const user = usersData.find(u => u._id === userId);
    
    if (user) {
      memberRow.querySelector('.member-type').value = user.type === 'client' ? 'client' : 
        user.type === 'partner' ? 'partners' : 
        user.type === 'associates' ? 'associates' : 
        user.type === 'paralegal' ? 'paralegal' : '';
      
      memberRow.querySelector('.member-role').value = user.type === 'client' ? 'Client' : 
        user.type === 'partner' ? 'Lead' : 
        user.type === 'associates' ? 'Support' : 
        user.type === 'paralegal' ? 'Support' : '';
    }
  });
}

// Tambah kasus baru
async function addCase(caseData) {
  console.log('Sending case data:', caseData);
  try {
    await API.cases.createCase(caseData);
    showAlert('Kasus berhasil ditambahkan', 'success');
    
    // Reset form
    document.getElementById('add-case-form').reset();
    
    // Reset case members
    const container = document.getElementById('case-members-container');
    if (container) {
      container.innerHTML = '';
      addMemberRow(); // Add initial row
    }
    
    // Close modal
    closeModal('add-case-modal');
    
    // Reload data
    loadCases();
    
    return true;
  } catch (error) {
    console.error('Error adding case:', error);
    showAlert(`Gagal menambahkan kasus: ${error.message}`, 'danger');
    return false;
  }
}

// Get case data from form
function getCaseDataFromForm() {
  // Get case member data
  const members = [];
  document.querySelectorAll('.case-member').forEach(memberRow => {
    const memberId = memberRow.querySelector('.member-id').value;
    const memberType = memberRow.querySelector('.member-type').value;
    const memberRole = memberRow.querySelector('.member-role').value;
    
    if (memberId && memberType && memberRole) {
      members.push({
        case_member_id: memberId,
        case_member_type: memberType,
        case_member_role: memberRole
      });
    }
  });
  
  // Return case data object
  return {
    case_title: document.getElementById('case_title').value,
    case_description: document.getElementById('case_description').value,
    case_type: document.getElementById('case_type').value,
    case_status: document.getElementById('case_status').value,
    case_priority: document.getElementById('case_priority').value,
    case_total_billed_hour: parseFloat(document.getElementById('case_total_billed_hour').value) || 0,
    case_member_list: members
  };
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function() {
  // Load kasus dan pengguna
  await Promise.all([loadCases(), loadUsers()]);
  
  // Setup search and filter
  const searchInput = document.getElementById('searchCase');
  if (searchInput) {
    searchInput.addEventListener('input', filterCases);
  }
  
  const filterSelect = document.getElementById('filterStatus');
  if (filterSelect) {
    filterSelect.addEventListener('change', filterCases);
  }
  
  // Setup form tambah kasus
  const addCaseForm = document.getElementById('add-case-form');
  if (addCaseForm) {
    // Add initial member row
    addMemberRow();
    
    addCaseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get case data
      const caseData = getCaseDataFromForm();
      
      // Validate case members
      if (caseData.case_member_list.length === 0) {
        showAlert('Tambahkan minimal satu anggota tim', 'danger');
        return;
      }
      
      // Add case
      addCase(caseData);
    });
  }
  
  // Setup tombol tambah anggota
  const addMemberBtn = document.getElementById('add-member-btn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', addMemberRow);
  }
  
  // Setup tombol tambah kasus
  const addCaseBtn = document.querySelector('button[onclick="openModal(\'add-case-modal\')"]');
  if (addCaseBtn) {
    addCaseBtn.addEventListener('click', function() {
      openModal('add-case-modal');
    });
  }
});