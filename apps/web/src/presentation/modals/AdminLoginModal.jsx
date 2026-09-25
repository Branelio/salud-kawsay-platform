import React, { useState } from 'react';

export function AdminLoginModal({ isOpen, onClose, onLogin }) {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('admin123');

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
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario / Email Administrador</label>
            <input type="text" value={user} onChange={(e) => setUser(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Contraseña de Acceso</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
          </div>

          <div className="admin-hint-box">
            <i className="fa-solid fa-lightbulb"></i> Credenciales de prueba: <strong>admin</strong> / <strong>admin123</strong>
          </div>

          <button type="submit" className="btn-confirm-booking">
            <i className="fa-solid fa-sign-in-alt"></i> Iniciar Sesión en Panel Admin
          </button>
        </form>
      </div>
    </div>
  );
}
