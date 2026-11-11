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
  onCreateNurse
}) {
  const [activeTab, setActiveTab] = useState('clientes');
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

  // Calculate total revenue from bookings
  const totalRevenue = bookings ? bookings.reduce((sum, b) => sum + (b.totalPriceUSD || 0), 0) : 0;

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
          <button className="btn-secondary-sm" onClick={onOpenClinicalRecord}>
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
        {/* Metric Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card revenue">
            <i className="fa-solid fa-sack-dollar"></i>
            <div>
              <h4>${totalRevenue.toFixed(2)} USD</h4>
              <span>Presupuesto / Ingresos Totales</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-id-card" style={{ fontSize: '36px', color: '#059669' }}></i>
              <div>
                <h4>{patients ? patients.length : 0}</h4>
                <span>Clientes y Pacientes con Cédula</span>
              </div>
            </div>
          </div>

          <div className="admin-metric-card">
            <i className="fa-solid fa-calendar-check"></i>
            <div>
              <h4>{stats ? stats.totalBookings : 0}</h4>
              <span>Reservas de Servicio</span>
            </div>
          </div>

          <div className="admin-metric-card alerts">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <h4>{stats ? stats.activeAlerts : 0}</h4>
              <span>Alertas Médicas Activas</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <i className="fa-solid fa-users"></i> Directorio de Clientes ({patients ? patients.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <i className="fa-solid fa-calendar-days"></i> Gestión de Reservas ({bookings ? bookings.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <i className="fa-solid fa-bell"></i> Alertas Médicas ({alerts ? alerts.length : 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'enfermeras' ? 'active' : ''}`}
            onClick={() => setActiveTab('enfermeras')}
          >
            <i className="fa-solid fa-user-nurse"></i> Equipo de Enfermeras ({nurses ? nurses.length : 0})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'clientes' && (
          <div className="admin-table-card">
            <h3>
              <span><i className="fa-solid fa-address-book"></i> Clientes y Expedientes Médicos</span>
              <button className="btn-secondary-sm" onClick={onOpenClinicalRecord}>+ Nueva Ficha por Cédula</button>
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
                          <button className="btn-action-sm" onClick={onOpenClinicalRecord}>
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
            <h3><i className="fa-solid fa-calendar-days"></i> Control de Reservas y Presupuestos</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cédula / Paciente</th>
                    <th>Teléfono Familiar</th>
                    <th>Servicio / Guardia</th>
                    <th>Total Presupuesto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings && bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>#{b.id}</strong></td>
                      <td><strong>{b.patientCedula || '1712345678'}</strong><br/><small>{b.patientName}</small></td>
                      <td>{b.familyPhone}</td>
                      <td>{b.serviceType} ({b.shiftHours})</td>
                      <td><strong style={{ color: '#0284c7', fontSize: '16px' }}>${b.totalPriceUSD} USD</strong></td>
                      <td>
                        <span className="badge-discount" style={{ background: b.status === 'completada' ? '#10b981' : '#f59e0b' }}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={b.status} 
                          onChange={(e) => onUpdateBookingStatus(b.id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '6px', fontSize: '13px' }}
                        >
                          <option value="en-proceso">En proceso</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="completada">Completada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
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
