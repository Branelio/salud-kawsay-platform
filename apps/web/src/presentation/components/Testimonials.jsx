import React from 'react';

export function Testimonials({ reviews, onOpenReviewModal }) {
  return (
    <section id="testimonios" className="testimonials-section">
      <div className="section-header">
        <span className="section-subtitle">PRUEBA SOCIAL Y CONFIANZA</span>
        <h2>Historias de Familias que Confían en Nosotros</h2>
        <p>Mira las fotos y opiniones reales de quienes han vivido la experiencia de nuestro cuidado.</p>
      </div>

      <div className="testimonials-actions">
        <button className="btn-primary" onClick={onOpenReviewModal}>
          <i className="fa-solid fa-camera"></i> Subir mi Recomendación con Foto
        </button>
      </div>

      <div className="reviews-grid">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev) => {
            const stars = '⭐'.repeat(rev.rating || 5);
            return (
              <div key={rev.id || Math.random()} className="review-card">
                <div>
                  <div className="review-profile">
                    <img 
                      src={rev.photoUrl} 
                      alt={rev.clientName} 
                      className="review-photo" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'; }} 
                    />
                    <div className="review-author">
                      <h4>{rev.clientName}</h4>
                      <span>{rev.relation}</span>
                      {rev.isVerified && (
                        <span className="verified-badge">
                          <i className="fa-solid fa-circle-check"></i> Cliente Verificado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="review-stars">{stars}</div>
                  <p className="review-quote">"{rev.comment}"</p>
                </div>
                <div className="review-date">
                  <i className="fa-regular fa-calendar-alt"></i> {rev.date || 'Reciente'}
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-msg">Cargando testimonios de nuestros clientes...</p>
        )}
      </div>
    </section>
  );
}
