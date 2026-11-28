import React, { useState } from 'react';

export function InventoryPanel({ inventory, onCreateItem, onAdjustStock }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Enfermería');
  const [sku, setSku] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('2027-06-30');
  const [stock, setStock] = useState('20');
  const [minStock, setMinStock] = useState('10');
  const [unitCostUSD, setUnitCostUSD] = useState('5.00');
  const [unit, setUnit] = useState('unidad');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !lotNumber || !onCreateItem) return;
    onCreateItem({
      name,
      category,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      lotNumber,
      expirationDate,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 10,
      unitCostUSD: Number(unitCostUSD) || 0,
      unit
    });
    setName('');
    setSku('');
    setLotNumber('');
    setShowAdd(false);
  };

  const lowStockCount = (inventory || []).filter(i => i.stock <= i.minStock).length;

  return (
    <div className="admin-table-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>
            <span><i className="fa-solid fa-boxes-stacked"></i> Inventario de Insumos, Lotes y Caducidad (ARCSA)</span>
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Trazabilidad FIFO por número de lote y alertas tempranas de stock mínimo para clínica, odontología y enfermería.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {lowStockCount > 0 && (
            <span className="badge-discount" style={{ background: '#ef4444' }}>⚠️ {lowStockCount} en stock crítico</span>
          )}
          <button type="button" className="btn-secondary-sm" onClick={() => setShowAdd(!showAdd)}>
            <i className="fa-solid fa-plus"></i> Nuevo Insumo / Lote
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="rx-form-box" style={{ marginBottom: '18px', borderColor: '#059669' }}>
          <div className="rx-form-grid">
            <div><label>Insumo / Material *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Lidocaína 2% Carpule" required /></div>
            <div>
              <label>Área / Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Enfermería">Enfermería</option>
                <option value="Odontología">Odontología</option>
                <option value="Pediatría">Pediatría</option>
                <option value="General">General</option>
              </select>
            </div>
            <div><label>N° Lote (ARCSA) *</label><input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="Ej: LOT-2026-X4" required /></div>
            <div><label>Fecha Caducidad *</label><input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required /></div>
            <div><label>Stock Inicial</label><input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
            <div><label>Stock Mínimo Alerta</label><input type="number" min="1" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></div>
            <div><label>Costo Unitario (USD)</label><input type="number" step="0.01" min="0" value={unitCostUSD} onChange={(e) => setUnitCostUSD(e.target.value)} /></div>
            <div><label>Presentación</label><input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="caja / frasco / unidad" /></div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-secondary-sm" style={{ background: '#059669', color: '#fff' }}>Guardar Insumo</button>
            <button type="button" className="btn-secondary-sm" style={{ background: '#94a3b8', color: '#fff' }} onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Insumo / SKU</th>
              <th>Área</th>
              <th>Lote / Caducidad</th>
              <th>Costo Unit.</th>
              <th>Stock Actual</th>
              <th>Movimientos</th>
            </tr>
          </thead>
          <tbody>
            {(inventory || []).map(item => {
              const isLow = item.stock <= item.minStock;
              return (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><br /><small style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.sku}</small></td>
                  <td><span className="badge-discount" style={{ background: '#0284c7', fontSize: '11px' }}>{item.category}</span></td>
                  <td style={{ fontSize: '12px' }}>
                    Lote: <strong>{item.lotNumber}</strong><br />
                    Vence: <span style={{ color: '#475569' }}>{item.expirationDate}</span>
                  </td>
                  <td>${Number(item.unitCostUSD).toFixed(2)}</td>
                  <td>
                    <span className="badge-discount" style={{ background: isLow ? '#ef4444' : '#10b981' }}>
                      {item.stock} {item.unit}s {isLow ? '(BAJO)' : ''}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" className="btn-action-sm" style={{ background: '#059669' }} onClick={() => onAdjustStock && onAdjustStock(item.id, 1)}>+1</button>
                      <button type="button" className="btn-action-sm" style={{ background: '#d97706' }} onClick={() => onAdjustStock && onAdjustStock(item.id, -1)}>-1 Uso</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
