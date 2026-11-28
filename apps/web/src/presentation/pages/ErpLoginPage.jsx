import React, { useState } from 'react';

export function ErpLoginPage({ onLogin, onBackToWeb }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLogin(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="erp-login-page">
      <div className="erp-login-showcase">
        <div className="erp-login-brand">
          <div className="erp-brand-icon"><i className="fa-solid fa-heart-pulse"></i></div>
          <div>
            <div className="erp-brand-title" style={{ fontSize: '20px' }}>SALUD KAWSAY ERP</div>
            <div className="erp-brand-sub">Plataforma Clínica & Administrativa</div>
          </div>
        </div>

        <div className="erp-login-hero">
          <h1>Gestión Clínica Integral para Profesionales de la Salud</h1>
          <p>
            Centralizá historias clínicas por cédula, odontogramas, control pediátrico, Kardex/eMAR, despacho operativo y finanzas en un solo entorno seguro.
          </p>
          <ul className="erp-login-features">
            <li><i className="fa-solid fa-tooth"></i> Suite Multi-Especialidad: Odontología, Pediatría y Recetario CIE-10</li>
            <li><i className="fa-solid fa-map-location-dot"></i> Control EVV GPS de Asistencia y Notificaciones WhatsApp</li>
            <li><i className="fa-solid fa-chart-line"></i> Unit Economics en tiempo real y Nómina MSP</li>
          </ul>
        </div>

        <div className="erp-login-footer-note">
          <i className="fa-solid fa-shield-halved"></i> Acceso exclusivo para personal autorizado · Salud Kawsay Ecuador
        </div>
      </div>

      <div className="erp-login-form-side">
        <div className="erp-login-card">
          <button type="button" className="erp-back-link" onClick={onBackToWeb}>
            <i className="fa-solid fa-arrow-left"></i> Volver al sitio público
          </button>

          <div className="erp-login-card-header">
            <h2>Iniciar Sesión en el ERP</h2>
            <p>Ingresá tus credenciales corporativas para acceder al panel clínico.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Usuario / Email Corporativo</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresá tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña de Acceso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-confirm-booking"
              disabled={isSubmitting}
              style={{ marginTop: '8px' }}
            >
              <i className="fa-solid fa-right-to-bracket"></i> {isSubmitting ? 'Verificando...' : 'Ingresar al Módulo ERP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
