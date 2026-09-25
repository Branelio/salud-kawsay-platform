import React, { useState } from 'react';

export function Bitacora({ patients, selectedPatientId, patientData, vitalLogs, onSelectPatient, onVerifyCedula, onRegisterVitals }) {
  const [searchCedula, setSearchCedula] = useState('');
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [glucose, setGlucose] = useState('105');
  const [spo2, setSpo2] = useState('98');
  const [meds, setMeds] = useState('Enalapril 10mg - Hora 14:00');
  const [notes, setNotes] = useState('');

  const latest = vitalLogs && vitalLogs.length > 0 ? vitalLogs[0] : null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCedula.trim()) {
      onVerifyCedula(searchCedula.trim());
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onRegisterVitals({
      patientId: selectedPatientId,
      bloodPressureSystolic: parseInt(bpSys),
      bloodPressureDiastolic: parseInt(bpDia),
      bloodGlucoseMgDl: parseInt(glucose),
      oxygenSaturation: parseInt(spo2),
      heartRateBpm: 74,
      temperatureCelsius: 36.6,
      medicationAdministered: meds,
      nurseNotes: notes
    });
    setNotes('');
  };

  // Render SVG Trend Chart
  const renderSvgChart = () => {
    if (!vitalLogs || vitalLogs.length === 0) {
      return <p className="empty-msg">Sin datos suficientes para generar gráfico de tendencia.</p>;
    }

    const sorted = [...vitalLogs].reverse().slice(-6);
    const width = 600;
    const height = 140;
    const padding = 30;

    const pointsBp = sorted.map((l, i) => {
      const x = padding + (i * (width - padding * 2) / (sorted.length - 1 || 1));
      const y = height - padding - ((l.bloodPressureSystolic - 90) * (height - padding * 2) / 90);
      return `${x},${y}`;
    }).join(' ');

    const pointsSpo2 = sorted.map((l, i) => {
      const x = padding + (i * (width - padding * 2) / (sorted.length - 1 || 1));
      const y = height - padding - ((l.oxygenSaturation - 80) * (height - padding * 2) / 25);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.2)" strokeDasharray="4"/>
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="rgba(255,255,255,0.2)" strokeDasharray="4"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.2)"/>
        
        <polyline fill="none" stroke="#ef4444" strokeWidth="3" points={pointsBp} />
        <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={pointsSpo2} />

        <text x={padding} y="15" fill="#ef4444" fontSize="12" fontWeight="bold">━ Presión Sistólica (mmHg)</text>
        <text x={padding + 200} y="15" fill="#38bdf8" fontSize="12" fontWeight="bold">━ Sat O2 (%)</text>
      </svg>
    );
  };

  const cr = patientData?.clinicalRecord || {};

  return (
    <section id="bitacora" className="tracking-section">
      <div className="section-header light-text">
        <span className="section-subtitle">TECNOLOGÍA DE SEGUIMIENTO FAMILIAR</span>
        <h2>Bitácora Médica y Control en Tiempo Real</h2>
        <p>Consultá la evolución de tu ser querido desde cualquier dispositivo con búsqueda por Cédula.</p>
      </div>

      <div className="tracking-container">
        <div className="bitacora-dashboard glass-panel">
          <div className="dash-header">
            <div className="patient-selector">
              <i className="fa-solid fa-id-card"></i>
              <select value={selectedPatientId} onChange={(e) => onSelectPatient(e.target.value)}>
                {patients && patients.map(p => (
                  <option key={p.id} value={p.id}>Cédula: {p.cedula} - {p.fullName} ({p.age} años)</option>
                ))}
              </select>
            </div>

            <form className="cedula-search-box" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Buscar por Cédula (Ej: 1712345678)..." 
                value={searchCedula} 
                onChange={(e) => setSearchCedula(e.target.value)} 
              />
              <button type="submit" className="btn-search-cedula">
                <i className="fa-solid fa-search"></i> Verificar
              </button>
            </form>

            <div className="live-status-pill">
              <span className="pulse-dot"></span> Guardia En Proceso
            </div>
          </div>

          {patientData && (
            <div className="clinical-summary-bar">
              <div className="cs-item">
                <span className="cs-label">Cédula Identidad</span>
                <span className="cs-val"><i className="fa-solid fa-id-card"></i> {patientData.cedula}</span>
              </div>
              <div className="cs-item">
                <span className="cs-label">Paciente</span>
                <span className="cs-val">{patientData.fullName} ({patientData.age} años)</span>
              </div>
              <div className="cs-item">
                <span className="cs-label">Grupo Sanguíneo</span>
                <span className="cs-val">{patientData.bloodType || 'O+'}</span>
              </div>
              <div className="cs-item">
                <span className="cs-label">Alergias</span>
                <span className="cs-val" style={{ color: '#ef4444' }}>{patientData.allergies || 'Ninguna'}</span>
              </div>
              <div className="cs-item">
                <span className="cs-label">Diagnóstico Principal</span>
                <span className="cs-val" style={{ color: '#f59e0b' }}>{cr.primaryDiagnosis || patientData.condition}</span>
              </div>
            </div>
          )}

          <div className="vitals-cards-grid">
            <div className="vital-metric-card">
              <div className="metric-icon bp"><i className="fa-solid fa-stethoscope"></i></div>
              <div className="metric-info">
                <span className="metric-label">Presión Arterial</span>
                <strong>{latest ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}` : '125/82'} <small>mmHg</small></strong>
                <span className="metric-tag tag-normal">Óptima</span>
              </div>
            </div>

            <div className="vital-metric-card">
              <div className="metric-icon glucose"><i className="fa-solid fa-droplet"></i></div>
              <div className="metric-info">
                <span className="metric-label">Glucosa en Sangre</span>
                <strong>{latest ? latest.bloodGlucoseMgDl : '110'} <small>mg/dL</small></strong>
                <span className="metric-tag tag-normal">Normal</span>
              </div>
            </div>

            <div className="vital-metric-card">
              <div className="metric-icon spo2"><i className="fa-solid fa-lungs"></i></div>
              <div className="metric-info">
                <span className="metric-label">Saturación O2</span>
                <strong>{latest ? latest.oxygenSaturation : '97'} <small>%</small></strong>
                <span className="metric-tag tag-normal">Estable</span>
              </div>
            </div>

            <div className="vital-metric-card">
              <div className="metric-icon heart"><i className="fa-solid fa-heart-pulse"></i></div>
              <div className="metric-info">
                <span className="metric-label">Frecuencia Cardíaca</span>
                <strong>{latest ? latest.heartRateBpm : '72'} <small>bpm</small></strong>
                <span className="metric-tag tag-normal">Ritmo Regular</span>
              </div>
            </div>
          </div>

          <div className="vitals-chart-box">
            <div className="chart-header">
              <h4><i className="fa-solid fa-chart-line"></i> Gráficos de Tendencia de Signos Vitales</h4>
              <span className="chart-subtitle">Historial de tomas en las últimas guardias</span>
            </div>
            <div className="svg-chart-wrapper">
              {renderSvgChart()}
            </div>
          </div>

          <div className="bitacora-content-grid">
            <div className="timeline-box">
              <h3><i className="fa-solid fa-list-check"></i> Registro de la Guardia de Hoy</h3>
              <div className="timeline">
                {vitalLogs && vitalLogs.map(log => {
                  const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const flagClass = log.statusFlag === 'critico' ? 'flag-critico' : log.statusFlag === 'advertencia' ? 'flag-warning' : 'flag-normal';
                  return (
                    <div key={log.id} className={`timeline-item ${flagClass}`}>
                      <div className="t-time"><i className="fa-regular fa-clock"></i> {dateStr}</div>
                      <div className="t-content">
                        <h4>P.A: {log.bloodPressureSystolic}/{log.bloodPressureDiastolic} | Glucosa: {log.bloodGlucoseMgDl} mg/dL | SatO2: {log.oxygenSaturation}%</h4>
                        <p><strong>Medicamento:</strong> {log.medicationAdministered || 'Sin dosis en este control'}</p>
                        <p className="t-notes">"{log.nurseNotes}"</p>
                        <span className="t-nurse"><i className="fa-solid fa-user-nurse"></i> Registrado por: {log.nurseName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="nurse-entry-widget">
              <h3><i className="fa-solid fa-user-nurse"></i> Panel para Enfermera de Turno</h3>
              <p className="widget-subtitle">Registrar nuevos signos vitales y notificar a la familia por WhatsApp:</p>
              
              <form onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>P.A Sistólica</label>
                    <input type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>P.A Diastólica</label>
                    <input type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Glucosa (mg/dL)</label>
                    <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Sat. O2 (%)</label>
                    <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Medicamento Aplicado</label>
                  <input type="text" value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="Ej: Losartán 50mg" />
                </div>

                <div className="form-group">
                  <label>Observaciones de la Enfermera</label>
                  <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre alimentación, estado de ánimo..."></textarea>
                </div>

                <button type="submit" className="btn-submit-vitals">
                  <i className="fa-solid fa-paper-plane"></i> Guardar y Enviar a WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
