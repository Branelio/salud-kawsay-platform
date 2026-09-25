import React, { useState } from 'react';

export function Calculator({ onOpenBooking }) {
  const [service, setService] = useState('adulto-mayor');
  const [shift, setShift] = useState('8h');
  const [freq, setFreq] = useState('1');

  const basePrices = {
    'adulto-mayor': 45,
    'signos-vitales': 25,
    'medicamentos': 30,
    'curaciones': 35,
    'avd-integral': 55
  };

  const shiftFactors = {
    '8h': 1,
    '12h': 1.44,
    '24h': 2.44,
    'puntual': 0.55
  };

  const discounts = {
    '1': 0,
    '3': 0.05,
    '5': 0.10,
    '7': 0.15
  };

  const base = basePrices[service] || 45;
  const factor = shiftFactors[shift] || 1;
  const discount = discounts[freq] || 0;

  const rawTotal = base * factor;
  const finalTotal = (rawTotal * (1 - discount)).toFixed(2);
  const discountPercent = Math.round(discount * 100);

  const handleBookWithQuote = () => {
    onOpenBooking(service, shift);
  };

  return (
    <section id="cotizador" className="calculator-section">
      <div className="section-header">
        <span className="section-subtitle">TRANSPARENCIA TOTAL</span>
        <h2>Cotizador de Servicio de Enfermería en Vivo</h2>
        <p>Calculá al instante el valor estimado del cuidado según la duración del turno y frecuencia requerida.</p>
      </div>

      <div className="calculator-container glass-card">
        <div className="calc-inputs-grid">
          <div className="calc-group">
            <label><i className="fa-solid fa-user-doctor"></i> Tipo de Cuidado</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="adulto-mayor">Cuidados de Adulto Mayor / Acompañamiento</option>
              <option value="signos-vitales">Control Estricto de Signos Vitales</option>
              <option value="medicamentos">Administración de Medicamentos / Inyectables</option>
              <option value="curaciones">Curación de Heridas Postoperatorias</option>
              <option value="avd-integral">Cuidado Intensivo y Apoyo Diario (AVD)</option>
            </select>
          </div>

          <div className="calc-group">
            <label><i className="fa-solid fa-clock"></i> Duración de la Guardia</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="8h">Guardia de 8 Horas</option>
              <option value="12h">Guardia de 12 Horas (Día o Noche)</option>
              <option value="24h">Cuidado Continuo 24 Horas</option>
              <option value="puntual">Visita Puntual (1 a 2 horas)</option>
            </select>
          </div>

          <div className="calc-group">
            <label><i className="fa-solid fa-repeat"></i> Frecuencia Semanal</label>
            <select value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="1">1 Día puntual / Eventual</option>
              <option value="3">3 Días por semana (5% Descuento)</option>
              <option value="5">5 Días por semana (10% Descuento)</option>
              <option value="7">7 Días semanales continuos (15% Descuento)</option>
            </select>
          </div>
        </div>

        <div className="calc-result-banner">
          <div className="result-details">
            <span>Inversión Estimada:</span>
            <h3>${finalTotal} <small>USD / turno</small></h3>
            {discount > 0 && (
              <span className="badge-discount">¡{discountPercent}% Descuento Aplicado!</span>
            )}
          </div>

          <button className="btn-calc-book" onClick={handleBookWithQuote}>
            <i className="fa-solid fa-calendar-check"></i> Reservar con esta Cotización
          </button>
        </div>
      </div>
    </section>
  );
}
