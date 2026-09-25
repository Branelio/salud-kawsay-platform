import React, { useState, useEffect } from 'react';

export function ClinicalRecordModal({ isOpen, onClose, selectedPatient, onSubmitRecord }) {
  const [cedula, setCedula] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('82');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState('');
  const [doctor, setDoctor] = useState('');
  const [emergency, setEmergency] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      const cr = selectedPatient.clinicalRecord || {};
      setCedula(selectedPatient.cedula || '');
      setFullName(selectedPatient.fullName || '');
      setAge(selectedPatient.age || '82');
      setBloodType(selectedPatient.bloodType || 'O+');
      setAllergies(selectedPatient.allergies || '');
      setDiagnosis(cr.primaryDiagnosis || selectedPatient.condition || '');
      setMeds(cr.prescribedMeds || '');
      setDoctor(cr.attendingDoctor || '');
      setEmergency(cr.emergencyContact || selectedPatient.familyPhone || '');
      setNotes(cr.specialCareNotes || '');
    }
  }, [selectedPatient]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRecord({
      cedula,
      fullName,
      age,
      bloodType,
      allergies,
      primaryDiagnosis: diagnosis,
      prescribedMeds: meds,
      attendingDoctor: doctor,
      emergencyContact: emergency,
      specialCareNotes: notes
    });
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-card glass-modal modal-large">
        <div className="modal-header">
          <h3><i className="fa-solid fa-notes-medical"></i> Expediente / Ficha Clínica Digital</h3>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Cédula de Identidad del Paciente *</label>
              <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Nombre Completo del Paciente *</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Edad (Años)</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Grupo Sanguíneo</label>
              <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                <option value="O+">O Positivo (O+)</option>
                <option value="O-">O Negativo (O-)</option>
                <option value="A+">A Positivo (A+)</option>
                <option value="A-">A Negativo (A-)</option>
                <option value="B+">B Positivo (B+)</option>
                <option value="AB+">AB Positivo (AB+)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Alergias Conocidas</label>
            <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Ej: Penicilina, Sulfas" />
          </div>

          <div className="form-group">
            <label>Diagnóstico Médico Principal</label>
            <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Ej: Hipertensión Arterial, Postoperatorio..." />
          </div>

          <div className="form-group">
            <label>Medicamentos Prescritos y Dosis</label>
            <textarea rows="2" value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="Ej: Enalapril 10mg cada 12h..."></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Médico Tratante / Especialista</label>
              <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Ej: Dr. Fernando Salazar (Cardiólogo)" />
            </div>

            <div className="form-group">
              <label>Contacto de Emergencia / Familiar</label>
              <input type="text" value={emergency} onChange={(e) => setEmergency(e.target.value)} placeholder="Ej: Carlos Delgado (Hijo - 0998765432)" />
            </div>
          </div>

          <div className="form-group">
            <label>Indicaciones y Cuidados Especiales</label>
            <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Monitoreo estricto de P.A 2 veces al día..."></textarea>
          </div>

          <button type="submit" className="btn-confirm-booking">
            <i className="fa-solid fa-save"></i> Guardar Ficha Clínica
          </button>
        </form>
      </div>
    </div>
  );
}
