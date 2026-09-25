import React from 'react';

export function Hero({ onOpenBooking }) {
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="badge-pill">
            <i className="fa-solid fa-shield-halved"></i> Enfermeras Profesionales Certificadas
          </div>
          <h1>SALUD KAWSAY <span className="text-gradient">cuidado con vocación,</span><br />EN EL CONFORT DE TU HOGAR</h1>
          <p className="hero-description">
            Cuidado integral y profesional para el bienestar de tu ser querido en el hogar. Monitoreo diario de signos vitales, expedientes por Cédula y reporte en tiempo real para tu tranquilidad familiar.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => onOpenBooking('')}>
              <i className="fa-solid fa-calendar-plus"></i> Agendar Cuidado Ahora
            </button>
            <a href="#cotizador" className="btn-hero-secondary">
              <i className="fa-solid fa-calculator"></i> Cotizar Servicio en Vivo
            </a>
          </div>
          
          <div className="trust-features">
            <div className="trust-item">
              <i className="fa-solid fa-user-nurse"></i>
              <div>
                <strong>Profesionales</strong>
                <span>Capacitadas y verificadas</span>
              </div>
            </div>
            <div className="trust-item">
              <i className="fa-solid fa-hand-holding-heart"></i>
              <div>
                <strong>Trato Humano</strong>
                <span>Empático y con calidez</span>
              </div>
            </div>
            <div className="trust-item">
              <i className="fa-solid fa-id-card"></i>
              <div>
                <strong>Registro Seguro</strong>
                <span>Ficha médica por Cédula</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-image-card">
          <div className="glass-card main-hero-img">
            <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80" alt="Cuidado de Adulto Mayor" />
            
            <div className="floating-badge badge-top-right">
              <i className="fa-solid fa-heart"></i>
              <div>
                <span className="badge-title">Atención 24/7</span>
                <span className="badge-sub">Guardias de 8h, 12h y 24h</span>
              </div>
            </div>
            
            <div className="floating-badge badge-bottom-left">
              <i className="fa-solid fa-square-check"></i>
              <div>
                <span className="badge-title">Signos Vitales Ok</span>
                <span className="badge-sub">Actualización por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
