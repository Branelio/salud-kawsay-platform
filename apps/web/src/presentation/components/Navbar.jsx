import React from 'react';

export function Navbar({ onOpenBooking, onOpenAdminClick, isAdminLoggedIn, onLogoutAdmin }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo">
          <div className="logo-icon"><i className="fa-solid fa-heart-pulse"></i></div>
          <div className="logo-text">
            <span className="brand-name">SALUD KAWSAY</span>
            <span className="brand-tagline">CUIDADO DOMICILIARIO ECUADOR</span>
          </div>
        </div>
        
        <nav className="nav-links">
          <a href="#inicio" className="active">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#cotizador">Cotizador</a>
          <a href="#testimonios">Testimonios</a>
          <a href="#equipo">Enfermeras</a>
          <a href="#bitacora">Bitácora Médica</a>
        </nav>
        
        <div className="nav-actions">
          <a href="tel:0969532186" className="btn-phone">
            <i className="fa-solid fa-headset"></i> 096 953 2186
          </a>
          
          {isAdminLoggedIn ? (
            <div className="admin-btn-group">
              <button 
                id="btn-admin-access" 
                className="btn-admin-header logged-in" 
                onClick={onOpenAdminClick}
              >
                <i className="fa-solid fa-chart-line"></i> Dashboard Admin
              </button>
              <button 
                className="btn-admin-logout" 
                onClick={onLogoutAdmin}
                title="Cerrar Sesión Admin"
              >
                <i className="fa-solid fa-right-from-bracket"></i> Salir
              </button>
            </div>
          ) : (
            <button 
              id="btn-admin-access" 
              className="btn-admin-header" 
              onClick={onOpenAdminClick}
            >
              <i className="fa-solid fa-user"></i> Inicio de Sesión
            </button>
          )}

          <button 
            id="btn-open-booking" 
            className="btn-primary" 
            onClick={() => onOpenBooking('')}
          >
            <i className="fa-solid fa-calendar-check"></i> Reservar Servicio
          </button>
        </div>
      </div>
    </header>
  );
}
