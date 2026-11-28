import React, { useState } from 'react';

export function BillingSriPanel({ invoices, patients, onCreateInvoice }) {
  const [clientDocument, setClientDocument] = useState('1712345678');
  const [clientName, setClientName] = useState('Sra. Carmen Rosa Delgado');
  const [clientEmail, setClientEmail] = useState('familia.delgado@correo.ec');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [description, setDescription] = useState('Consulta Médica / Atención Especializada');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('35');
  const [ivaRate, setIvaRate] = useState('0');

  const handlePatientPick = (e) => {
    const p = (patients || []).find(pat => pat.id === e.target.value);
    if (p) {
      setClientDocument(p.cedula);
      setClientName(p.fullName);
    }
  };

  const qtyNum = Number(quantity) || 1;
  const priceNum = Number(unitPrice) || 0;
  const rateNum = Number(ivaRate) === 15 ? 15 : 0;
  const subtotal = qtyNum * priceNum;
  const ivaCalc = rateNum === 15 ? subtotal * 0.15 : 0;
  const totalCalc = subtotal + ivaCalc;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientDocument || !clientName || !description || !onCreateInvoice) return;
    onCreateInvoice({
      clientDocument,
      clientName,
      clientEmail,
      paymentMethod,
      items: [{ description, quantity: qtyNum, unitPriceUSD: priceNum, ivaRate: rateNum }]
    });
  };

  const printRide = (inv) => {
    const win = window.open('', '_blank', 'width=820,height=680');
    if (!win) return;
    const rows = (inv.items || []).map(it => `
      <tr>
        <td>${it.quantity}</td>
        <td>${it.description}</td>
        <td>$${Number(it.unitPriceUSD).toFixed(2)}</td>
        <td>${it.ivaRate}%</td>
        <td>$${(Number(it.quantity) * Number(it.unitPriceUSD)).toFixed(2)}</td>
      </tr>
    `).join('');
    win.document.write(`
      <html>
        <head>
          <title>RIDE Factura ${inv.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; font-size: 13px; }
            .box { border: 1.5px solid #334155; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
            .totals { width: 260px; margin-left: auto; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="grid">
            <div class="box">
              <h2 style="margin:0 0 6px;color:#064e3b;">SALUD KAWSAY ECUADOR</h2>
              <div>RUC: 1790012345001 · Obligado a llevar contabilidad: SÍ</div>
              <div>Dirección: Av. Coruña 124, Quito - Ecuador</div>
            </div>
            <div class="box">
              <div><strong>FACTURA ELECTRÓNICA No.:</strong> ${inv.invoiceNumber}</div>
              <div><strong>ESTADO SRI:</strong> ${inv.status.toUpperCase()}</div>
              <div><strong>FECHA EMISIÓN:</strong> ${new Date(inv.issuedAt).toLocaleString('es-EC')}</div>
              <div style="font-size:10px;word-break:break-all;margin-top:4px;"><strong>CLAVE DE ACCESO:</strong><br/>${inv.sriAccessKey}</div>
            </div>
          </div>
          <div class="box">
            <strong>Razón Social / Paciente:</strong> ${inv.clientName} &nbsp;|&nbsp; <strong>RUC / Cédula:</strong> ${inv.clientDocument}<br/>
            <strong>Forma de Pago:</strong> ${inv.paymentMethod.toUpperCase()} &nbsp;|&nbsp; <strong>Email:</strong> ${inv.clientEmail}
          </div>
          <table>
            <thead><tr><th>Cant.</th><th>Descripción</th><th>P. Unitario</th><th>Tarifa IVA</th><th>Subtotal</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <table class="totals">
            <tr><td>Subtotal 0% (Salud)</td><td>$${Number(inv.subtotal0USD).toFixed(2)}</td></tr>
            <tr><td>Subtotal 15%</td><td>$${Number(inv.subtotal15USD).toFixed(2)}</td></tr>
            <tr><td>IVA 15%</td><td>$${Number(inv.ivaUSD).toFixed(2)}</td></tr>
            <tr><th>TOTAL USD</th><th>$${Number(inv.totalUSD).toFixed(2)}</th></tr>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Daily Cash Summary
  const cashTotal = (invoices || []).filter(i => i.paymentMethod === 'efectivo').reduce((s, i) => s + i.totalUSD, 0);
  const transferTotal = (invoices || []).filter(i => i.paymentMethod === 'transferencia').reduce((s, i) => s + i.totalUSD, 0);
  const cardTotal = (invoices || []).filter(i => i.paymentMethod === 'tarjeta').reduce((s, i) => s + i.totalUSD, 0);

  return (
    <div className="admin-table-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
            <span><i className="fa-solid fa-file-invoice-dollar"></i> Caja, Corte Diario & Pre-Facturación SRI (Ecuador)</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Emisión de comprobantes con diferenciación fiscal: Servicios de Salud (IVA 0%) vs Insumos Médicos (IVA 15%).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
          <span className="badge-discount" style={{ background: '#059669' }}>Efectivo: ${cashTotal.toFixed(2)}</span>
          <span className="badge-discount" style={{ background: '#0284c7' }}>Transferencia: ${transferTotal.toFixed(2)}</span>
          <span className="badge-discount" style={{ background: '#6366f1' }}>Tarjeta: ${cardTotal.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rx-form-box" style={{ marginBottom: '20px' }}>
        <div className="rx-form-grid">
          <div>
            <label>Cargar Paciente (Opcional)</label>
            <select onChange={handlePatientPick} defaultValue="">
              <option value="">-- Seleccionar paciente --</option>
              {(patients || []).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label>Cédula o RUC *</label>
            <input type="text" value={clientDocument} onChange={(e) => setClientDocument(e.target.value)} required />
          </div>
          <div>
            <label>Razón Social / Cliente *</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <label>Forma de Pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="efectivo">Efectivo en Caja</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="tarjeta">Tarjeta / DeUna</option>
            </select>
          </div>
          <div>
            <label>Detalle del Servicio / Insumo *</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label>Cantidad</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div>
            <label>Precio Unitario (USD) *</label>
            <input type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
          </div>
          <div>
            <label>Tarifa IVA (Normativa SRI)</label>
            <select value={ivaRate} onChange={(e) => setIvaRate(e.target.value)}>
              <option value="0">0% — Servicio Médico / Salud</option>
              <option value="15">15% — Insumo / Material Médico</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13.5px', color: '#0f172a' }}>
            Subtotal: <strong>${subtotal.toFixed(2)}</strong> · IVA: <strong>${ivaCalc.toFixed(2)}</strong> · Total Factura: <strong style={{ color: '#059669', fontSize: '16px' }}>${totalCalc.toFixed(2)} USD</strong>
          </div>
          <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff', cursor: 'pointer' }}>
            <i className="fa-solid fa-receipt"></i> Emitir Comprobante SRI
          </button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>N° Comprobante</th>
              <th>Cliente / RUC-CI</th>
              <th>Detalle</th>
              <th>Forma Pago</th>
              <th>Desglose Fiscal</th>
              <th>Total</th>
              <th>RIDE / PDF</th>
            </tr>
          </thead>
          <tbody>
            {(invoices || []).length > 0 ? (
              invoices.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <strong style={{ fontFamily: 'monospace' }}>{inv.invoiceNumber}</strong>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>✓ SRI {inv.status.toUpperCase()}</div>
                  </td>
                  <td><strong>{inv.clientName}</strong><br /><small>{inv.clientDocument}</small></td>
                  <td style={{ fontSize: '12px' }}>{(inv.items || []).map(i => `${i.quantity}x ${i.description}`).join(', ')}</td>
                  <td><span className="badge-discount" style={{ background: '#0284c7', fontSize: '11px' }}>{inv.paymentMethod.toUpperCase()}</span></td>
                  <td style={{ fontSize: '12px' }}>
                    Sub 0%: ${Number(inv.subtotal0USD).toFixed(2)}<br />
                    Sub 15%: ${Number(inv.subtotal15USD).toFixed(2)} · IVA: ${Number(inv.ivaUSD).toFixed(2)}
                  </td>
                  <td><strong style={{ color: '#064e3b', fontSize: '15px' }}>${Number(inv.totalUSD).toFixed(2)}</strong></td>
                  <td>
                    <button type="button" className="btn-action-sm" style={{ background: '#0369a1', cursor: 'pointer' }} onClick={() => printRide(inv)}>
                      <i className="fa-solid fa-print"></i> Ver RIDE
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No hay comprobantes emitidos aún. Generá la primera factura arriba para ver el RIDE.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
