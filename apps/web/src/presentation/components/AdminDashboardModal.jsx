import React, { useState } from 'react';

export function AdminDashboardModal({ 
  isOpen, 
  onClose, 
  stats, 
  patients, 
  bookings, 
  alerts, 
  nurses, 
  onLogoutAdmin, 
  onOpenClinicalRecord, 
  onResolveAlert, 
  onUpdateBookingStatus,
  onCreateNurse,
  onAssignNurse,
  onUpdateFinancials
}) {
  const [activeTab, setActiveTab] = useState('reservas');
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [nurseName, setNurseName] = useState('');
  const [nurseSpecialty, setNurseSpecialty] = useState('Cuidados de Adulto Mayor y Gerontología');
  const [nurseExp, setNurseExp] = useState('5');
  const [nursePhone, setNursePhone] = useState('');
  const [nurseBio, setNurseBio] = useState('');

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
        bio: nurseBio || 'Especialista en atención y cuidados integrales en el hogar.'
      });
    }
    setNurseName('');
    setNursePhone('');
    setNurseBio('');
    setShowNurseModal(false);
  };

  // Financial calculations from stats or bookings
  const revenue = stats?.totalRevenueUSD ?? (bookings ? bookings.reduce((sum, b) => sum + (b.totalPriceUSD || 0), 0) : 0);
  const nursePayout = stats?.totalNursePayoutUSD ?? (bookings ? bookings.reduce((sum, b) => sum + (b.nursePayoutUSD || 0), 0) : 0);
  const netMargin = stats?.netAgencyMarginUSD ?? (revenue - nursePayout);
  const marginPct = stats?.marginPercentage ?? (revenue > 0 ? Math.round((netMargin / revenue) * 100) : 0);
  const pendingAssignments = stats?.pendingAssignments ?? (bookings ? bookings.filter(b => !b.assignedNurseId).length : 0);

  return (
    <div className="admin-fullscreen-modal">
      <div className="admin-dashboard-header">
        <h2>
          <i className="fa-solid fa-chart-line"></i> Dashboard General de Administración y Presupuestos
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
              <span>Liquidación a Enfermeras</span>
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
            <i className="fa-solid fa-id-card" style={{ color: '#059669' }}></i>
            <div>
              <h4>{patients ? patients.length : 0}</h4>
              <span>Pacientes en Expediente</span>
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
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <i className="fa-solid fa-users"></i> Directorio de Pacientes ({patients ? patients.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'enfermeras' ? 'active' : ''}`}
            onClick={() => setActiveTab('enfermeras')}
          >
            <i className="fa-solid fa-user-nurse"></i> Equipo de Enfermeras ({nurses ? nurses.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <i className="fa-solid fa-bell"></i> Alertas Médicas ({alerts ? alerts.length : 0})
          </button>
        </div>

        {/* Tab Contents */}
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

        {activeTab === 'reservas' && (
          <div className="admin-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
                  <i className="fa-solid fa-truck-medical"></i> Despacho Operativo & Control Financiero (Unit Economics)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Asignación de personal de enfermería en ruta, liquidación de honorarios y estado de cobranza por guardia.
                </p>
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
                  {bookings && bookings.length > 0 ? (
                    bookings.map(b => {
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
                        No hay reservas registradas en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {activeTab === 'enfermeras' && (
          <div className="admin-table-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}><i className="fa-solid fa-user-nurse"></i> Equipo de Enfermería Profesional ({nurses ? nurses.length : 0})</h3>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Nombre y Apellido *</label>
                      <input type="text" placeholder="Ej: Lic. Elena Morales" value={nurseName} onChange={(e) => setNurseName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Especialidad *</label>
                      <input type="text" placeholder="Ej: Cuidado Geriátrico / Heridas" value={nurseSpecialty} onChange={(e) => setNurseSpecialty(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
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
                    <th>Especialidad Principal</th>
                    <th>Experiencia</th>
                    <th>Valoración</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {nurses && nurses.length > 0 ? (
                    nurses.map(n => (
                      <tr key={n.id}>
                        <td><strong>{n.name}</strong></td>
                        <td>{n.specialty}</td>
                        <td>{n.experienceYears} años</td>
                        <td>⭐ {n.rating} / 5</td>
                        <td>{n.phone}</td>
                        <td><span className="badge-discount" style={{ background: '#10b981' }}>DISPONIBLE</span></td>
                      </tr>
                    ))
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
      </div>
    </div>
  );
}
