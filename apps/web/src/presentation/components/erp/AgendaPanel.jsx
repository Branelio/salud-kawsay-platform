import React, { useState } from 'react';

export function AgendaPanel({ appointments, patients, onCreateAppointment, onUpdateAppointmentStatus }) {
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [specialty, setSpecialty] = useState('Odontología');
  const [professionalName, setProfessionalName] = useState('Dra. Valeria Mendoza');
  const [room, setRoom] = useState('Sillón Dental A');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const handlePatientSelect = (e) => {
    const p = (patients || []).find(pat => pat.id === e.target.value);
    if (p) {
      setPatientName(p.fullName);
      setPatientPhone(p.familyPhone);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName || !reason || !onCreateAppointment) return;
    onCreateAppointment({ patientName, patientPhone, specialty, professionalName, room, date, time, reason });
    setPatientName('');
    setPatientPhone('');
    setReason('');
    setShowForm(false);
  };

  return (
    <div className="admin-table-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
            <span><i className="fa-solid fa-calendar-week"></i> Agenda Clínica Multi-Especialidad & Recordatorios WhatsApp</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Coordinación de citas por consultorio, sillón dental o visita pediátrica con control de sala de espera.
          </p>
        </div>
        <button type="button" className="btn-secondary-sm" onClick={() => setShowForm(!showForm)}>
          <i className="fa-solid fa-calendar-plus"></i> Nueva Cita en Agenda
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rx-form-box" style={{ marginBottom: '18px', borderColor: '#0284c7' }}>
          <div className="rx-form-grid">
            <div>
              <label>Paciente Existente (Opcional)</label>
              <select onChange={handlePatientSelect} defaultValue="">
                <option value="">-- Nuevo o seleccionar --</option>
                {(patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div><label>Nombre Paciente *</label><input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required /></div>
            <div><label>Celular WhatsApp</label><input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="099..." /></div>
            <div>
              <label>Especialidad</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="Odontología">Odontología</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Enfermería">Enfermería</option>
              </select>
            </div>
            <div><label>Profesional *</label><input type="text" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} required /></div>
            <div><label>Consultorio / Sala</label><input type="text" value={room} onChange={(e) => setRoom(e.target.value)} /></div>
            <div><label>Fecha *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div><label>Hora *</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Motivo de consulta o procedimiento *" value={reason} onChange={(e) => setReason(e.target.value)} required style={{ flex: '1 1 280px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" className="btn-secondary-sm" style={{ background: '#0284c7', color: '#fff' }}>Agendar Cita</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Paciente</th>
              <th>Especialidad / Consultorio</th>
              <th>Profesional</th>
              <th>Motivo</th>
              <th>Estado Sala</th>
              <th>Recordatorio</th>
            </tr>
          </thead>
          <tbody>
            {(appointments || []).map(a => {
              const cleanPhone = (a.patientPhone || '').replace(/\D/g, '');
              const waUrl = `https://wa.me/593${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Hola ${a.patientName}, te recordamos tu cita de ${a.specialty} con ${a.professionalName} el ${a.date} a las ${a.time} en ${a.room}.`)}`;
              return (
                <tr key={a.id}>
                  <td><strong>{a.date}</strong><br /><span style={{ color: '#0284c7', fontWeight: 700 }}>{a.time}</span></td>
                  <td><strong>{a.patientName}</strong><br /><small>{a.patientPhone}</small></td>
                  <td><span className="badge-discount" style={{ background: '#0d9488', fontSize: '11px' }}>{a.specialty}</span><div style={{ fontSize: '12px', marginTop: '3px' }}>{a.room}</div></td>
                  <td style={{ fontSize: '13px' }}>{a.professionalName}</td>
                  <td style={{ fontSize: '12px' }}>{a.reason}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => onUpdateAppointmentStatus && onUpdateAppointmentStatus(a.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
                    >
                      <option value="confirmada">Confirmada</option>
                      <option value="en-sala">En Sala de Espera</option>
                      <option value="atendida">Atendida</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td>
                    {cleanPhone ? (
                      <a href={waUrl} target="_blank" rel="noreferrer" className="btn-action-sm" style={{ background: '#25D366', textDecoration: 'none' }}>
                        <i className="fa-brands fa-whatsapp"></i> Recordar
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
