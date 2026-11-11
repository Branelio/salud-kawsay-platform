import React, { useState } from 'react';

export function Navbar({ onOpenBooking, onOpenAdminClick, isAdminLoggedIn, onLogoutAdmin }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

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

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir menú"
        >
          <i className={isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </button>
        
        {/* Navigation Links (Desktop + Mobile Dropdown) */}
        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#inicio" className="active" onClick={handleLinkClick}>Inicio</a>
          <a href="#servicios" onClick={handleLinkClick}>Servicios</a>
          <a href="#cotizador" onClick={handleLinkClick}>Cotizador</a>
          <a href="#testimonios" onClick={handleLinkClick}>Testimonios</a>
          <a href="#equipo" onClick={handleLinkClick}>Enfermeras</a>
          <a href="#bitacora" onClick={handleLinkClick}>Bitácora Médica</a>

          {/* Action buttons inside mobile dropdown */}
          <div className="nav-mobile-actions">
            <a href="tel:0969532186" className="btn-phone" onClick={handleLinkClick}>
              <i className="fa-solid fa-headset"></i> 096 953 2186
            </a>
            
            {isAdminLoggedIn ? (
              <div className="admin-btn-group">
                <button 
                  className="btn-admin-header logged-in" 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAdminClick(); }}
                >
                  <i className="fa-solid fa-chart-line"></i> Dashboard Admin
                </button>
                <button 
                  className="btn-admin-logout" 
                  onClick={() => { setIsMobileMenuOpen(false); onLogoutAdmin(); }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Salir
                </button>
              </div>
            ) : (
              <button 
                className="btn-admin-header" 
                onClick={() => { setIsMobileMenuOpen(false); onOpenAdminClick(); }}
              >
                <i className="fa-solid fa-user"></i> Inicio de Sesión
              </button>
            )}

            <button 
              className="btn-primary" 
              onClick={() => { setIsMobileMenuOpen(false); onOpenBooking(''); }}
            >
              <i className="fa-solid fa-calendar-check"></i> Reservar Servicio
            </button>
          </div>
        </nav>
        
        {/* Desktop-only Actions */}
        <div className="nav-actions desktop-only">
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
