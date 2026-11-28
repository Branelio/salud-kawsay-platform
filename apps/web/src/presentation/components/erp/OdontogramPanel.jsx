import React, { useState, useEffect } from 'react';

const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];

const TOOTH_STATUS_META = {
  sano: { label: 'Sano', color: '#ffffff', border: '#cbd5e1', text: '#334155' },
  caries: { label: 'Caries', color: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  resina: { label: 'Resina / Obturación', color: '#dbeafe', border: '#2563eb', text: '#1e40af' },
  endodoncia: { label: 'Endodoncia', color: '#fef3c7', border: '#d97706', text: '#92400e' },
  corona: { label: 'Corona / Prótesis', color: '#d1fae5', border: '#059669', text: '#065f46' },
  extraccion: { label: 'Extracción / Ausente', color: '#e2e8f0', border: '#475569', text: '#1e293b' }
};

export function OdontogramPanel({ patient, specialtyData, onSaveSpecialty }) {
  const [selectedTool, setSelectedTool] = useState('caries');
  const [odontogram, setOdontogram] = useState({});
  const [treatmentPlan, setTreatmentPlan] = useState('');

  useEffect(() => {
    setOdontogram(specialtyData?.odontogram || {});
    setTreatmentPlan(specialtyData?.dentalTreatmentPlan || '');
  }, [specialtyData, patient?.id]);

  const handleToothClick = (toothNum) => {
    setOdontogram(prev => ({
      ...prev,
      [toothNum]: { status: selectedTool }
    }));
  };

  const renderToothRow = (teeth) => (
    <div className="odontogram-quadrant">
      {teeth.map(num => {
        const cond = odontogram[num]?.status || 'sano';
        const meta = TOOTH_STATUS_META[cond] || TOOTH_STATUS_META.sano;
        return (
          <button
            key={num}
            type="button"
            onClick={() => handleToothClick(num)}
            className="tooth-btn"
            style={{
              background: meta.color,
              borderColor: meta.border,
              color: meta.text
            }}
            title={`Pieza ${num}: ${meta.label}`}
          >
            <i className={`fa-solid ${cond === 'extraccion' ? 'fa-xmark' : 'fa-tooth'}`} style={{ fontSize: '16px' }}></i>
            <span className="tooth-num">{num}</span>
          </button>
        );
      })}
    </div>
  );

  const affectedCount = Object.values(odontogram).filter(v => v && v.status !== 'sano').length;

  return (
    <div className="specialty-panel">
      <div className="specialty-panel-header">
        <div>
          <h4><i className="fa-solid fa-tooth"></i> Odontograma Digital Interactivo (FDI — Formulario 033)</h4>
          <p>Paciente: <strong>{patient?.fullName}</strong> · Piezas con hallazgos: <strong>{affectedCount}</strong></p>
        </div>
        <button
          type="button"
          className="btn-secondary-sm"
          style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}
          onClick={() => onSaveSpecialty(patient.id, { odontogram, dentalTreatmentPlan: treatmentPlan })}
        >
          <i className="fa-solid fa-floppy-disk"></i> Guardar Odontograma
        </button>
      </div>

      {/* Tool Selector */}
      <div className="odontogram-tools">
        {Object.entries(TOOTH_STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedTool(key)}
            className={`tool-pill ${selectedTool === key ? 'active' : ''}`}
            style={{
              background: selectedTool === key ? meta.color : '#f8fafc',
              borderColor: selectedTool === key ? meta.border : '#cbd5e1',
              color: meta.text
            }}
          >
            <span className="tool-dot" style={{ background: meta.border }}></span>
            {meta.label}
          </button>
        ))}
      </div>

      {/* Dental Chart */}
      <div className="odontogram-grid-wrapper">
        <div className="odontogram-arch-label">Arcada Superior (18-11 | 21-28)</div>
        <div className="odontogram-arch">
          {renderToothRow(UPPER_RIGHT)}
          <div className="odontogram-divider"></div>
          {renderToothRow(UPPER_LEFT)}
        </div>
        <div className="odontogram-arch-label" style={{ marginTop: '14px' }}>Arcada Inferior (48-41 | 31-38)</div>
        <div className="odontogram-arch">
          {renderToothRow(LOWER_RIGHT)}
          <div className="odontogram-divider"></div>
          {renderToothRow(LOWER_LEFT)}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#064e3b' }}>
          Plan de Tratamiento Odontológico y Presupuesto
        </label>
        <textarea
          rows="2"
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
          placeholder="Ej: Profilaxis general + 2 resinas en piezas 16 y 26 + endodoncia pieza 36..."
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
        />
      </div>
    </div>
  );
}
