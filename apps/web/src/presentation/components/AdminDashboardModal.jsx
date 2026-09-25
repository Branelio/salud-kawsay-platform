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
  onUpdateBookingStatus 
}) {
  const [activeTab, setActiveTab] = useState('clientes');

  if (!isOpen) return null;

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
            <h3><i className="fa-solid fa-user-nurse"></i> Equipo de Enfermería Profesional</h3>
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
                  {nurses && nurses.map(n => (
                    <tr key={n.id}>
                      <td><strong>{n.name}</strong></td>
                      <td>{n.specialty}</td>
                      <td>{n.experienceYears} años</td>
                      <td>⭐ {n.rating} / 5</td>
                      <td>{n.phone}</td>
                      <td><span className="badge-discount" style={{ background: '#10b981' }}>DISPONIBLE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
