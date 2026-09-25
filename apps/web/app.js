const API_BASE = 'http://localhost:4000/api';

// Application State
let state = {
  nurses: [],
  patients: [],
  selectedPatientId: 'pat-1',
  selectedPatientData: null,
  vitalLogs: [],
  waLogs: [],
  reviews: [],
  stats: null,
  alerts: [],
  bookings: [],
  isAdminLoggedIn: false,
  adminToken: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 App HomeCare Inicializada');
  
  // Set default booking date to tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dateInput = document.getElementById('book-date');
  if (dateInput) dateInput.value = tomorrow;

  // Check saved admin session
  const savedToken = localStorage.getItem('homecare_admin_token');
  if (savedToken) {
    state.isAdminLoggedIn = true;
    state.adminToken = savedToken;
    updateAdminUIState();
  }

  // Initialize Calculator
  calculateQuote();

  // Initial Data Load
  await loadNurses();
  await loadReviews();
  await loadPatientsList();
  await loadVitals(state.selectedPatientId);
  await loadWaLogs();
  await loadAdminData();
});

// Calculate Quote in Real-Time (Cotizador)
function calculateQuote() {
  const serviceEl = document.getElementById('calc-service');
  const shiftEl = document.getElementById('calc-shift');
  const freqEl = document.getElementById('calc-freq');

  if (!serviceEl || !shiftEl || !freqEl) return;

  const basePrice = parseFloat(serviceEl.options[serviceEl.selectedIndex].dataset.base || 45);
  const shiftFactor = parseFloat(shiftEl.options[shiftEl.selectedIndex].dataset.factor || 1);
  const discount = parseFloat(freqEl.options[freqEl.selectedIndex].dataset.discount || 0);

  let rawTotal = basePrice * shiftFactor;
  let finalTotal = rawTotal * (1 - discount);

  const totalEl = document.getElementById('calc-total-usd');
  const discountEl = document.getElementById('calc-discount-badge');

  if (totalEl) {
    totalEl.innerHTML = `$${finalTotal.toFixed(2)} <small>USD / turno</small>`;
  }

  if (discountEl) {
    if (discount > 0) {
      discountEl.innerText = `¡${Math.round(discount * 100)}% Descuento Aplicado!`;
      discountEl.style.display = 'inline-block';
    } else {
      discountEl.style.display = 'none';
    }
  }
}

function openBookingFromCalc() {
  const serviceEl = document.getElementById('calc-service');
  const shiftEl = document.getElementById('calc-shift');
  
  if (serviceEl && shiftEl) {
    const bookService = document.getElementById('book-service-type');
    const bookShift = document.getElementById('book-shift');
    if (bookService) bookService.value = serviceEl.value;
    if (bookShift) bookShift.value = shiftEl.value;
  }

  openBookingModal();
}

// Load Patients List for Select
async function loadPatientsList() {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      state.patients = data.data;
      const select = document.getElementById('select-patient');
      if (select) {
        select.innerHTML = data.data.map(p => `
          <option value="${p.id}" ${p.id === state.selectedPatientId ? 'selected' : ''}>Cédula: ${p.cedula} - ${p.fullName} (${p.age} años)</option>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('Error cargando lista de pacientes...');
  }
}

// Patient Verification by Cédula
async function verifyPatientByCedula() {
  const cedula = document.getElementById('inp-search-cedula').value.trim();
  if (!cedula) {
    alert('Ingresá un número de Cédula válido.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/patients/cedula/${cedula}`);
    const data = await res.json();
    if (data.success && data.found) {
      const patient = data.data;
      state.selectedPatientId = patient.id;
      state.selectedPatientData = patient;
      
      const select = document.getElementById('select-patient');
      if (select) select.value = patient.id;

      renderPatientClinicalBar(patient);
      await loadVitals(patient.id);
      alert(`¡Paciente encontrado! Cédula: ${patient.cedula} - ${patient.fullName}`);
    } else {
      alert(`No se encontró paciente con la Cédula ${cedula}. Podés agendar un servicio para registrarlo.`);
    }
  } catch (err) {
    alert('Error al verificar Cédula.');
  }
}

async function autofillPatientByCedula(cedula) {
  if (!cedula || cedula.length < 5) return;
  try {
    const res = await fetch(`${API_BASE}/patients/cedula/${cedula}`);
    const data = await res.json();
    if (data.success && data.found) {
      const p = data.data;
      document.getElementById('book-patient-name').value = p.fullName;
      if (p.familyPhone) document.getElementById('book-family-phone').value = p.familyPhone;
    }
  } catch (err) {
    console.log('Verificando nueva Cédula...');
  }
}

function renderPatientClinicalBar(patient) {
  const bar = document.getElementById('patient-clinical-bar');
  if (!bar || !patient) return;

  const cr = patient.clinicalRecord || {};
  bar.innerHTML = `
    <div class="cs-item">
      <span class="cs-label">Cédula Identidad</span>
      <span class="cs-val"><i class="fa-solid fa-id-card"></i> ${patient.cedula}</span>
    </div>
    <div class="cs-item">
      <span class="cs-label">Paciente</span>
      <span class="cs-val">${patient.fullName} (${patient.age} años)</span>
    </div>
    <div class="cs-item">
      <span class="cs-label">Grupo Sanguíneo</span>
      <span class="cs-val">${patient.bloodType || 'O+'}</span>
    </div>
    <div class="cs-item">
      <span class="cs-label">Alergias</span>
      <span class="cs-val" style="color:#ef4444;">${patient.allergies || 'Ninguna'}</span>
    </div>
    <div class="cs-item">
      <span class="cs-label">Diagnóstico Principal</span>
      <span class="cs-val" style="color:#f59e0b;">${cr.primaryDiagnosis || patient.condition}</span>
    </div>
  `;
}

// Load Testimonials & Client Photos
async function loadReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/reviews`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      state.reviews = data.data;
      renderReviews(data.data);
    }
  } catch (err) {
    console.warn('Cargando testimonios...');
  }
}

function renderReviews(reviews) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = reviews.map(rev => {
    const stars = '⭐'.repeat(rev.rating || 5);
    return `
      <div class="review-card">
        <div>
          <div class="review-profile">
            <img src="${rev.photoUrl}" alt="${rev.clientName}" class="review-photo" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'">
            <div class="review-author">
              <h4>${rev.clientName}</h4>
              <span>${rev.relation}</span>
              ${rev.isVerified ? '<span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Cliente Verificado</span>' : ''}
            </div>
          </div>
          <div class="review-stars">${stars}</div>
          <p class="review-quote">"${rev.comment}"</p>
        </div>
        <div class="review-date"><i class="fa-regular fa-calendar-alt"></i> ${rev.date || 'Reciente'}</div>
      </div>
    `;
  }).join('');
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('rev-client-name').value;
  const relation = document.getElementById('rev-relation').value;
  const photoUrl = document.getElementById('rev-photo-url').value;
  const rating = document.getElementById('rev-rating').value;
  const comment = document.getElementById('rev-comment').value;

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName: name, relation, photoUrl, rating, comment })
    });
    const data = await res.json();
    if (data.success) {
      alert('¡Gracias por tu recomendación! Ha sido publicada con éxito.');
      closeReviewModal();
      await loadReviews();
      await loadAdminData();
    }
  } catch (err) {
    alert('Error publicando recomendación.');
  }
}

function openReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.add('active');
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('active');
}

// Admin Auth Handlers
function openAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('active');
}

function closeAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.remove('active');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('admin-user').value;
  const pass = document.getElementById('admin-pass').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
      state.isAdminLoggedIn = true;
      state.adminToken = data.token;
      localStorage.setItem('homecare_admin_token', data.token);
      alert('¡Bienvenido Administrador!');
      closeAdminLoginModal();
      updateAdminUIState();
      await loadAdminData();
    } else {
      alert(data.error || 'Credenciales incorrectas.');
    }
  } catch (err) {
    alert('Error conectando con la API de autenticación.');
  }
}

function logoutAdmin() {
  state.isAdminLoggedIn = false;
  state.adminToken = null;
  localStorage.removeItem('homecare_admin_token');
  updateAdminUIState();
}

function updateAdminUIState() {
  const lockBanner = document.getElementById('admin-lock-banner');
  const dashContent = document.getElementById('admin-dashboard-content');
  const btnHeader = document.getElementById('btn-admin-access');

  if (state.isAdminLoggedIn) {
    if (lockBanner) lockBanner.style.display = 'none';
    if (dashContent) dashContent.style.display = 'block';
    if (btnHeader) {
      btnHeader.innerHTML = '<i class="fa-solid fa-user-check"></i> Admin Activo';
      btnHeader.style.background = '#d1fae5';
      btnHeader.style.color = '#059669';
    }
  } else {
    if (lockBanner) lockBanner.style.display = 'flex';
    if (dashContent) dashContent.style.display = 'none';
    if (btnHeader) {
      btnHeader.innerHTML = '<i class="fa-solid fa-lock"></i> Acceso Admin';
      btnHeader.style.background = '#e0f2fe';
      btnHeader.style.color = '#0369a1';
    }
  }
}

// Clinical Record Modal Handlers
function openClinicalRecordModal() {
  const modal = document.getElementById('clinical-record-modal');
  if (modal) {
    modal.classList.add('active');
    if (state.selectedPatientData) {
      const p = state.selectedPatientData;
      const cr = p.clinicalRecord || {};
      document.getElementById('cr-cedula').value = p.cedula || '';
      document.getElementById('cr-fullname').value = p.fullName || '';
      document.getElementById('cr-age').value = p.age || 75;
      document.getElementById('cr-blood').value = p.bloodType || 'O+';
      document.getElementById('cr-allergies').value = p.allergies || '';
      document.getElementById('cr-diagnosis').value = cr.primaryDiagnosis || p.condition || '';
      document.getElementById('cr-meds').value = cr.prescribedMeds || '';
      document.getElementById('cr-doctor').value = cr.attendingDoctor || '';
      document.getElementById('cr-emergency').value = cr.emergencyContact || p.familyPhone || '';
      document.getElementById('cr-notes').value = cr.specialCareNotes || '';
    }
  }
}

function closeClinicalRecordModal() {
  const modal = document.getElementById('clinical-record-modal');
  if (modal) modal.classList.remove('active');
}

async function handleClinicalRecordSubmit(e) {
  e.preventDefault();
  const payload = {
    cedula: document.getElementById('cr-cedula').value,
    fullName: document.getElementById('cr-fullname').value,
    age: document.getElementById('cr-age').value,
    bloodType: document.getElementById('cr-blood').value,
    allergies: document.getElementById('cr-allergies').value,
    primaryDiagnosis: document.getElementById('cr-diagnosis').value,
    prescribedMeds: document.getElementById('cr-meds').value,
    attendingDoctor: document.getElementById('cr-doctor').value,
    emergencyContact: document.getElementById('cr-emergency').value,
    specialCareNotes: document.getElementById('cr-notes').value
  };

  try {
    const res = await fetch(`${API_BASE}/clinical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert('¡Ficha Clínica guardada con éxito!');
      closeClinicalRecordModal();
      await loadPatientsList();
      await verifyPatientByCedula();
    }
  } catch (err) {
    alert('Error al guardar Ficha Clínica.');
  }
}

// Load Nurses
async function loadNurses() {
  try {
    const res = await fetch(`${API_BASE}/nurses`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      state.nurses = data.data;
      renderNurses(data.data);
    }
  } catch (err) {
    console.error('Error cargando enfermeras:', err);
  }
}

function renderNurses(nurses) {
  const container = document.getElementById('nurses-container');
  if (!container) return;

  container.innerHTML = nurses.map(nurse => `
    <div class="nurse-card">
      <div class="nurse-img-wrap">
        <img src="${nurse.photoUrl}" alt="${nurse.name}">
        <span class="badge-nurse-exp">${nurse.experienceYears} años exp.</span>
      </div>
      <div class="nurse-body">
        <h3>${nurse.name}</h3>
        <p class="nurse-spec"><i class="fa-solid fa-user-nurse"></i> ${nurse.specialty}</p>
        <div class="nurse-rating">
          <i class="fa-solid fa-star"></i> <strong>${nurse.rating}</strong> (Excelente)
        </div>
        <p class="nurse-bio">${nurse.bio || 'Certificada en cuidados geriátricos y constante monitoreo médico.'}</p>
        <button class="btn-select-nurse" onclick="openBookingWithNurse('${nurse.id}', '${nurse.name}')">
          <i class="fa-solid fa-calendar-plus"></i> Solicitar a ${nurse.name.split(' ')[1]}
        </button>
      </div>
    </div>
  `).join('');
}

// Load Vital Signs
async function loadVitals(patientId) {
  try {
    const res = await fetch(`${API_BASE}/vitals/${patientId}`);
    const data = await res.json();
    if (data.success) {
      state.vitalLogs = data.data;
      renderVitalsDashboard(data.data);
      renderVitalsChart(data.data);
    }
  } catch (err) {
    console.error('Error cargando signos vitales:', err);
  }
}

function handlePatientChange(e) {
  state.selectedPatientId = e.target.value;
  const patient = state.patients.find(p => p.id === e.target.value);
  if (patient) {
    state.selectedPatientData = patient;
    renderPatientClinicalBar(patient);
  }
  loadVitals(e.target.value);
}

function renderVitalsDashboard(logs) {
  if (!logs || logs.length === 0) return;
  const latest = logs[0];

  const bpEl = document.getElementById('val-bp');
  const glucEl = document.getElementById('val-glucose');
  const spo2El = document.getElementById('val-spo2');
  const hrEl = document.getElementById('val-hr');

  if (bpEl) bpEl.innerHTML = `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic} <small>mmHg</small>`;
  if (glucEl) glucEl.innerHTML = `${latest.bloodGlucoseMgDl} <small>mg/dL</small>`;
  if (spo2El) spo2El.innerHTML = `${latest.oxygenSaturation} <small>%</small>`;
  if (hrEl) hrEl.innerHTML = `${latest.heartRateBpm} <small>bpm</small>`;

  const timelineContainer = document.getElementById('vitals-timeline');
  if (timelineContainer) {
    timelineContainer.innerHTML = logs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const flagClass = log.statusFlag === 'critico' ? 'flag-critico' : log.statusFlag === 'advertencia' ? 'flag-warning' : 'flag-normal';
      
      return `
        <div class="timeline-item ${flagClass}">
          <div class="t-time"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
          <div class="t-content">
            <h4>P.A: ${log.bloodPressureSystolic}/${log.bloodPressureDiastolic} | Glucosa: ${log.bloodGlucoseMgDl} mg/dL | SatO2: ${log.oxygenSaturation}%</h4>
            <p><strong>Medicamento:</strong> ${log.medicationAdministered || 'Sin dosis en este control'}</p>
            <p class="t-notes">"${log.nurseNotes}"</p>
            <span class="t-nurse"><i class="fa-solid fa-user-nurse"></i> Registrado por: ${log.nurseName}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Render SVG Vital Signs Trend Chart
function renderVitalsChart(logs) {
  const container = document.getElementById('vitals-chart-container');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="empty-msg">Sin datos suficientes para generar gráfico de tendencia.</p>';
    return;
  }

  const sorted = [...logs].reverse().slice(-6);
  const width = 600;
  const height = 140;
  const padding = 30;

  const pointsBp = sorted.map((l, i) => {
    const x = padding + (i * (width - padding * 2) / (sorted.length - 1 || 1));
    const y = height - padding - ((l.bloodPressureSystolic - 90) * (height - padding * 2) / 90);
    return `${x},${y}`;
  }).join(' ');

  const pointsSpo2 = sorted.map((l, i) => {
    const x = padding + (i * (width - padding * 2) / (sorted.length - 1 || 1));
    const y = height - padding - ((l.oxygenSaturation - 80) * (height - padding * 2) / 25);
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4"/>
      <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.2)"/>
      
      <polyline fill="none" stroke="#ef4444" stroke-width="3" points="${pointsBp}" />
      <polyline fill="none" stroke="#38bdf8" stroke-width="3" points="${pointsSpo2}" />

      <text x="${padding}" y="15" fill="#ef4444" font-size="12" font-weight="bold">━ Presión Sistólica (mmHg)</text>
      <text x="${padding + 200}" y="15" fill="#38bdf8" font-size="12" font-weight="bold">━ Sat O2 (%)</text>
    </svg>
  `;
}

// Handle Nurse Vital Sign Submission
async function handleVitalSubmit(e) {
  e.preventDefault();
  const sys = parseInt(document.getElementById('inp-bp-sys').value);
  const dia = parseInt(document.getElementById('inp-bp-dia').value);
  const gluc = parseInt(document.getElementById('inp-glucose').value);
  const spo2 = parseInt(document.getElementById('inp-spo2').value);
  const meds = document.getElementById('inp-meds').value;
  const notes = document.getElementById('inp-notes').value;

  const payload = {
    patientId: state.selectedPatientId,
    nurseId: 'nurse-1',
    nurseName: 'Lic. María Elena Ramos',
    bloodPressureSystolic: sys,
    bloodPressureDiastolic: dia,
    bloodGlucoseMgDl: gluc,
    oxygenSaturation: spo2,
    heartRateBpm: 74,
    temperatureCelsius: 36.6,
    medicationAdministered: meds,
    nurseNotes: notes
  };

  try {
    const res = await fetch(`${API_BASE}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert('¡Signos vitales registrados con éxito! Notificación enviada a WhatsApp.');
      document.getElementById('form-nurse-vitals').reset();
      await loadVitals(state.selectedPatientId);
      await loadWaLogs();
      await loadAdminData();
    }
  } catch (err) {
    alert('Error al conectar con la API.');
  }
}

// Admin Panel Data Loader
async function loadAdminData() {
  try {
    const resStats = await fetch(`${API_BASE}/stats`);
    const dataStats = await resStats.json();
    if (dataStats.success) {
      document.getElementById('stat-bookings').innerText = dataStats.data.totalBookings;
      document.getElementById('stat-patients').innerText = dataStats.data.activePatients;
      document.getElementById('stat-alerts').innerText = dataStats.data.activeAlerts;
      document.getElementById('stat-rating').innerText = `${dataStats.data.avgRating} / 5`;
    }

    const resAlerts = await fetch(`${API_BASE}/alerts`);
    const dataAlerts = await resAlerts.json();
    if (dataAlerts.success) {
      renderAdminAlerts(dataAlerts.data);
    }

    const resBookings = await fetch(`${API_BASE}/bookings`);
    const dataBookings = await resBookings.json();
    if (dataBookings.success) {
      renderAdminBookings(dataBookings.data);
    }
  } catch (err) {
    console.warn('Cargando panel admin...');
  }
}

function renderAdminAlerts(alerts) {
  const tbody = document.getElementById('admin-alerts-tbody');
  if (!tbody) return;

  if (!alerts || alerts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Sin alertas médicas registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = alerts.map(a => `
    <tr>
      <td><strong>${a.patientName}</strong></td>
      <td><span class="badge-discount" style="background:${a.severity === 'critico' ? '#ef4444' : '#f59e0b'};">${a.severity.toUpperCase()}</span></td>
      <td>${a.message}</td>
      <td>
        ${a.resolved 
          ? '<span style="color:#10b981;font-weight:bold;"><i class="fa-solid fa-check"></i> Resuelta</span>' 
          : `<button class="btn-action-sm btn-resolve" onclick="resolveAlert('${a.id}')">Marcar Resuelta</button>`
        }
      </td>
    </tr>
  `).join('');
}

async function resolveAlert(alertId) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Atendido por enfermera en domicilio.' })
    });
    const data = await res.json();
    if (data.success) {
      alert('Alerta marcada como resuelta.');
      await loadAdminData();
    }
  } catch (err) {
    alert('Error al actualizar alerta.');
  }
}

function renderAdminBookings(bookings) {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td><strong>${b.patientCedula || 'S/N'}</strong><br><small>${b.patientName}</small></td>
      <td>${b.shiftHours} ($${b.totalPriceUSD})</td>
      <td><strong style="color:var(--primary);">${b.status}</strong></td>
      <td>
        <select onchange="updateBookingStatus('${b.id}', this.value)" style="padding:4px;border-radius:6px;">
          <option value="en-proceso" ${b.status === 'en-proceso' ? 'selected' : ''}>En proceso</option>
          <option value="confirmada" ${b.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
          <option value="completada" ${b.status === 'completada' ? 'selected' : ''}>Completada</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, status) {
  try {
    await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadAdminData();
  } catch (err) {
    alert('Error al actualizar reserva.');
  }
}

// WhatsApp Simulator
async function sendWaSimMessage() {
  const input = document.getElementById('wa-user-input');
  const chatBody = document.getElementById('wa-chat-body');
  if (!input || !input.value.trim()) return;

  const userText = input.value.trim();
  input.value = '';

  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'wa-msg msg-sent';
  userMsgDiv.innerHTML = `<span>${userText}</span><small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>`;
  chatBody.appendChild(userMsgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: '0998765432', message: userText })
    });
    const data = await res.json();
    if (data.success) {
      setTimeout(() => {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'wa-msg msg-received';
        botMsgDiv.innerHTML = `<span>${data.botReply}</span><small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>`;
        chatBody.appendChild(botMsgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 600);

      await loadWaLogs();
    }
  } catch (err) {
    console.error('Error enviando mensaje a WhatsApp:', err);
  }
}

function handleWaKeyPress(e) {
  if (e.key === 'Enter') sendWaSimMessage();
}

async function loadWaLogs() {
  const container = document.getElementById('wa-logs-list');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/whatsapp/logs`);
    const data = await res.json();
    if (data.success) {
      container.innerHTML = data.data.map(log => `
        <div class="log-item">
          <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
          <span class="log-to">📲 Para: ${log.toPhone}</span>
          <p class="log-text">${log.messageText}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error cargando logs WA:', err);
  }
}

// Modal Controls
function openBookingModal(serviceType = '') {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('active');
    if (serviceType) {
      const select = document.getElementById('book-service-type');
      if (select) select.value = serviceType;
    }
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('active');
}

function openBookingWithNurse(nurseId, nurseName) {
  openBookingModal();
  const selectNurse = document.getElementById('book-nurse-id');
  if (selectNurse) selectNurse.value = nurseId;
}

// Handle Booking Submit
async function handleBookingSubmit(e) {
  e.preventDefault();
  const patientCedula = document.getElementById('book-patient-cedula').value.trim();
  const patientName = document.getElementById('book-patient-name').value.trim();
  const familyPhone = document.getElementById('book-family-phone').value.trim();
  const serviceType = document.getElementById('book-service-type').value;
  const shiftHours = document.getElementById('book-shift').value;
  const nurseId = document.getElementById('book-nurse-id').value;
  const date = document.getElementById('book-date').value;

  const prices = { '8h': 45, '12h': 65, '24h': 110, 'puntual': 25 };

  const payload = {
    patientCedula,
    patientName,
    familyPhone,
    serviceType,
    shiftHours,
    nurseId,
    nurseName: state.nurses.find(n => n.id === nurseId)?.name || 'Enfermera de Turno',
    date,
    status: 'confirmada',
    totalPriceUSD: prices[shiftHours] || 45
  };

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert(`¡Reserva #${data.data.id} creada exitosamente con Cédula ${patientCedula}! Notificación enviada por WhatsApp.`);
      closeBookingModal();
      document.getElementById('form-booking').reset();
      await loadPatientsList();
      await loadWaLogs();
      await loadAdminData();
    }
  } catch (err) {
    alert('Error al conectar con la API de reservas.');
  }
}
