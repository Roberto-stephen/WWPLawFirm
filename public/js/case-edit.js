// Variabel untuk menyimpan data kasus dan users
let caseData = null;
let caseId = null;
let usersData = [];

// Load data kasus
async function loadCaseData() {
  // Get case ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  caseId = urlParams.get('id');
  
  if (!caseId) {
    showAlert('ID kasus tidak ditemukan', 'danger');
    window.location.href = 'cases.html';
    return;
  }
  
  try {
    showLoading('edit-case-container');
    
    // Load users first for member selection
    await loadUsers();
    
    // Fetch case data
    caseData = await API.cases.getCase(caseId);
    
    // Populate form fields
    document.getElementById('case_title').value = caseData.case_title || '';
    document.getElementById('case_description').value = caseData.case_description || '';
    document.getElementById('case_type').value = caseData.case_type || '';
    document.getElementById('case_status').value = caseData.case_status || '';
    document.getElementById('case_priority').value = caseData.case_priority || '';
    document.getElementById('case_total_billed_hour').value = caseData.case_total_billed_hour || 0;
    
    // Setup case members
    setupCaseMembers(caseData.case_member_list || []);
    
    hideLoading('edit-case-container');
  } catch (error) {
    console.error('Error loading case data:', error);
    showAlert(`Gagal memuat data kasus: ${error.message}`, 'danger');
    hideLoading('edit-case-container');
    
    // Redirect back after short delay
    setTimeout(() => {
      window.location.href = 'cases.html';
    }, 3000);
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
    
    return usersData;
  } catch (error) {
    console.error('Error loading users:', error);
    showAlert('Gagal memuat data pengguna', 'danger');
    return [];
  }
}

// Setup case members in form
function setupCaseMembers(memberList) {
  const container = document.getElementById('case-members-container');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Add members from case data
  memberList.forEach(member => {
    addMemberRow(member);
  });
  
  // Add an empty row if no members
  if (memberList.length === 0) {
    addMemberRow();
  }
}

// Add member row to case form
function addMemberRow(memberData = null) {
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
  
  // Populate user selection
  populateUserSelection(memberRow.querySelector('.member-id'));
  
  // Set member data if provided
  if (memberData) {
    memberRow.querySelector('.member-id').value = memberData.case_member_id || '';
    memberRow.querySelector('.member-type').value = memberData.case_member_type || '';
    memberRow.querySelector('.member-role').value = memberData.case_member_role || '';
  }
  
  // Add event listener for remove button
  memberRow.querySelector('.remove-member').addEventListener('click', function() {
    if (container.querySelectorAll('.case-member').length > 1) {
      container.removeChild(memberRow);
    } else {
      showAlert('Minimal harus ada satu anggota tim', 'warning');
    }
  });
  
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

// Populate user selection dropdown
function populateUserSelection(select) {
  if (!select) return;
  
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
}

// Update data kasus
async function updateCase(caseData) {
  if (!caseId) {
    showAlert('ID kasus tidak ditemukan', 'danger');
    return;
  }
  
  try {
    // Update case data
    await API.cases.updateCase(caseId, caseData);
    
    showAlert('Data kasus berhasil diperbarui', 'success');
    
    // Redirect back to cases list
    setTimeout(() => {
      window.location.href = 'cases.html';
    }, 1500);
  } catch (error) {
    console.error('Error updating case:', error);
    showAlert(`Gagal memperbarui data kasus: ${error.message}`, 'danger');
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
  // Load case data
  await loadCaseData();
  
  // Setup form edit kasus
  const editCaseForm = document.getElementById('edit-case-form');
  if (editCaseForm) {
    editCaseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get case data
      const caseData = getCaseDataFromForm();
      
      // Validate case members
      if (caseData.case_member_list.length === 0) {
        showAlert('Tambahkan minimal satu anggota tim', 'danger');
        return;
      }
      
      // Update case
      updateCase(caseData);
    });
  }
  
  // Setup tombol tambah anggota
  const addMemberBtn = document.getElementById('add-member-btn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', function() {
      addMemberRow();
    });
  }
  
  // Setup cancel button
  const cancelBtn = document.querySelector('.btn-secondary[href="cases.html"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'cases.html';
    });
  }
});