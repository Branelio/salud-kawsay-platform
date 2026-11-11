import React, { useState } from 'react';

export function AdminLoginModal({ isOpen, onClose, onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, pass);
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-card glass-modal">
        <div className="modal-header">
          <h3><i className="fa-solid fa-user-shield"></i> Acceso Administrador</h3>
          <button className="btn-close-modal" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario / Email Administrador</label>
            <input
              type="text"
              placeholder="Ingrese su usuario o correo"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña de Acceso</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-confirm-booking" style={{ marginTop: '16px' }}>
            <i className="fa-solid fa-sign-in-alt"></i> Iniciar Sesión en Panel Admin
          </button>
        </form>
      </div>
    </div>
  );
}
