import React, { useState } from 'react';

export function Calculator({ onOpenBooking }) {
  const [service, setService] = useState('adulto-mayor');
  const [shift, setShift] = useState('12h-dia');
  const [freq, setFreq] = useState('1');

  // Tarifas promocionales de captación
  const shiftBasePrices = {
    '12h-dia': 27,      // Guardia de Día (12h)
    '12h-noche': 33,    // Guardia de Velada / Noche (12h)
    '8h': 20,           // Guardia de 8h
    '24h': 55,          // Cuidado Continuo 24h
    'puntual': 14       // Visita puntual (1-2h)
  };

  const serviceMultipliers = {
    'adulto-mayor': 1.0,
    'signos-vitales': 0.95,
    'medicamentos': 1.0,
    'curaciones': 1.05,
    'avd-integral': 1.10
  };

  const discounts = {
    '1': 0,
    '3': 0.05,
    '5': 0.10,
    '7': 0.15
  };

  const base = shiftBasePrices[shift] || 27;
  const multiplier = serviceMultipliers[service] || 1.0;
  const discount = discounts[freq] || 0;

  const rawTotal = base * multiplier;
  const finalTotal = (rawTotal * (1 - discount)).toFixed(2);
  const discountPercent = Math.round(discount * 100);

  const handleBookWithQuote = () => {
    onOpenBooking(service, shift);
  };

  return (
    <section id="cotizador" className="calculator-section">
      <div className="section-header">
        <span className="section-subtitle">TARIFAS PROMOCIONALES 2026</span>
        <h2>Cotizador de Enfermería a Domicilio en Vivo</h2>
        <p>Precios especiales de lanzamiento para brindar el mejor cuidado profesional al alcance de tu familia.</p>
      </div>

      <div className="calculator-container glass-card">
        <div className="calc-inputs-grid">
          <div className="calc-group">
            <label><i className="fa-solid fa-clock"></i> Tipo de Guardia / Turno</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="12h-dia">Guardia de Día (12 Horas) — $27 USD</option>
              <option value="12h-noche">Guardia de Velada / Noche (12 Horas) — $33 USD</option>
              <option value="8h">Guardia Corta (8 Horas) — $20 USD</option>
              <option value="24h">Cuidado Continuo (24 Horas) — $55 USD</option>
              <option value="puntual">Visita / Procedimiento Puntual (1-2h) — $14 USD</option>
            </select>
          </div>

          <div className="calc-group">
            <label><i className="fa-solid fa-user-doctor"></i> Especialidad Requerida</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="adulto-mayor">Cuidados de Adulto Mayor / Acompañamiento</option>
              <option value="signos-vitales">Monitoreo de Signos Vitales y Glucosa</option>
              <option value="medicamentos">Administración de Medicamentos e Inyectables</option>
              <option value="curaciones">Curaciones de Heridas y Postquirúrgico</option>
              <option value="avd-integral">Cuidado Intensivo y Apoyo Total (AVD)</option>
            </select>
          </div>

          <div className="calc-group">
            <label><i className="fa-solid fa-repeat"></i> Frecuencia Semanal</label>
            <select value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="1">1 Día eventual / ocasional</option>
              <option value="3">3 Días por semana (5% Descuento extra)</option>
              <option value="5">5 Días por semana (10% Descuento extra)</option>
              <option value="7">7 Días semanales continuos (15% Descuento extra)</option>
            </select>
          </div>
        </div>

        <div className="calc-result-banner">
          <div className="result-details">
            <span>Inversión Estimada:</span>
            <h3>${finalTotal} <small>USD / turno</small></h3>
            {discount > 0 && (
              <span className="badge-discount">¡{discountPercent}% Descuento Promocional!</span>
            )}
          </div>

          <button className="btn-calc-book" onClick={handleBookWithQuote}>
            <i className="fa-solid fa-calendar-check"></i> Reservar con esta Tarifa
          </button>
        </div>
      </div>
    </section>
  );
}
