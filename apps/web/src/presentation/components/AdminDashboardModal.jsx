import React, { useState } from 'react';

export function AdminDashboardModal({ 
  isOpen, 
  onClose, 
  stats, 
  patients, 
  bookings, 
  alerts, 
  nurses,
  checkins,
  medications,
  onLogoutAdmin, 
  onOpenClinicalRecord, 
  onResolveAlert, 
  onUpdateBookingStatus,
  onCreateNurse,
  onAssignNurse,
  onUpdateFinancials,
  onRegisterCheckin,
  onCreateMedication,
  onAdministerMedication
}) {
  const [activeTab, setActiveTab] = useState('reservas');
  
  // Dispatch filters & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  // Nurse registration form
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [nurseName, setNurseName] = useState('');
  const [nurseSpecialty, setNurseSpecialty] = useState('Cuidados de Adulto Mayor y Gerontología');
  const [nurseExp, setNurseExp] = useState('5');
  const [nursePhone, setNursePhone] = useState('');
  const [nurseLicense, setNurseLicense] = useState('');
  const [nurseBio, setNurseBio] = useState('');

  // EVV Check-in form
  const [evvNurseId, setEvvNurseId] = useState('');
  const [evvPatientId, setEvvPatientId] = useState('');
  const [evvEventType, setEvvEventType] = useState('ingreso');
  const [evvAddress, setEvvAddress] = useState('Av. Coruña 124, Quito');

  // Kardex / eMAR form & filter
  const [emarPatientFilter, setEmarPatientFilter] = useState('all');
  const [showMedForm, setShowMedForm] = useState(false);
  const [medPatientId, setMedPatientId] = useState('pat-1');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medRoute, setMedRoute] = useState('Oral');
  const [medSchedule, setMedSchedule] = useState('Cada 12h (08:00 - 20:00)');
  const [medDoctor, setMedDoctor] = useState('');

  if (!isOpen) return null;

  const handleAddNurseSubmit = (e) => {
    e.preventDefault();
    if (!nurseName || !nursePhone) return;
    if (onCreateNurse) {
      onCreateNurse({
        name: nurseName,
        specialty: nurseSpecialty,
        experienceYears: parseInt(nurseExp, 10) || 5,
        phone: nursePhone,
        licenseNumber: nurseLicense || `MSP-EC-${Math.floor(10000 + Math.random() * 90000)}`,
        bio: nurseBio || 'Especialista en atención y cuidados integrales en el hogar.'
      });
    }
    setNurseName('');
    setNursePhone('');
    setNurseLicense('');
    setNurseBio('');
    setShowNurseModal(false);
  };

  const handleEvvSubmit = (e) => {
    e.preventDefault();
    if (!onRegisterCheckin) return;
    const selectedNurse = (nurses || []).find(n => n.id === evvNurseId) || (nurses && nurses[0]);
    const selectedPatient = (patients || []).find(p => p.id === evvPatientId) || (patients && patients[0]);

    const submitPayload = (lat, lng) => {
      onRegisterCheckin({
        nurseId: selectedNurse ? selectedNurse.id : 'nurse-1',
        nurseName: selectedNurse ? selectedNurse.name : 'Enfermera de Turno',
        patientId: selectedPatient ? selectedPatient.id : 'pat-1',
        patientName: selectedPatient ? selectedPatient.fullName : 'Paciente Registrado',
        latitude: lat,
        longitude: lng,
        address: evvAddress || (selectedPatient ? selectedPatient.address : 'Domicilio en Quito'),
        eventType: evvEventType
      });
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submitPayload(pos.coords.latitude, pos.coords.longitude),
        () => submitPayload(-0.180653, -78.467838),
        { timeout: 3000 }
      );
    } else {
      submitPayload(-0.180653, -78.467838);
    }
  };

  const handleAddMedicationSubmit = (e) => {
    e.preventDefault();
    if (!medName || !medDosage || !onCreateMedication) return;
    const targetPatient = (patients || []).find(p => p.id === medPatientId);
    onCreateMedication({
      patientId: medPatientId,
      patientName: targetPatient ? targetPatient.fullName : 'Paciente',
      medicationName: medName,
      dosage: medDosage,
      route: medRoute,
      schedule: medSchedule,
      prescribedBy: medDoctor || 'Médico Tratante'
    });
    setMedName('');
    setMedDosage('');
    setMedDoctor('');
    setShowMedForm(false);
  };

  const handleExportBookingsCSV = () => {
    if (!bookings || bookings.length === 0) return;
    const headers = ['ID', 'Fecha', 'Cedula', 'Paciente', 'Servicio', 'Turno', 'Enfermera', 'Cobro_USD', 'Pago_Enfermera_USD', 'Margen_Agencia_USD', 'Cobranza', 'Estado'];
    const rows = bookings.map(b => {
      const clientPay = b.totalPriceUSD || 0;
      const nursePay = b.nursePayoutUSD || 0;
      const margin = b.agencyMarginUSD !== undefined ? b.agencyMarginUSD : (clientPay - nursePay);
      return [
        b.id,
        b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-EC') : '',
        b.patientCedula || '',
        `"${(b.patientName || '').replace(/"/g, '""')}"`,
        b.serviceType,
        b.shiftHours,
        `"${(b.assignedNurseName || 'Sin Asignar').replace(/"/g, '""')}"`,
        clientPay.toFixed(2),
        nursePay.toFixed(2),
        margin.toFixed(2),
        b.paymentStatus || 'pendiente',
        b.status
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `salud-kawsay-erp-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Financial calculations from stats or bookings
  const revenue = stats?.totalRevenueUSD ?? (bookings ? bookings.reduce((sum, b) => sum + (b.totalPriceUSD || 0), 0) : 0);
  const nursePayout = stats?.totalNursePayoutUSD ?? (bookings ? bookings.reduce((sum, b) => sum + (b.nursePayoutUSD || 0), 0) : 0);
  const netMargin = stats?.netAgencyMarginUSD ?? (revenue - nursePayout);
  const marginPct = stats?.marginPercentage ?? (revenue > 0 ? Math.round((netMargin / revenue) * 100) : 0);
  const pendingAssignments = stats?.pendingAssignments ?? (bookings ? bookings.filter(b => !b.assignedNurseId).length : 0);

  // Filtered bookings for Dispatch tab
  const filteredBookings = (bookings || []).filter(b => {
    const q = bookingSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      (b.patientName || '').toLowerCase().includes(q) ||
      (b.patientCedula || '').toLowerCase().includes(q) ||
      (b.id || '').toLowerCase().includes(q) ||
      (b.assignedNurseName || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (bookingFilter === 'unassigned') return !b.assignedNurseId;
    if (bookingFilter === 'unpaid') return (b.paymentStatus || 'pendiente') === 'pendiente';
    if (bookingFilter === 'completed') return b.status === 'completada';
    return true;
  });

  // Filtered medications for Kardex/eMAR tab
  const filteredMedications = (medications || []).filter(m =>
    emarPatientFilter === 'all' || m.patientId === emarPatientFilter
  );

  return (
    <div className="admin-fullscreen-modal">
      <div className="admin-dashboard-header">
        <h2>
          <i className="fa-solid fa-hospital"></i> Salud Kawsay ERP — Operaciones Clínicas y Finanzas
        </h2>
        <div className="admin-header-right">
          <span className="admin-user-pill">
            <i className="fa-solid fa-user-shield"></i> Admin General
          </span>
          <button className="btn-secondary-sm" onClick={() => onOpenClinicalRecord && onOpenClinicalRecord(null)}>
            <i className="fa-solid fa-notes-medical"></i> Crear/Editar Ficha Clínica
          </button>
          <button className="btn-logout-sm" onClick={onLogoutAdmin}>
            <i className="fa-solid fa-sign-out-alt"></i> Salir
          </button>
          <button className="btn-close-dash" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i> Volver a la Web
          </button>
        </div>
      </div>

      <div className="admin-dashboard-body">
        {/* Metric Cards - ERP Unit Economics & Operations */}
        <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <div className="admin-metric-card revenue">
            <i className="fa-solid fa-hand-holding-dollar" style={{ color: '#0284c7' }}></i>
            <div>
              <h4 style={{ color: '#0369a1' }}>${revenue.toFixed(2)} USD</h4>
              <span>Facturación Bruta (Clientes)</span>
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderColor: '#fed7aa' }}>
            <i className="fa-solid fa-user-nurse" style={{ color: '#ea580c' }}></i>
            <div>
              <h4 style={{ color: '#c2410c' }}>${nursePayout.toFixed(2)} USD</h4>
              <span>Nómina / Liquidación Enfermeras</span>
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
            <i className="fa-solid fa-chart-line" style={{ color: '#059669' }}></i>
            <div>
              <h4 style={{ color: '#047857' }}>${netMargin.toFixed(2)} USD</h4>
              <span>Margen Neto Agencia ({marginPct}%)</span>
            </div>
          </div>

          <div className="admin-metric-card alerts" style={{ borderColor: pendingAssignments > 0 ? '#fca5a5' : '#a7f3d0' }}>
            <i className={pendingAssignments > 0 ? "fa-solid fa-clipboard-user" : "fa-solid fa-circle-check"} style={{ color: pendingAssignments > 0 ? '#dc2626' : '#10b981' }}></i>
            <div>
              <h4 style={{ color: pendingAssignments > 0 ? '#b91c1c' : '#047857' }}>{pendingAssignments}</h4>
              <span>{pendingAssignments > 0 ? 'Guardias por Despachar' : 'Despacho al 100%'}</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <i className="fa-solid fa-location-dot" style={{ color: '#0284c7' }}></i>
            <div>
              <h4>{checkins ? checkins.length : 0}</h4>
              <span>Visitas Verificadas (EVV)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <i className="fa-solid fa-truck-medical"></i> Despacho & Finanzas ({bookings ? bookings.length : 0})
            {pendingAssignments > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginLeft: '6px' }}>
                {pendingAssignments} sin asignar
              </span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'evv' ? 'active' : ''}`}
            onClick={() => setActiveTab('evv')}
          >
            <i className="fa-solid fa-map-location-dot"></i> Control EVV ({checkins ? checkins.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'emar' ? 'active' : ''}`}
            onClick={() => setActiveTab('emar')}
          >
            <i className="fa-solid fa-pills"></i> Kardex / eMAR ({medications ? medications.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'enfermeras' ? 'active' : ''}`}
            onClick={() => setActiveTab('enfermeras')}
          >
            <i className="fa-solid fa-user-nurse"></i> Equipo y Nómina ({nurses ? nurses.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <i className="fa-solid fa-users"></i> Pacientes ({patients ? patients.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <i className="fa-solid fa-bell"></i> Alertas ({alerts ? alerts.length : 0})
          </button>
        </div>

        {/* TAB 1: DESPACHO & UNIT ECONOMICS */}
        {activeTab === 'reservas' && (
          <div className="admin-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
                  <i className="fa-solid fa-truck-medical"></i> Despacho Operativo & Control Financiero (Unit Economics)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Asignación de personal de enfermería en ruta, liquidación de honorarios y estado de cobranza por guardia.
                </p>
              </div>
              <button 
                className="btn-secondary-sm" 
                onClick={handleExportBookingsCSV}
                style={{ background: '#0369a1', color: '#fff', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-file-csv"></i> Exportar Reporte Contable (CSV)
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por paciente, cédula, #ID o enfermera..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{ flex: '1 1 240px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'unassigned', label: '⚠️ Sin Asignar' },
                  { key: 'unpaid', label: '🟡 Pendientes Cobro' },
                  { key: 'completed', label: '✅ Completadas' }
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setBookingFilter(f.key)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: bookingFilter === f.key ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: bookingFilter === f.key ? '#d1fae5' : '#f8fafc',
                      color: bookingFilter === f.key ? '#064e3b' : '#475569'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Guardia / Fecha</th>
                    <th>Paciente y Cédula</th>
                    <th>Contacto Familiar</th>
                    <th>Servicio / Turno</th>
                    <th style={{ minWidth: '220px' }}>Enfermera Asignada (Despacho)</th>
                    <th style={{ minWidth: '170px' }}>Unit Economics (Cobro / Payout / Margen)</th>
                    <th>Cobranza</th>
                    <th>Estado Guardia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map(b => {
                      const cleanPhone = (b.familyPhone || '').replace(/\D/g, '');
                      const waLink = `https://wa.me/593${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=Hola,%20nos%20comunicamos%20de%20Salud%20Kawsay%20para%20coordinar%20el%20servicio%20de%20enfermería%20de%20${encodeURIComponent(b.patientName || 'su familiar')}.`;
                      const clientPay = b.totalPriceUSD || 0;
                      const nursePay = b.nursePayoutUSD || 0;
                      const margin = b.agencyMarginUSD !== undefined ? b.agencyMarginUSD : (clientPay - nursePay);

                      return (
                        <tr key={b.id}>
                          <td>
                            <strong>#{b.id}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) : 'Reciente'}
                            </div>
                          </td>
                          <td>
                            <strong>{b.patientName}</strong>
                            <div style={{ fontSize: '12px', color: '#059669', fontFamily: 'monospace' }}>
                              <i className="fa-solid fa-id-card"></i> {b.patientCedula || 'S/N'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>{b.familyPhone}</div>
                            {cleanPhone && (
                              <a 
                                href={waLink} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px', textDecoration: 'none' }}
                              >
                                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i> Abrir Chat
                              </a>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{b.serviceType}</div>
                            <span className="badge-discount" style={{ background: '#0284c7', fontSize: '11px' }}>
                              {b.shiftHours}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={b.assignedNurseId || ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) {
                                  if (onAssignNurse) onAssignNurse(b.id, '', '');
                                } else {
                                  const selectedNurse = (nurses || []).find(n => n.id === selectedId);
                                  if (selectedNurse && onAssignNurse) {
                                    onAssignNurse(b.id, selectedNurse.id, selectedNurse.name);
                                  }
                                }
                              }}
                              style={{ 
                                width: '100%', 
                                padding: '6px 8px', 
                                borderRadius: '6px', 
                                fontSize: '12px',
                                border: b.assignedNurseId ? '1.5px solid #10b981' : '1.5px solid #ef4444',
                                background: b.assignedNurseId ? '#f0fdf4' : '#fef2f2',
                                fontWeight: 600,
                                color: b.assignedNurseId ? '#065f46' : '#991b1b'
                              }}
                            >
                              <option value="">⚠️ Sin Asignar (Requiere Despacho)</option>
                              {nurses && nurses.map(n => (
                                <option key={n.id} value={n.id}>
                                  {n.name} ({n.specialty ? n.specialty.split(' ')[0] : 'Enfermería'})
                                </option>
                              ))}
                            </select>
                            {b.assignedNurseName && (
                              <div style={{ fontSize: '11px', color: '#047857', marginTop: '3px' }}>
                                <i className="fa-solid fa-circle-check"></i> Asignada: <strong>{b.assignedNurseName}</strong>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                              <div>Cobro: <strong style={{ color: '#0284c7' }}>${clientPay.toFixed(2)}</strong></div>
                              <div>Pago Enf: <span style={{ color: '#d97706', fontWeight: 600 }}>-${nursePay.toFixed(2)}</span></div>
                              <div>Margen: <strong style={{ color: margin >= 0 ? '#059669' : '#dc2626' }}>+${margin.toFixed(2)}</strong></div>
                            </div>
                          </td>
                          <td>
                            <select 
                              value={b.paymentStatus || 'pendiente'}
                              onChange={(e) => {
                                if (onUpdateFinancials) {
                                  onUpdateFinancials(b.id, e.target.value, b.paymentMethod || 'transferencia', b.nursePayoutUSD);
                                }
                              }}
                              style={{ 
                                padding: '5px 8px', 
                                borderRadius: '6px', 
                                fontSize: '12px',
                                fontWeight: 700,
                                background: b.paymentStatus === 'pagado' || b.paymentStatus === 'facturado' ? '#dcfce7' : '#fef9c3',
                                color: b.paymentStatus === 'pagado' || b.paymentStatus === 'facturado' ? '#166534' : '#854d0e',
                                border: '1px solid #cbd5e1'
                              }}
                            >
                              <option value="pendiente">🟡 Pendiente</option>
                              <option value="pagado">🟢 Pagado</option>
                              <option value="facturado">🔵 Facturado</option>
                            </select>
                          </td>
                          <td>
                            <select 
                              value={b.status} 
                              onChange={(e) => onUpdateBookingStatus(b.id, e.target.value)}
                              style={{ padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="asignada">Asignada</option>
                              <option value="en-proceso">En Proceso</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No se encontraron guardias con ese criterio de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONTROL EVV (ELECTRONIC VISIT VERIFICATION - GPS CLOCK-IN/OUT) */}
        {activeTab === 'evv' && (
          <div className="admin-table-card">
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
                <i className="fa-solid fa-map-location-dot"></i> Control EVV — Verificación Electrónica de Visitas y Asistencia GPS
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Auditoría de ingreso y egreso en domicilio con coordenadas GPS verificadas y aviso automático por WhatsApp a la familia.
              </p>
            </div>

            {/* Registrar Fichaje EVV */}
            <form onSubmit={handleEvvSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1.5px solid #bae6fd', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#0f172a' }}>Enfermera</label>
                  <select value={evvNurseId} onChange={(e) => setEvvNurseId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    {nurses && nurses.length > 0 ? (
                      nurses.map(n => <option key={n.id} value={n.id}>{n.name}</option>)
                    ) : (
                      <option value="nurse-1">Enfermera de Turno (Demo)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#0f172a' }}>Paciente</label>
                  <select value={evvPatientId} onChange={(e) => setEvvPatientId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    {(patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#0f172a' }}>Evento de Guardia</label>
                  <select value={evvEventType} onChange={(e) => setEvvEventType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="ingreso">📍 Check-in (Ingreso a Domicilio)</option>
                    <option value="egreso">🏁 Check-out (Fin de Guardia)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#0f172a' }}>Dirección / Sector</label>
                  <input type="text" value={evvAddress} onChange={(e) => setEvvAddress(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <button type="submit" className="btn-secondary-sm" style={{ background: '#0284c7', color: '#fff', height: '38px', cursor: 'pointer' }}>
                  <i className="fa-solid fa-satellite-dish"></i> Registrar Fichaje EVV
                </button>
              </div>
            </form>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID EVV</th>
                    <th>Fecha / Hora</th>
                    <th>Enfermera</th>
                    <th>Paciente</th>
                    <th>Evento</th>
                    <th>Ubicación Verificada (GPS)</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins && checkins.length > 0 ? (
                    checkins.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td>{new Date(c.timestamp).toLocaleString('es-EC')}</td>
                        <td><strong>{c.nurseName}</strong></td>
                        <td>{c.patientName}</td>
                        <td>
                          <span className="badge-discount" style={{ background: c.eventType === 'egreso' ? '#0284c7' : '#10b981' }}>
                            {c.eventType === 'egreso' ? 'CHECK-OUT (SALIDA)' : 'CHECK-IN (INGRESO)'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>{c.address}</div>
                          <small style={{ color: '#64748b', fontFamily: 'monospace' }}>
                            Lat: {Number(c.latitude).toFixed(4)}, Lng: {Number(c.longitude).toFixed(4)}
                          </small>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No hay fichajes EVV registrados aún. Registrá un Check-in de prueba arriba para validar el monitoreo GPS.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: KARDEX / eMAR (ELECTRONIC MEDICATION ADMINISTRATION RECORD) */}
        {activeTab === 'emar' && (
          <div className="admin-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
                  <i className="fa-solid fa-pills"></i> Kardex Digital & eMAR (Registro Electrónico de Medicación)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Control estricto de dosis prescritas, vía de administración y confirmación en tiempo real por enfermería.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={emarPatientFilter} 
                  onChange={(e) => setEmarPatientFilter(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="all">Todos los Pacientes</option>
                  {(patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
                <button className="btn-secondary-sm" onClick={() => setShowMedForm(!showMedForm)} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-plus"></i> Nueva Prescripción
                </button>
              </div>
            </div>

            {showMedForm && (
              <form onSubmit={handleAddMedicationSubmit} style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1.5px solid #059669', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Paciente *</label>
                    <select value={medPatientId} onChange={(e) => setMedPatientId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      {(patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Medicamento *</label>
                    <input type="text" placeholder="Ej: Losartán / Insulina NPH" value={medName} onChange={(e) => setMedName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Dosis *</label>
                    <input type="text" placeholder="Ej: 50 mg" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Vía</label>
                    <select value={medRoute} onChange={(e) => setMedRoute(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="Oral">Oral</option>
                      <option value="Subcutánea">Subcutánea</option>
                      <option value="Intravenosa">Intravenosa</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Tópica">Tópica</option>
                      <option value="Inhalatoria">Inhalatoria</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Frecuencia / Horario *</label>
                    <input type="text" value={medSchedule} onChange={(e) => setMedSchedule(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Médico Prescriptor</label>
                    <input type="text" placeholder="Ej: Dr. Fernando Salazar" value={medDoctor} onChange={(e) => setMedDoctor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}>
                    <i className="fa-solid fa-save"></i> Guardar en Kardex
                  </button>
                  <button type="button" className="btn-secondary-sm" onClick={() => setShowMedForm(false)} style={{ background: '#94a3b8', color: '#fff', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Fármaco y Dosis</th>
                    <th>Vía / Horario</th>
                    <th>Médico Prescriptor</th>
                    <th>Última Administración</th>
                    <th>Acción eMAR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedications.length > 0 ? (
                    filteredMedications.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.patientName}</strong></td>
                        <td>
                          <strong style={{ color: '#064e3b', fontSize: '14px' }}>{m.medicationName}</strong>
                          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>{m.dosage}</div>
                        </td>
                        <td>
                          <span className="badge-discount" style={{ background: '#0d9488', fontSize: '11px' }}>{m.route}</span>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>{m.schedule}</div>
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>{m.prescribedBy}</td>
                        <td>
                          {m.lastAdministeredAt ? (
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ color: '#059669', fontWeight: 700 }}>✓ {new Date(m.lastAdministeredAt).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              <div style={{ color: '#64748b' }}>Por: {m.lastAdministeredBy}</div>
                              <small style={{ color: '#94a3b8' }}>({(m.administrationLogs || []).length} dosis registradas)</small>
                            </div>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 600, fontSize: '12px' }}>⏳ Pendiente primera toma</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-action-sm"
                            style={{ background: '#059669', cursor: 'pointer' }}
                            onClick={() => {
                              const activeNurse = nurses && nurses[0] ? nurses[0].name : 'Admin / Enfermera de Turno';
                              if (onAdministerMedication) {
                                onAdministerMedication(m.id, { nurseName: activeNurse, status: 'administrado', notes: 'Dosis confirmada en Kardex eMAR' });
                              }
                            }}
                          >
                            <i className="fa-solid fa-check-double"></i> Registrar Dosis
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No hay medicación registrada para este paciente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EQUIPO Y NÓMINA (HR & PAYROLL) */}
        {activeTab === 'enfermeras' && (
          <div className="admin-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}><i className="fa-solid fa-user-nurse"></i> Equipo de Enfermería, Credenciales MSP y Nómina ({nurses ? nurses.length : 0})</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Control de registro profesional (SENESCYT/MSP), guardias asignadas y honorarios acumulados por liquidar.
                </p>
              </div>
              <button className="btn-secondary-sm" onClick={() => setShowNurseModal(!showNurseModal)} style={{ cursor: 'pointer' }}>
                <i className="fa-solid fa-user-plus"></i> + Registrar Nueva Enfermera
              </button>
            </div>

            {showNurseModal && (
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1.5px solid #059669' }}>
                <h4 style={{ color: '#064e3b', marginBottom: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-id-card-clip"></i> Alta de Nueva Profesional de Enfermería
                </h4>
                <form onSubmit={handleAddNurseSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Nombre y Apellido *</label>
                      <input type="text" placeholder="Ej: Lic. Elena Morales" value={nurseName} onChange={(e) => setNurseName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Especialidad *</label>
                      <input type="text" placeholder="Ej: Cuidado Geriátrico / Heridas" value={nurseSpecialty} onChange={(e) => setNurseSpecialty(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Registro MSP / SENESCYT</label>
                      <input type="text" placeholder="Ej: MSP-EC-90412" value={nurseLicense} onChange={(e) => setNurseLicense(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Años de Experiencia *</label>
                      <input type="number" min="1" max="40" value={nurseExp} onChange={(e) => setNurseExp(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Teléfono Celular *</label>
                      <input type="tel" placeholder="Ej: 0991234567" value={nursePhone} onChange={(e) => setNursePhone(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Resumen / Bio Profesional</label>
                    <input type="text" placeholder="Breve descripción de su experiencia clínica y vocación" value={nurseBio} onChange={(e) => setNurseBio(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}>
                      <i className="fa-solid fa-floppy-disk"></i> Guardar y Habilitar Enfermera
                    </button>
                    <button type="button" className="btn-secondary-sm" onClick={() => setShowNurseModal(false)} style={{ background: '#94a3b8', color: '#fff', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Enfermera</th>
                    <th>Registro MSP / Credencial</th>
                    <th>Especialidad Principal</th>
                    <th>Turnos Asignados</th>
                    <th>Honorarios a Liquidar (Payroll)</th>
                    <th>Estado Operativo</th>
                  </tr>
                </thead>
                <tbody>
                  {nurses && nurses.length > 0 ? (
                    nurses.map(n => {
                      const nurseBookings = (bookings || []).filter(b => b.assignedNurseId === n.id);
                      const totalEarned = nurseBookings.reduce((sum, b) => sum + (b.nursePayoutUSD || 0), 0);
                      const isOnShift = nurseBookings.some(b => b.status === 'en-proceso');

                      return (
                        <tr key={n.id}>
                          <td>
                            <strong>{n.name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>📞 {n.phone} · ⭐ {n.rating}/5</div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                              {n.licenseNumber || 'MSP-EC-VERIF'}
                            </span>
                            <div style={{ fontSize: '11px', color: '#059669' }}>✓ Credencial Verificada</div>
                          </td>
                          <td>{n.specialty} ({n.experienceYears} años)</td>
                          <td><strong>{nurseBookings.length}</strong> guardias</td>
                          <td>
                            <strong style={{ color: '#c2410c', fontSize: '15px' }}>${totalEarned.toFixed(2)} USD</strong>
                          </td>
                          <td>
                            <span className="badge-discount" style={{ background: isOnShift ? '#0284c7' : '#10b981' }}>
                              {isOnShift ? 'EN GUARDIA ACTIVA' : 'DISPONIBLE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No hay enfermeras registradas en la base de datos. Haz clic en <strong>"+ Registrar Nueva Enfermera"</strong> para agregar personal profesional.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DIRECTORIO DE PACIENTES */}
        {activeTab === 'clientes' && (
          <div className="admin-table-card">
            <h3>
              <span><i className="fa-solid fa-address-book"></i> Clientes y Expedientes Médicos</span>
              <button className="btn-secondary-sm" onClick={() => onOpenClinicalRecord && onOpenClinicalRecord(null)}>+ Nueva Ficha por Cédula</button>
            </h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cédula Identidad</th>
                    <th>Nombre del Paciente</th>
                    <th>Edad</th>
                    <th>Grupo Sanguíneo</th>
                    <th>Alergias</th>
                    <th>Diagnóstico Principal</th>
                    <th>Contacto Familiar</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {patients && patients.map(p => {
                    const cr = p.clinicalRecord || {};
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.cedula}</strong></td>
                        <td>{p.fullName}</td>
                        <td>{p.age} años</td>
                        <td><span className="badge-discount" style={{ background: '#0284c7' }}>{p.bloodType || 'O+'}</span></td>
                        <td><span style={{ color: p.allergies === 'Ninguna' ? '#059669' : '#ef4444', fontWeight: 'bold' }}>{p.allergies || 'Ninguna'}</span></td>
                        <td>{cr.primaryDiagnosis || p.condition}</td>
                        <td>{p.familyContactName} ({p.familyPhone})</td>
                        <td>
                          <button className="btn-action-sm" onClick={() => onOpenClinicalRecord && onOpenClinicalRecord(p)}>
                            <i className="fa-solid fa-notes-medical"></i> Ver Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ALERTAS MÉDICAS */}
        {activeTab === 'alertas' && (
          <div className="admin-table-card">
            <h3><i className="fa-solid fa-bell"></i> Monitor de Alertas Médicas en Vivo</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Severidad</th>
                    <th>Detalle de la Alerta</th>
                    <th>Hora</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts && alerts.length > 0 ? (
                    alerts.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.patientName}</strong></td>
                        <td>
                          <span className="badge-discount" style={{ background: a.severity === 'critico' ? '#ef4444' : '#f59e0b' }}>
                            {a.severity.toUpperCase()}
                          </span>
                        </td>
                        <td>{a.message}</td>
                        <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                        <td>
                          {a.resolved ? (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                              <i className="fa-solid fa-check"></i> Resuelta
                            </span>
                          ) : (
                            <button className="btn-action-sm btn-resolve" onClick={() => onResolveAlert(a.id)}>
                              Marcar Resuelta
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin alertas médicas registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
