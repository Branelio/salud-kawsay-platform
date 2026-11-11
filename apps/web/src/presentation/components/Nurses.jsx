import React from 'react';

export function Services({ onOpenBooking }) {
  const servicesList = [
    {
      id: 'adulto-mayor',
      title: 'Cuidados de Adulto Mayor',
      icon: 'fa-person-cane',
      desc: 'Acompañamiento integral, estimulación cognitiva, prevención de caídas y asistencia en higiene personal con total respeto y paciencia.'
    },
    {
      id: 'signos-vitales',
      title: 'Control de Signos Vitales',
      icon: 'fa-heart-pulse',
      desc: 'Monitoreo estricto de presión arterial, glucosa en sangre, saturación de oxígeno, temperatura y frecuencia cardíaca con registro gráfico.'
    },
    {
      id: 'medicamentos',
      title: 'Administración de Medicamentos',
      icon: 'fa-syringe',
      desc: 'Aplicación de inyectables, sueros endovenosos, medicación oral y estricto cumplimiento de horarios según prescripción médica.'
    },
    {
      id: 'curaciones',
      title: 'Curaciones y Heridas',
      icon: 'fa-kit-medical',
      desc: 'Curación de úlceras por presión, lesiones postquirúrgicas, retiro de puntos y manejo de drenajes con técnica aséptica profesional.'
    },
    {
      id: 'acompanamiento',
      title: 'Acompañamiento y Estimulación',
      icon: 'fa-hands-holding-child',
      desc: 'Ejercicios de movilidad asistida, actividades de estimulación de la memoria, acompañamiento a citas médicas y paseos de recreación.'
    },
    {
      id: 'avd-integral',
      title: 'Apoyo Diario Integral (AVD)',
      icon: 'fa-people-roof',
      desc: 'Asistencia permanente en actividades de la vida diaria, alimentación asistida, vestimenta, cambios posturales y transferencias de cama a silla.'
    }
  ];

  return (
    <section id="servicios" className="services-section">
      <div className="section-header">
        <span className="section-subtitle">NUESTROS SERVICIOS ESPECIALIZADOS</span>
        <h2>Brindamos Calidad de Vida y Tranquilidad a tu Familia</h2>
        <p>Cuidado médico y humano en la comodidad del hogar por enfermeras tituladas.</p>
      </div>
      
      <div className="services-grid">
        {servicesList.map(s => (
          <div key={s.id} className="service-card">
            <div className="service-icon"><i className={`fa-solid ${s.icon}`}></i></div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <button className="btn-service-link" onClick={() => onOpenBooking(s.id)}>
              Reservar Servicio <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Nurses({ nurses, onOpenBookingWithNurse }) {
  return (
    <section id="equipo" className="nurses-section">
      <div className="section-header">
        <span className="section-subtitle">EQUIPO DE ENFERMERÍA</span>
        <h2>Profesionales Capacitadas para Cuidar de los Tuyos</h2>
        <p>Personal verificado con acreditaciones profesionales y vocación de servicio.</p>
      </div>

      <div className="nurses-grid">
        {nurses && nurses.length > 0 ? (
          nurses.map(nurse => (
            <div key={nurse.id} className="nurse-card">
              <div className="nurse-img-wrap">
                <img src={nurse.photoUrl} alt={nurse.name} />
                <span className="badge-nurse-exp">{nurse.experienceYears} años exp.</span>
              </div>
              <div className="nurse-body">
                <h3>{nurse.name}</h3>
                <p className="nurse-spec"><i className="fa-solid fa-user-nurse"></i> {nurse.specialty}</p>
                <div className="nurse-rating">
                  <i className="fa-solid fa-star"></i> <strong>{nurse.rating}</strong> (Excelente)
                </div>
                <p className="nurse-bio">{nurse.bio || 'Certificada en cuidados geriátricos y constante monitoreo médico.'}</p>
                <button className="btn-select-nurse" onClick={() => onOpenBookingWithNurse(nurse.id)}>
                  <i className="fa-solid fa-calendar-plus"></i> Solicitar a {nurse.name.split(' ')[1]}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 24px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            border: '1px solid #d1fae5'
          }}>
            <div style={{ fontSize: '42px', color: '#059669', marginBottom: '14px' }}>
              <i className="fa-solid fa-user-nurse"></i>
            </div>
            <h3 style={{ color: '#064e3b', fontSize: '20px', marginBottom: '8px' }}>
              Personal de Enfermería Titulado y Verificado en Turnos Rotativos
            </h3>
            <p style={{ color: '#475569', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
              Todas nuestras licenciadas y profesionales cuentan con acreditación oficial del MSP, verificación de antecedentes y experiencia certificada en atención en el hogar.
            </p>
            <button className="btn-primary" onClick={() => onOpenBookingWithNurse('')}>
              <i className="fa-solid fa-calendar-check"></i> Agendar Guardia Domiciliaria
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
