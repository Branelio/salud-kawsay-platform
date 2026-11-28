import React, { useState, useEffect } from 'react';

export function PediatricsPanel({ patient, specialtyData, onSaveSpecialty }) {
  const [weightKg, setWeightKg] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState(0);
  const [growthNotes, setGrowthNotes] = useState('');
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    const ped = specialtyData?.pediatrics || {};
    setWeightKg(ped.weightKg || 0);
    setHeightCm(ped.heightCm || 0);
    setHeadCircumferenceCm(ped.headCircumferenceCm || 0);
    setGrowthNotes(ped.growthNotes || '');
    setVaccines(ped.vaccines || []);
  }, [specialtyData, patient?.id]);

  const bmi = heightCm > 0 ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : '—';

  const toggleVaccine = (idx) => {
    setVaccines(prev => prev.map((v, i) => {
      if (i !== idx) return v;
      const nextStatus = v.status === 'aplicada' ? 'pendiente' : 'aplicada';
      return {
        ...v,
        status: nextStatus,
        date: nextStatus === 'aplicada' ? new Date().toISOString().slice(0, 10) : undefined
      };
    }));
  };

  return (
    <div className="specialty-panel">
      <div className="specialty-panel-header">
        <div>
          <h4><i className="fa-solid fa-baby"></i> Control Pediátrico, Antropometría OMS y Esquema de Vacunación (MSP)</h4>
          <p>Paciente: <strong>{patient?.fullName}</strong> · IMC Calculado: <strong>{bmi} kg/m²</strong></p>
        </div>
        <button
          type="button"
          className="btn-secondary-sm"
          style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}
          onClick={() => onSaveSpecialty(patient.id, {
            pediatrics: {
              weightKg: Number(weightKg) || 0,
              heightCm: Number(heightCm) || 0,
              headCircumferenceCm: Number(headCircumferenceCm) || 0,
              growthNotes,
              vaccines
            }
          })}
        >
          <i className="fa-solid fa-floppy-disk"></i> Guardar Ficha Pediátrica
        </button>
      </div>

      <div className="pediatrics-metrics-row">
        <div>
          <label>Peso (kg)</label>
          <input type="number" step="0.1" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </div>
        <div>
          <label>Talla / Estatura (cm)</label>
          <input type="number" step="0.5" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
        </div>
        <div>
          <label>Perímetro Cefálico (cm)</label>
          <input type="number" step="0.1" min="0" value={headCircumferenceCm} onChange={(e) => setHeadCircumferenceCm(e.target.value)} />
        </div>
        <div>
          <label>Notas de Desarrollo / Percentil OMS</label>
          <input type="text" placeholder="Ej: Percentil 50 acorde a edad" value={growthNotes} onChange={(e) => setGrowthNotes(e.target.value)} />
        </div>
      </div>

      <div className="table-responsive" style={{ marginTop: '16px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Vacuna (Esquema Nacional MSP)</th>
              <th>Edad Recomendada</th>
              <th>Estado</th>
              <th>Fecha Aplicación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map((v, idx) => (
              <tr key={v.name}>
                <td><strong>{v.name}</strong></td>
                <td>{v.ageGroup}</td>
                <td>
                  <span className="badge-discount" style={{ background: v.status === 'aplicada' ? '#10b981' : '#f59e0b' }}>
                    {v.status === 'aplicada' ? 'APLICADA' : 'PENDIENTE'}
                  </span>
                </td>
                <td>{v.date || '—'}</td>
                <td>
                  <button
                    type="button"
                    className="btn-action-sm"
                    style={{ background: v.status === 'aplicada' ? '#64748b' : '#0284c7', cursor: 'pointer' }}
                    onClick={() => toggleVaccine(idx)}
                  >
                    {v.status === 'aplicada' ? 'Marcar Pendiente' : '✓ Registrar Dosis'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
