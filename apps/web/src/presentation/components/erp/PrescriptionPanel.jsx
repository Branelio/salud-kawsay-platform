import React, { useState } from 'react';

const CIE10_PRESETS = [
  { code: 'I10', desc: 'Hipertensión esencial (primaria)' },
  { code: 'E11', desc: 'Diabetes mellitus tipo 2' },
  { code: 'J00', desc: 'Rinofaringitis aguda (resfriado común)' },
  { code: 'J06.9', desc: 'Infección aguda de vías respiratorias superiores' },
  { code: 'K02.9', desc: 'Caries dental, no especificada' },
  { code: 'K04.0', desc: 'Pulpitis / Tratamiento endodóntico' },
  { code: 'M54.5', desc: 'Lumbago no especificado' },
  { code: 'Z50.1', desc: 'Cuidado postoperatorio y rehabilitación' }
];

export function PrescriptionPanel({ patient, prescriptions, onCreatePrescription }) {
  const [specialty, setSpecialty] = useState('Medicina General');
  const [cie10Code, setCie10Code] = useState('I10');
  const [cie10Description, setCie10Description] = useState('Hipertensión esencial (primaria)');
  const [doctorName, setDoctorName] = useState('Dr. Fernando Salazar');
  const [doctorLicense, setDoctorLicense] = useState('MSP-EC-44891');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Cada 12 horas');
  const [duration, setDuration] = useState('7 días');
  const [indications, setIndications] = useState('');

  const handleCieSelect = (e) => {
    const found = CIE10_PRESETS.find(c => c.code === e.target.value);
    if (found) {
      setCie10Code(found.code);
      setCie10Description(found.desc);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patient || !medName || !dosage || !onCreatePrescription) return;
    onCreatePrescription({
      patientId: patient.id,
      patientName: patient.fullName,
      patientCedula: patient.cedula,
      specialty,
      cie10Code,
      cie10Description,
      items: [{ medication: medName, dosage, frequency, duration }],
      indications,
      doctorName,
      doctorLicense
    });
    setMedName('');
    setDosage('');
    setIndications('');
  };

  const printPrescription = (rx) => {
    const win = window.open('', '_blank', 'width=820,height=650');
    if (!win) return;
    const itemsHtml = (rx.items || []).map(it =>
      `<li><strong>${it.medication}</strong> (${it.dosage}) — ${it.frequency} por ${it.duration}</li>`
    ).join('');
    win.document.write(`
      <html>
        <head>
          <title>Receta Médica #${rx.id} - Salud Kawsay</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 36px; color: #0f172a; }
            .hdr { border-bottom: 3px solid #059669; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .hdr h1 { margin: 0; color: #064e3b; font-size: 22px; }
            .meta { margin: 18px 0; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; }
            .rx-box { margin: 20px 0; padding: 18px; border: 1.5px solid #059669; border-radius: 8px; min-height: 180px; }
            .sig { margin-top: 48px; border-top: 1px solid #334155; width: 260px; padding-top: 6px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="hdr">
            <div>
              <h1>SALUD KAWSAY — RECETARIO MÉDICO DIGITAL</h1>
              <div>Especialidad: ${rx.specialty}</div>
            </div>
            <div><strong>Folio:</strong> #${rx.id}<br/><strong>Fecha:</strong> ${new Date(rx.createdAt).toLocaleDateString('es-EC')}</div>
          </div>
          <div class="meta">
            <strong>Paciente:</strong> ${rx.patientName} &nbsp;|&nbsp; <strong>Cédula:</strong> ${rx.patientCedula}<br/>
            <strong>Diagnóstico CIE-10:</strong> [${rx.cie10Code}] ${rx.cie10Description}
          </div>
          <div class="rx-box">
            <h3 style="margin-top:0;color:#064e3b;">Rp. / Prescripción</h3>
            <ul>${itemsHtml}</ul>
            ${rx.indications ? `<p><strong>Indicaciones Generales:</strong> ${rx.indications}</p>` : ''}
          </div>
          <div class="sig">
            <strong>${rx.doctorName}</strong><br/>
            Registro MSP / SENESCYT: ${rx.doctorLicense}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="specialty-panel">
      <div className="specialty-panel-header">
        <div>
          <h4><i className="fa-solid fa-file-prescription"></i> Recetario Médico Digital (CIE-10) & Impresión Formal</h4>
          <p>Emití recetas válidas con código CIE-10 y registro profesional listas para imprimir o enviar al paciente.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rx-form-box">
        <div className="rx-form-grid">
          <div>
            <label>Especialidad</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="Medicina General">Medicina General</option>
              <option value="Odontología">Odontología</option>
              <option value="Pediatría">Pediatría</option>
              <option value="Enfermería">Enfermería</option>
            </select>
          </div>
          <div>
            <label>Diagnóstico CIE-10 *</label>
            <select value={cie10Code} onChange={handleCieSelect}>
              {CIE10_PRESETS.map(c => (
                <option key={c.code} value={c.code}>[{c.code}] {c.desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Profesional Tratante *</label>
            <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required />
          </div>
          <div>
            <label>Registro MSP / SENESCYT *</label>
            <input type="text" value={doctorLicense} onChange={(e) => setDoctorLicense(e.target.value)} required />
          </div>
          <div>
            <label>Fármaco / Principio Activo *</label>
            <input type="text" placeholder="Ej: Amoxicilina + Ác. Clavulánico" value={medName} onChange={(e) => setMedName(e.target.value)} required />
          </div>
          <div>
            <label>Concentración / Dosis *</label>
            <input type="text" placeholder="Ej: 875/125 mg" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
          </div>
          <div>
            <label>Frecuencia</label>
            <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
          </div>
          <div>
            <label>Duración</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Indicaciones adicionales (ej: Tomar después de alimentos, evitar lácteos...)"
            value={indications}
            onChange={(e) => setIndications(e.target.value)}
            style={{ flex: '1 1 280px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}>
            <i className="fa-solid fa-file-medical"></i> Emitir Receta Digital
          </button>
        </div>
      </form>

      <div className="table-responsive" style={{ marginTop: '16px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Paciente</th>
              <th>Especialidad / CIE-10</th>
              <th>Prescripción</th>
              <th>Profesional</th>
              <th>Imprimir / PDF</th>
            </tr>
          </thead>
          <tbody>
            {(prescriptions || []).length > 0 ? (
              prescriptions.map(rx => (
                <tr key={rx.id}>
                  <td><strong>#{rx.id}</strong></td>
                  <td>
                    <strong>{rx.patientName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>CI: {rx.patientCedula}</div>
                  </td>
                  <td>
                    <span className="badge-discount" style={{ background: '#0284c7', fontSize: '11px' }}>{rx.specialty}</span>
                    <div style={{ fontSize: '12px', marginTop: '3px' }}><strong>[{rx.cie10Code}]</strong> {rx.cie10Description}</div>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {(rx.items || []).map((it, i) => (
                      <div key={i}><strong>{it.medication}</strong> {it.dosage} ({it.frequency} · {it.duration})</div>
                    ))}
                  </td>
                  <td style={{ fontSize: '12px' }}>{rx.doctorName}<br /><small>{rx.doctorLicense}</small></td>
                  <td>
                    <button type="button" className="btn-action-sm" style={{ background: '#0369a1', cursor: 'pointer' }} onClick={() => printPrescription(rx)}>
                      <i className="fa-solid fa-print"></i> Imprimir PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No hay recetas emitidas aún. Completá el formulario superior para generar la primera receta CIE-10.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
