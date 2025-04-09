// Variabel global untuk menyimpan data dokumen dan kasus
let documentsData = [];
let casesData = [];
let usersData = [];

// Load semua dokumen dari API
async function loadDocuments(caseId = '') {
  try {
    showLoading('documents-table');
    
    let documents;
    if (caseId) {
      documents = await API.documents.getDocumentsByCaseId(caseId);
    } else {
      documents = await API.documents.getAllDocuments();
    }
    
    documentsData = documents;
    
    displayDocuments(documentsData);
    hideLoading('documents-table');
  } catch (error) {
    console.error('Error loading documents:', error);
    showAlert('Gagal memuat data dokumen', 'danger');
    hideLoading('documents-table');
  }
}

// Tampilkan data dokumen di tabel
function displayDocuments(documents) {
  const tableBody = document.querySelector('#documents-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (documents.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Tidak ada dokumen ditemukan</td>
      </tr>
    `;
    return;
  }
  
  documents.forEach(doc => {
    const row = document.createElement('tr');
    
    // Format upload date
    const uploadDate = formatDate(doc.uploaded_at);
    
    const caseTitle = doc.relatedCaseName ? doc.relatedCaseName.case_title : '-';
    const uploadedBy = doc.uploadedByUserName ? doc.uploadedByUserName.username : '-';
    
    row.innerHTML = `
      <td>${doc.doc_title}</td>
      <td>${caseTitle}</td>
      <td>${doc.doc_type}</td>
      <td>${uploadedBy}</td>
      <td>${uploadDate}</td>
      <td>
        <a href="${doc.doc_link_file}" target="_blank" class="btn btn-primary btn-sm" title="Unduh">
          <i class="fas fa-download"></i>
        </a>
        <a href="document-detail.html?id=${doc._id}&cid=${doc.doc_case_related}" class="btn btn-info btn-sm" title="Lihat Detail">
          <i class="fas fa-eye"></i>
        </a>
        ${doc.canEdit ? `
        <button class="btn btn-warning btn-sm edit-document-btn" data-id="${doc._id}" data-case="${doc.doc_case_related}" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-document-btn" data-id="${doc._id}" data-case="${doc.doc_case_related}" title="Hapus">
          <i class="fas fa-trash"></i>
        </button>
        ` : ''}
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Tambahkan event listener untuk tombol aksi
  setupDocumentActionButtons();
}

// Setup event listener untuk tombol aksi
function setupDocumentActionButtons() {
  // Edit document buttons
  document.querySelectorAll('.edit-document-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const docId = this.getAttribute('data-id');
      const caseId = this.getAttribute('data-case');
      window.location.href = `document-edit.html?id=${docId}&cid=${caseId}`;
    });
  });
  
  // Delete document buttons
  document.querySelectorAll('.delete-document-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const docId = this.getAttribute('data-id');
      const caseId = this.getAttribute('data-case');
      const doc = documentsData.find(d => d._id === docId);
      
      if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${doc.doc_title}"?`)) {
        deleteDocument(docId, caseId);
      }
    });
  });
}

// Hapus dokumen
async function deleteDocument(docId, caseId) {
  try {
    await API.documents.deleteDocument(docId, caseId);
    showAlert('Dokumen berhasil dihapus', 'success');
    
    // Reload documents with current filter
    const caseFilter = document.getElementById('case-filter');
    loadDocuments(caseFilter ? caseFilter.value : '');
  } catch (error) {
    console.error('Error deleting document:', error);
    showAlert(`Gagal menghapus dokumen: ${error.message}`, 'danger');
  }
}

// Load kasus untuk filter
async function loadCasesForFilter() {
  try {
    casesData = await API.cases.getCases();
    
    // Populate case filter dropdown
    const caseFilter = document.getElementById('case-filter');
    if (caseFilter) {
      caseFilter.innerHTML = '<option value="">Semua Kasus</option>';
      
      casesData.forEach(caseItem => {
        const option = document.createElement('option');
        option.value = caseItem._id;
        option.textContent = caseItem.case_title;
        caseFilter.appendChild(option);
      });
      
      // Add event listener
      caseFilter.addEventListener('change', function() {
        loadDocuments(this.value);
      });
    }
    
    // Populate case select for document upload
    const caseSelect = document.getElementById('doc_case_related');
    if (caseSelect) {
      caseSelect.innerHTML = '<option value="">Pilih Kasus</option>';
      
      casesData.forEach(caseItem => {
        const option = document.createElement('option');
        option.value = caseItem._id;
        option.textContent = caseItem.case_title;
        caseSelect.appendChild(option);
      });
      
      // Add event listener to update access list
      caseSelect.addEventListener('change', function() {
        updateAccessListFromCase(this.value);
      });
    }
  } catch (error) {
    console.error('Error loading cases:', error);
    showAlert('Gagal memuat data kasus', 'danger');
  }
}

// Load users for access list
async function loadUsersForAccessList() {
  try {
    const [clients, employees] = await Promise.all([
      API.crm.getUsers(),
      API.crm.getEmployees()
    ]);
    
    usersData = [...clients, ...employees];
    
    // Populate access list
    populateAccessList();
  } catch (error) {
    console.error('Error loading users:', error);
    showAlert('Gagal memuat data pengguna', 'danger');
  }
}

// Populate access list checkboxes
function populateAccessList() {
  const accessList = document.getElementById('access-list');
  if (!accessList) return;
  
  accessList.innerHTML = '';
  
  // Create "Select All" checkbox
  const selectAllDiv = document.createElement('div');
  selectAllDiv.className = 'form-check';
  selectAllDiv.style.marginBottom = '10px';
  selectAllDiv.innerHTML = `
    <input type="checkbox" id="select-all-users" class="form-check-input">
    <label for="select-all-users" class="form-check-label"><strong>Pilih Semua</strong></label>
  `;
  accessList.appendChild(selectAllDiv);
  
  // Create checkboxes for each user
  usersData.forEach(user => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `
      <input type="checkbox" id="user-${user._id}" class="form-check-input user-checkbox" value="${user._id}">
      <label for="user-${user._id}" class="form-check-label">${user.username} (${formatUserType(user.type)})</label>
    `;
    accessList.appendChild(div);
  });
  
  // Add event listener to "Select All" checkbox
  document.getElementById('select-all-users').addEventListener('change', function() {
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  });
}

// Update access list based on selected case
function updateAccessListFromCase(caseId) {
  if (!caseId) return;
  
  const caseItem = casesData.find(c => c._id === caseId);
  if (!caseItem || !caseItem.case_member_list) return;
  
  // Check users who are members of the case
  document.querySelectorAll('.user-checkbox').forEach(checkbox => {
    const userId = checkbox.value;
    checkbox.checked = caseItem.case_member_list.some(member => member.case_member_id === userId);
  });
  
  // Update "Select All" checkbox
  updateSelectAllCheckbox();
}

// Update "Select All" checkbox state
function updateSelectAllCheckbox() {
  const checkboxes = document.querySelectorAll('.user-checkbox');
  const selectAllCheckbox = document.getElementById('select-all-users');
  
  if (!selectAllCheckbox) return;
  
  const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
  const someChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
  
  selectAllCheckbox.checked = allChecked;
  selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

// Format user type
function formatUserType(type) {
  switch (type) {
    case 'admin': return 'Administrator';
    case 'partner': return 'Partner';
    case 'associates': return 'Associate';
    case 'paralegal': return 'Paralegal';
    case 'client': return 'Klien';
    default: return type;
  }
}

// Get selected users for access list
function getSelectedUsers() {
  return Array.from(document.querySelectorAll('.user-checkbox:checked')).map(checkbox => checkbox.value);
}

// Upload document
async function uploadDocument() {
  const form = document.getElementById('add-document-form');
  if (!form) return;
  
  // Check if form is valid
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Get selected users
  const selectedUsers = getSelectedUsers();
  
  if (selectedUsers.length === 0) {
    showAlert('Pilih minimal satu pengguna yang dapat mengakses dokumen ini', 'danger');
    return;
  }
  
  // Get file
  const fileInput = document.getElementById('docUpload');
  if (!fileInput.files || fileInput.files.length === 0) {
    showAlert('Pilih file untuk diunggah', 'danger');
    return;
  }
  
  // Create FormData
  const formData = new FormData();
  formData.append('doc_title', document.getElementById('doc_title').value);
  formData.append('doc_case_related', document.getElementById('doc_case_related').value);
  formData.append('doc_type', document.getElementById('doc_type').value);
  formData.append('doc_description', document.getElementById('doc_description').value);
  formData.append('docUpload', fileInput.files[0]);
  
  // Add file size
  formData.append('filesize', fileInput.files[0].size);
  
  // Add access list
  selectedUsers.forEach(userId => {
    formData.append('can_be_access_by', userId);
  });
  
  try {
    showAlert('Sedang mengunggah dokumen...', 'info');
    
    await API.documents.createDocument(formData);
    
    showAlert('Dokumen berhasil diunggah', 'success');
    closeModal('add-document-modal');
    
    // Reset form
    form.reset();
    
    // Reload documents
    const caseFilter = document.getElementById('case-filter');
    loadDocuments(caseFilter ? caseFilter.value : '');
  } catch (error) {
    console.error('Error uploading document:', error);
    showAlert(`Gagal mengunggah dokumen: ${error.message}`, 'danger');
  }
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', async function() {
  // Load kasus, users, dan dokumen
  await Promise.all([
    loadCasesForFilter(),
    loadUsersForAccessList(),
    loadDocuments()
  ]);
  
  // Setup form unggah dokumen
  const addDocumentForm = document.getElementById('add-document-form');
  if (addDocumentForm) {
    addDocumentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      uploadDocument();
    });
  }
  
  // Setup tombol unggah dokumen
  const addDocumentBtn = document.querySelector('button[onclick="openModal(\'add-document-modal\')"]');
  if (addDocumentBtn) {
    addDocumentBtn.addEventListener('click', function() {
      openModal('add-document-modal');
    });
  }
  
  // Setup file input preview
  const fileInput = document.getElementById('docUpload');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      const fileInfo = document.getElementById('file-info');
      if (fileInfo) {
        if (this.files && this.files[0]) {
          const file = this.files[0];
          const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
          fileInfo.textContent = `File: ${file.name} (${fileSize} MB)`;
          fileInfo.style.display = 'block';
        } else {
          fileInfo.style.display = 'none';
        }
      }
    });
  }
});