// guest-mode.js - Tambahkan script ini ke semua halaman HTML sebelum file api.js dan auth-check.js
(function() {
  // Data dummy untuk guest mode
  const DUMMY_DATA = {
    cases: [
      {
        _id: 'case1',
        case_title: 'Kasus Perdata Pembagian Harta',
        case_description: 'Kasus perdata mengenai pembagian harta warisan keluarga Budi.',
        case_type: 'Perdata',
        case_status: 'Open',
        case_priority: 'High',
        case_total_billed_hour: 24,
        case_member_list: [
          { case_member_id: 'lawyer1', case_member_type: 'partner', case_member_role: 'Lead', case_member_name: 'Dewi Putri' },
          { case_member_id: 'user1', case_member_type: 'client', case_member_role: 'Client' }
        ]
      },
      {
        _id: 'case2',
        case_title: 'Kasus Bisnis Cidera Janji',
        case_description: 'Kasus bisnis mengenai cidera janji dalam perjanjian kerjasama.',
        case_type: 'Bisnis',
        case_status: 'Pending',
        case_priority: 'Medium',
        case_total_billed_hour: 12,
        case_member_list: [
          { case_member_id: 'lawyer2', case_member_type: 'associates', case_member_role: 'Lead', case_member_name: 'Ahmad Faisal' },
          { case_member_id: 'user1', case_member_type: 'client', case_member_role: 'Client' }
        ]
      }
    ],
    documents: [
      {
        _id: 'doc1',
        doc_title: 'Surat Perjanjian',
        doc_type: 'Contract',
        doc_description: 'Dokumen perjanjian kerjasama',
        doc_link_file: 'https://example.com/doc1.pdf',
        doc_link_onlineDrive: 'https://drive.google.com/file/d/example/view',
        uploaded_at: '2025-03-15T10:30:00',
        doc_case_related: 'case1',
        uploadedByUserName: { username: 'Dewi Putri' },
        lastAccessedByUserName: { username: 'Guest User' },
        relatedCaseName: { case_title: 'Kasus Perdata Pembagian Harta' }
      },
      {
        _id: 'doc2',
        doc_title: 'Bukti Pembayaran',
        doc_type: 'Evidence',
        doc_description: 'Bukti pembayaran transaksi',
        doc_link_file: 'https://example.com/doc2.pdf',
        doc_link_onlineDrive: 'https://drive.google.com/file/d/example2/view',
        uploaded_at: '2025-03-20T14:15:00',
        doc_case_related: 'case2',
        uploadedByUserName: { username: 'Ahmad Faisal' },
        lastAccessedByUserName: { username: 'Guest User' },
        relatedCaseName: { case_title: 'Kasus Bisnis Cidera Janji' }
      }
    ],
    appointments: {
      appointments: [
        {
          _id: 'appointment1',
          title: 'Konsultasi Hukum - Kasus Pembagian Harta',
          location: 'Kantor WWP Law Firm',
          dateStart: '2025-04-05',
          dateEnd: '2025-04-05',
          timeStart: '09:00',
          timeEnd: '10:30',
          details: 'Konsultasi mengenai langkah selanjutnya dalam kasus pembagian harta',
          status: 'scheduled',
          creator: 'Dewi Putri',
          attendees: [
            { name: 'Guest Client', response: 'accepted' },
            { name: 'Dewi Putri', response: 'accepted' }
          ]
        },
        {
          _id: 'appointment2',
          title: 'Sidang Kasus Cidera Janji',
          location: 'Pengadilan Negeri Jakarta Pusat',
          dateStart: '2025-04-12',
          dateEnd: '2025-04-12',
          timeStart: '13:00',
          timeEnd: '15:00',
          details: 'Sidang pembacaan putusan kasus cidera janji',
          status: 'scheduled',
          creator: 'Ahmad Faisal',
          attendees: [
            { name: 'Guest Client', response: 'pending' },
            { name: 'Ahmad Faisal', response: 'accepted' }
          ]
        }
      ]
    },
    users: [
      {
        _id: 'user1',
        username: 'Budi Santoso',
        email: 'budi@example.com',
        number: '+6281234567890',
        address: 'Jl. Sudirman No. 123, Jakarta',
        type: 'client'
      }
    ],
    employees: [
      {
        _id: 'lawyer1',
        username: 'Dewi Putri',
        email: 'dewi@wwplawfirm.com',
        number: '+6287654321098',
        address: 'Jl. Thamrin No. 45, Jakarta',
        type: 'partner'
      },
      {
        _id: 'lawyer2',
        username: 'Ahmad Faisal',
        email: 'ahmad@wwplawfirm.com',
        number: '+6289876543210',
        address: 'Jl. Gatot Subroto No. 67, Jakarta',
        type: 'associates'
      }
    ],
    statistics: {
      caseStatistic: {
        open: 3,
        close: 2,
        pending: 1
      },
      userStatistic: {
        admins: 1,
        paralegals: 2,
        clients: 5,
        partners: 2,
        associates: 3
      }
    }
  };

  // Tambahkan tombol guest ke halaman login
  function modifyLoginPage() {
    if (window.location.pathname.includes('login.html')) {
      const loginFooter = document.querySelector('.login-footer');
      if (loginFooter) {
        const guestAccess = document.createElement('div');
        guestAccess.className = 'guest-access';
        guestAccess.innerHTML = `
          <p>Atau masuk sebagai tamu:</p>
          <div style="display: flex; gap: 10px; margin-top: 10px; margin-bottom: 20px;">
            <button id="guest-client-btn" class="btn btn-outline" style="flex: 1;">
              <i class="fas fa-user"></i> Guest Client
            </button>
            <button id="guest-admin-btn" class="btn btn-outline" style="flex: 1;">
              <i class="fas fa-user-shield"></i> Guest Admin
            </button>
          </div>
        `;
        
        // Sisipkan sebelum elemen pertama di loginFooter
        loginFooter.insertBefore(guestAccess, loginFooter.firstChild);
        
        // Tambahkan event listener untuk tombol guest
        document.getElementById('guest-client-btn').addEventListener('click', () => {
          loginAsGuest('client');
        });
        
        document.getElementById('guest-admin-btn').addEventListener('click', () => {
          loginAsGuest('admin');
        });
      }
    }
  }
  
  // Fungsi untuk login sebagai guest
  function loginAsGuest(type) {
    // Set data guest di localStorage
    const guestToken = `guest-token-${Date.now()}`;
    const guestName = type === 'admin' ? 'Guest Admin' : 'Guest Client';
    
    localStorage.setItem('token', guestToken);
    localStorage.setItem('userName', guestName);
    localStorage.setItem('userType', type);
    localStorage.setItem('isGuest', 'true');
    
    // Redirect ke halaman yang sesuai
    if (type === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  }
  
  // Tambahkan label Guest ke nama pengguna
  function addGuestLabel() {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!isGuest) return;
    
    // Periksa elemen nama pengguna secara berkala hingga ditemukan
    const checkUserElement = setInterval(() => {
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        clearInterval(checkUserElement);
        
        // Tambahkan label "Guest"
        const userName = localStorage.getItem('userName');
        userNameElement.innerHTML = userName + ' <span style="font-size: 10px; background: #ff9800; color: white; padding: 2px 5px; border-radius: 10px; margin-left: 5px;">Guest</span>';
      }
    }, 100);
  }
  
  // Intercept fetch API saat dalam mode guest
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (isGuest) {
      return new Promise((resolve, reject) => {
        // Simulasi penundaan jaringan
        setTimeout(() => {
          // Tangani berbagai endpoint API
          if (url.includes('/api/cases')) {
            if (options && options.method === 'DELETE') {
              // Simulasi hapus kasus
              resolve(createResponse({ message: 'Case deleted successfully' }));
            } else if (options && options.method === 'POST') {
              // Simulasi buat kasus
              resolve(createResponse({ message: 'Case created successfully', _id: 'case-' + Date.now() }));
            } else if (url.includes('/message')) {
              // Simulasi pesan kasus
              resolve(createResponse({ message_list: [] }));
            } else if (url.includes('/api/cases/')) {
              // Simulasi detail kasus
              const caseId = url.split('/').pop();
              const caseItem = DUMMY_DATA.cases.find(c => c._id === caseId) || DUMMY_DATA.cases[0];
              resolve(createResponse(caseItem));
            } else {
              // Simulasi daftar kasus
              resolve(createResponse(DUMMY_DATA.cases));
            }
          } 
          else if (url.includes('/api/documents')) {
            if (url.includes('/all/')) {
              // Dokumen berdasarkan kasus
              const caseId = url.split('/').pop();
              const caseDocs = DUMMY_DATA.documents.filter(d => d.doc_case_related === caseId);
              resolve(createResponse(caseDocs));
            } else if (url.includes('/all')) {
              // Semua dokumen
              resolve(createResponse(DUMMY_DATA.documents));
            } else {
              // Operasi lain pada dokumen (tambah, hapus, dll)
              resolve(createResponse({ message: 'Document operation successful' }));
            }
          }
          else if (url.includes('/api/appointments')) {
            resolve(createResponse(DUMMY_DATA.appointments));
          }
          else if (url.includes('/api/statistics/dashboard')) {
            resolve(createResponse(DUMMY_DATA.statistics));
          }
          else if (url.includes('/api/statistics/notifications')) {
            resolve(createResponse([]));
          }
          else if (url.includes('/api/crm/employee')) {
            resolve(createResponse(DUMMY_DATA.employees));
          }
          else if (url.includes('/api/crm')) {
            if (url === '/api/crm' || url === '/api/crm/') {
              resolve(createResponse(DUMMY_DATA.users));
            } else {
              // Operasi user (lihat detail, update, hapus, dll)
              const isUserSelf = url.includes('/self');
              
              if (isUserSelf) {
                const userType = localStorage.getItem('userType');
                resolve(createResponse({
                  _id: 'user-self',
                  username: localStorage.getItem('userName'),
                  email: userType === 'admin' ? 'admin@example.com' : 'client@example.com',
                  number: '+6281234567890',
                  address: 'Jl. Contoh No. 123, Jakarta',
                  type: userType
                }));
              } else {
                resolve(createResponse(DUMMY_DATA.users[0]));
              }
            }
          } 
          else if (url.includes('/auth/login')) {
            // Login biasa (tidak akan dipanggil untuk guest, tapi untuk berjaga-jaga)
            if (options && options.method === 'POST') {
              resolve(createResponse({
                token: 'dummy-token',
                name: 'Regular User',
                type: 'client'
              }));
            }
          }
          else {
            // Default untuk endpoint lain
            resolve(createResponse({ message: 'Guest mode - API not implemented', success: true }));
          }
        }, 300); // Simulasi penundaan 300ms
      });
    }
    
    // Jika bukan guest, gunakan fetch asli
    return originalFetch.apply(this, arguments);
  };
  
  // Helper untuk membuat objek response untuk fetch API
  function createResponse(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Jalankan saat DOM sudah siap
  document.addEventListener('DOMContentLoaded', function() {
    modifyLoginPage();
    addGuestLabel();
  });
})();