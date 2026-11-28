import React, { useState } from 'react';

const ROLE_META = {
  admin: { label: 'Administrador / Gerencia', color: '#059669', access: 'Acceso Total (Finanzas, Clínica, Usuarios)' },
  doctor: { label: 'Médico / Especialista', color: '#0284c7', access: 'Agenda, Suite Clínica, Kardex, Pacientes, Alertas' },
  nurse: { label: 'Enfermero/a', color: '#0d9488', access: 'Despacho, Control EVV, Kardex eMAR, Alertas' },
  reception: { label: 'Recepción & Caja', color: '#6366f1', access: 'Agenda, Pacientes, Caja SRI, Inventario' }
};

export function UsersRbacPanel({ users, onCreateUser, onToggleUser }) {
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [specialty, setSpecialty] = useState('Odontología');
  const [clinicName, setClinicName] = useState('Salud Kawsay Matriz Quito');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !username || !password || !onCreateUser) return;
    onCreateUser({
      fullName,
      username,
      password,
      role,
      specialty,
      clinicId: clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      clinicName
    });
    setFullName('');
    setUsername('');
    setPassword('');
    setShowForm(false);
  };

  return (
    <div className="admin-table-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
            <span><i className="fa-solid fa-user-lock"></i> Usuarios, Roles (RBAC) & Multi-Clínica</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Creá accesos individuales con contraseña cifrada (`scrypt`) para doctores, odontólogos, pediatras, enfermeras y recepción.
          </p>
        </div>
        <button type="button" className="btn-secondary-sm" onClick={() => setShowForm(!showForm)}>
          <i className="fa-solid fa-user-plus"></i> Nuevo Usuario de Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rx-form-box" style={{ marginBottom: '18px', borderColor: '#059669' }}>
          <div className="rx-form-grid">
            <div><label>Nombre Completo *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Dra. Valeria Mendoza" required /></div>
            <div><label>Usuario / Email Login *</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: vmendoza@clinica.ec" required /></div>
            <div><label>Contraseña Temporal *</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} /></div>
            <div>
              <label>Rol y Permisos (RBAC)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="doctor">Médico / Especialista</option>
                <option value="nurse">Enfermero / a</option>
                <option value="reception">Recepción & Caja SRI</option>
                <option value="admin">Administrador / Gerencia</option>
              </select>
            </div>
            <div><label>Especialidad / Área</label><input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej: Pediatría / Odontología" /></div>
            <div><label>Sede / Clínica (Multi-Tenant)</label><input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff' }}>Crear Cuenta Segura</button>
            <button type="button" className="btn-secondary-sm" style={{ background: '#94a3b8', color: '#fff' }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profesional / Usuario</th>
              <th>Rol (RBAC)</th>
              <th>Permisos Habilitados</th>
              <th>Clínica / Sede</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).length > 0 ? (
              users.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.doctor;
                return (
                  <tr key={u.userId}>
                    <td><strong>{u.name}</strong><br /><small style={{ fontFamily: 'monospace', color: '#64748b' }}>{u.username}</small></td>
                    <td><span className="badge-discount" style={{ background: meta.color, fontSize: '11px' }}>{meta.label}</span></td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{meta.access}</td>
                    <td style={{ fontSize: '12px' }}><strong>{u.clinicName}</strong><br /><small>{u.specialty}</small></td>
                    <td>
                      <span className="badge-discount" style={{ background: u.active ? '#10b981' : '#ef4444' }}>
                        {u.active ? 'ACTIVO' : 'SUSPENDIDO'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn-action-sm" style={{ background: u.active ? '#d97706' : '#059669' }} onClick={() => onToggleUser && onToggleUser(u.userId)}>
                        {u.active ? 'Suspender' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  Solo está activo el Super-Admin maestro. Creá cuentas para tus doctores, odontólogos, pediatras y enfermeras arriba.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
