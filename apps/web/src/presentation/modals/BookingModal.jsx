import React, { useState, useEffect } from 'react';

export function BookingModal({ isOpen, onClose, defaultService, defaultShift, defaultNurseId, nurses, onVerifyCedula, onSubmitBooking }) {
  const [cedula, setCedula] = useState('');
  const [patientName, setPatientName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [serviceType, setServiceType] = useState('adulto-mayor');
  const [shiftHours, setShiftHours] = useState('12h-dia');
  const [nurseId, setNurseId] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  useEffect(() => {
    if (defaultService) setServiceType(defaultService);
    if (defaultShift) setShiftHours(defaultShift);
    if (defaultNurseId) setNurseId(defaultNurseId);
  }, [defaultService, defaultShift, defaultNurseId]);

  if (!isOpen) return null;

  const handleBlurCedula = async () => {
    if (cedula && cedula.length >= 5) {
      const patient = await onVerifyCedula(cedula);
      if (patient) {
        setPatientName(patient.fullName);
        if (patient.familyPhone) setFamilyPhone(patient.familyPhone);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitBooking({
      patientCedula: cedula,
      patientName,
      familyPhone,
      serviceType,
      shiftHours,
      nurseId,
      nurseName: nurses.find(n => n.id === nurseId)?.name || 'Enfermera de Turno',
      date
    });
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-card glass-modal">
        <div className="modal-header">
          <h3><i className="fa-solid fa-calendar-check"></i> Agendar Servicio de Enfermería</h3>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Cédula de Identidad del Paciente *</label>
              <input type="text" placeholder="Ej: 1712345678" value={cedula} onChange={(e) => setCedula(e.target.value)} onBlur={handleBlurCedula} required />
            </div>

            <div className="form-group">
              <label>Nombre Completo del Paciente *</label>
              <input type="text" placeholder="Ej: Sra. Carmen Delgado" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono Celular de la Familia (avisos por WhatsApp) *</label>
            <input type="tel" placeholder="Ej: 0998765432" value={familyPhone} onChange={(e) => setFamilyPhone(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Servicio</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} required>
                <option value="adulto-mayor">Cuidados de Adulto Mayor</option>
                <option value="signos-vitales">Control de Signos Vitales</option>
                <option value="medicamentos">Administración de Medicamentos</option>
                <option value="curaciones">Curaciones y Heridas</option>
                <option value="acompanamiento">Acompañamiento y Estimulación</option>
                <option value="avd-integral">Apoyo Diario Integral (AVD)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duración del Turno / Guardia</label>
              <select value={shiftHours} onChange={(e) => setShiftHours(e.target.value)} required>
                <option value="12h-dia">Guardia de Día (12 Horas) — $27 USD</option>
                <option value="12h-noche">Guardia de Velada / Noche (12 Horas) — $33 USD</option>
                <option value="8h">Guardia Corta (8 Horas) — $20 USD</option>
                <option value="24h">Cuidado Continuo (24 Horas) — $55 USD</option>
                <option value="puntual">Visita / Procedimiento Puntual — $14 USD</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Asignación de Enfermera</label>
            {nurses && nurses.length > 0 ? (
              <select value={nurseId} onChange={(e) => setNurseId(e.target.value)}>
                <option value="">-- Asignación automática por coordinación médica --</option>
                {nurses.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.specialty})</option>
                ))}
              </select>
            ) : (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fa-solid fa-user-shield" style={{ fontSize: '16px', color: '#059669' }}></i>
                <span>Asignación automática por coordinación médica según especialidad y cercanía al domicilio.</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Fecha del Servicio</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <button type="submit" className="btn-confirm-booking">
            <i className="fa-solid fa-check-circle"></i> Confirmar y Generar Reserva
          </button>
        </form>
      </div>
    </div>
  );
}
