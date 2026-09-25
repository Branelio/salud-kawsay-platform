import React from 'react';

export function AdminPanel({ isAdminLoggedIn, stats, alerts, bookings, onOpenAdminLogin, onLogoutAdmin, onOpenClinicalRecord, onResolveAlert, onUpdateBookingStatus }) {
  return (
    <section id="admin-panel" className="admin-section">
      <div className="section-header">
        <span className="section-subtitle">PANEL DE CONTROL ADMINISTRATIVO</span>
        <h2>Gestión de Reservas, Cédulas y Fichas Clínicas</h2>
        <p>Visión general del estado del servicio, pacientes registrados y gestión médica.</p>
      </div>

      <div className="admin-container glass-card">
        {!isAdminLoggedIn ? (
          <div id="admin-lock-banner" className="admin-lock-msg">
            <i className="fa-solid fa-lock"></i>
            <div>
              <h4>Acceso Restringido para Administradores</h4>
              <p>Para modificar estados de reservas, resolver alertas y editar Fichas Clínicas, iniciá sesión.</p>
            </div>
            <button className="btn-primary" onClick={onOpenAdminLogin}>
              <i className="fa-solid fa-user"></i> Inicio de Sesión
            </button>
          </div>
        ) : (
          <div id="admin-dashboard-content">
            <div className="admin-top-bar">
              <span className="admin-welcome">
                <i className="fa-solid fa-user-shield"></i> Sesión Activa: <strong>Administrador General</strong>
              </span>
              <div className="admin-top-actions">
                <button className="btn-secondary-sm" onClick={onOpenClinicalRecord}>
                  <i className="fa-solid fa-notes-medical"></i> Crear/Editar Ficha Clínica
                </button>
                <button className="btn-logout-sm" onClick={onLogoutAdmin}>
                  <i className="fa-solid fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <i className="fa-solid fa-calendar-check"></i>
                <div>
                  <strong>{stats ? stats.totalBookings : 0}</strong>
                  <span>Reservas Totales</span>
                </div>
              </div>

              <div className="stat-card">
                <i className="fa-solid fa-hospital-user"></i>
                <div>
                  <strong>{stats ? stats.activePatients : 0}</strong>
                  <span>Pacientes con Cédula</span>
                </div>
              </div>

              <div className="stat-card alert-stat">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div>
                  <strong>{stats ? stats.activeAlerts : 0}</strong>
                  <span>Alertas Médicas Activas</span>
                </div>
              </div>

              <div className="stat-card">
                <i className="fa-solid fa-star"></i>
                <div>
                  <strong>{stats ? stats.avgRating : '4.9'} / 5</strong>
                  <span>Valoración Promedio</span>
                </div>
              </div>
            </div>

            <div className="admin-tables-grid">
              <div className="table-box">
                <h3><i className="fa-solid fa-bell"></i> Alertas Médicas de Signos Vitales</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Severidad</th>
                        <th>Detalle Alerta</th>
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
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Sin alertas médicas registradas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-box">
                <h3><i className="fa-solid fa-clock-rotate-left"></i> Reservas Recientes & Cédula</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cod</th>
                        <th>Cédula / Paciente</th>
                        <th>Turno</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings && bookings.map(b => (
                        <tr key={b.id}>
                          <td>#{b.id}</td>
                          <td><strong>{b.patientCedula || 'S/N'}</strong><br/><small>{b.patientName}</small></td>
                          <td>{b.shiftHours} (${b.totalPriceUSD})</td>
                          <td><strong style={{ color: '#059669' }}>{b.status}</strong></td>
                          <td>
                            <select 
                              value={b.status} 
                              onChange={(e) => onUpdateBookingStatus(b.id, e.target.value)}
                              style={{ padding: '4px', borderRadius: '6px' }}
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function WhatsAppSim({ waLogs, onSendMessage }) {
  const [inputText, setInputText] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, text: '👋 ¡Hola! Bienvenid@ a Cuidamos con Amor. ¿En qué podemos ayudarte hoy?', type: 'received', time: '10:00 AM' },
    { id: 2, text: 'Podés consultarme por: \n1️⃣ Reservar enfermera con Cédula\n2️⃣ Estado del paciente en vivo\n3️⃣ Recomendaciones de clientes', type: 'received', time: '10:00 AM' }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, type: 'sent', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const sentText = inputText;
    setInputText('');

    const reply = await onSendMessage(sentText);
    if (reply) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: reply, type: 'received', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
      }, 500);
    }
  };

  return (
    <section id="simulador-wa" className="wa-sim-section">
      <div className="section-header">
        <span className="section-subtitle">INTERACCIÓN EN TIEMPO REAL</span>
        <h2>Simulador del Bot de WhatsApp</h2>
        <p>Probá cómo interactúa el bot automático con las familias y notifica las reservas o alertas.</p>
      </div>

      <div className="wa-sim-container">
        <div className="phone-mockup">
          <div className="phone-header">
            <div className="wa-profile">
              <div className="wa-avatar"><i className="fa-solid fa-user-nurse"></i></div>
              <div className="wa-info">
                <strong>Enfermeras Profesionales Bot</strong>
                <span className="wa-status"><i className="fa-solid fa-circle"></i> En línea 24/7</span>
              </div>
            </div>
          </div>

          <div className="wa-chat-body">
            {messages.map(m => (
              <div key={m.id} className={`wa-msg ${m.type === 'sent' ? 'msg-sent' : 'msg-received'}`}>
                <span>{m.text}</span>
                <small>{m.time}</small>
              </div>
            ))}
          </div>

          <form className="wa-chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Escribí un mensaje (ej: 'precios' o 'cedula')..." 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
            />
            <button type="submit"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>

        <div className="wa-explanation">
          <h3><i className="fa-solid fa-robot"></i> ¿Cómo funciona el Bot para tu negocio?</h3>
          <ul>
            <li><i className="fa-solid fa-check"></i> <strong>Respuestas Inmediatas:</strong> Atiende clientes de campañas publicitarias a cualquier hora sin perder potenciales clientes.</li>
            <li><i className="fa-solid fa-check"></i> <strong>Notificaciones de Guardias:</strong> Envía un aviso automático al familiar cuando la enfermera llega al domicilio.</li>
            <li><i className="fa-solid fa-check"></i> <strong>Alertas Médicas:</strong> Si se registra una presión alta o saturación baja, dispara un mensaje urgente al familiar responsable.</li>
          </ul>

          <div className="log-box">
            <h4><i className="fa-solid fa-code"></i> Log de Envíos de WhatsApp (Live Webhook)</h4>
            <div className="logs-list">
              {waLogs && waLogs.map(log => (
                <div key={log.id} className="log-item">
                  <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="log-to"> 📲 Para: {log.toPhone}</span>
                  <p className="log-text">{log.messageText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
