import React, { useState } from 'react';

export function ReviewModal({ isOpen, onClose, onSubmitReview }) {
  const [clientName, setClientName] = useState('');
  const [relation, setRelation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview({ clientName, relation, photoUrl, rating, comment });
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-card glass-modal">
        <div className="modal-header">
          <h3><i className="fa-solid fa-camera"></i> Subir mi Recomendación con Foto</h3>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tu Nombre Completo</label>
            <input type="text" placeholder="Ej: Ing. Carlos Delgado" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Relación con el Paciente</label>
            <input type="text" placeholder="Ej: Hijo de paciente / Nieto" value={relation} onChange={(e) => setRelation(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Enlace de la Foto o Imagen del Cliente / Familiar</label>
            <input type="url" placeholder="https://images.unsplash.com/... (o dejá en blanco para foto por defecto)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Calificación (Estrellas)</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)} required>
              <option value="5">⭐⭐⭐⭐⭐ (5 / 5 Excelente)</option>
              <option value="4">⭐⭐⭐⭐ (4 / 5 Muy Bueno)</option>
              <option value="3">⭐⭐⭐ (3 / 5 Aceptable)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tu Recomendación / Testimonio</label>
            <textarea rows="3" placeholder="Contanos tu experiencia con el cuidado y nuestras enfermeras..." value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
          </div>

          <button type="submit" className="btn-confirm-booking">
            <i className="fa-solid fa-paper-plane"></i> Publicar Recomendación
          </button>
        </form>
      </div>
    </div>
  );
}
