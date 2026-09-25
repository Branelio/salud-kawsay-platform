const express = require('express');
const cors = require('cors');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Salud Kawsay API Central', time: new Date().toISOString() });
});

// Admin Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const result = db.verifyAdminLogin(username, password);
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

// Global Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({ success: true, data: db.getStats() });
});

// Nurses endpoints
app.get('/api/nurses', (req, res) => {
  res.json({ success: true, data: db.nurses });
});

app.post('/api/nurses', (req, res) => {
  try {
    const nurse = {
      id: `nurse-${Math.floor(1000 + Math.random() * 9000)}`,
      ...req.body,
      rating: 5.0,
      isAvailable: true
    };
    db.nurses.push(nurse);
    db.save();
    res.status(201).json({ success: true, message: 'Enfermera registrada exitosamente', data: nurse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/nurses/checkin', (req, res) => {
  try {
    const checkin = db.addNurseCheckin(req.body);
    res.status(201).json({ success: true, message: 'Fichaje GPS registrado exitosamente', data: checkin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/nurses/checkins', (req, res) => {
  res.json({ success: true, data: db.checkins });
});

// Patients & Cédula Verification endpoints
app.get('/api/patients', (req, res) => {
  res.json({ success: true, data: db.patients });
});

app.get('/api/patients/cedula/:cedula', (req, res) => {
  const { cedula } = req.params;
  const result = db.findPatientByCedula(cedula);
  if (result) {
    res.json({ success: true, found: true, data: result });
  } else {
    res.json({ success: true, found: false, message: 'No existe registro con esa Cédula' });
  }
});

// Clinical Records endpoints (Ficha Clínica)
app.get('/api/clinical-records', (req, res) => {
  res.json({ success: true, data: db.clinicalRecords });
});

app.get('/api/clinical-records/:patientId', (req, res) => {
  const { patientId } = req.params;
  const record = db.clinicalRecords.find(r => r.patientId === patientId || r.cedula === patientId);
  if (record) {
    res.json({ success: true, data: record });
  } else {
    res.status(404).json({ success: false, error: 'Ficha clínica no encontrada' });
  }
});

app.post('/api/clinical-records', (req, res) => {
  try {
    const result = db.saveClinicalRecord(req.body);
    res.status(201).json({ success: true, message: 'Ficha Clínica guardada exitosamente', data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Bookings endpoints
app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: db.bookings });
});

app.post('/api/bookings', (req, res) => {
  try {
    const booking = db.addBooking(req.body);
    res.status(201).json({ success: true, message: 'Reserva creada y notificada por WhatsApp', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.updateBookingStatus(id, status);
  if (updated) {
    res.json({ success: true, message: `Estado de reserva actualizado a ${status}`, data: updated });
  } else {
    res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }
});

// Vital Signs / Bitácora endpoints
app.get('/api/vitals/:patientId', (req, res) => {
  const { patientId } = req.params;
  const logs = db.vitalLogs.filter(log => log.patientId === patientId);
  res.json({ success: true, data: logs });
});

app.get('/api/vitals', (req, res) => {
  res.json({ success: true, data: db.vitalLogs });
});

app.post('/api/vitals', (req, res) => {
  try {
    const log = db.addVitalLog(req.body);
    res.status(201).json({ success: true, message: 'Signos vitales registrados y alerta/notificación enviada por WhatsApp', data: log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Alerts endpoints
app.get('/api/alerts', (req, res) => {
  res.json({ success: true, data: db.alerts });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const resolved = db.resolveAlert(id, notes);
  if (resolved) {
    res.json({ success: true, message: 'Alerta resuelta correctamente', data: resolved });
  } else {
    res.status(404).json({ success: false, error: 'Alerta no encontrada' });
  }
});

// Testimonials & Reviews endpoints
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: db.reviews });
});

app.post('/api/reviews', (req, res) => {
  try {
    const review = db.addReview(req.body);
    res.status(201).json({ success: true, message: '¡Muchas gracias por tu recomendación!', data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// WhatsApp Bot Simulator & Log endpoints
app.get('/api/whatsapp/logs', (req, res) => {
  res.json({ success: true, data: db.whatsappLog });
});

app.post('/api/whatsapp/webhook', (req, res) => {
  const { from, message } = req.body;
  console.log(`[WHATSAPP BOT WEBHOOK] Mensaje recibido de ${from}: "${message}"`);
  
  let botReply = 'Gracias por escribir a Salud Kawsay. ¿En qué podemos acompañarte hoy?';
  const cleanMsg = (message || '').toLowerCase();
  
  if (cleanMsg.includes('reserva') || cleanMsg.includes('turno') || cleanMsg.includes('precio') || cleanMsg.includes('costo')) {
    botReply = 'Ofrecemos cuidado de adulto mayor, signos vitales, medicamentos y curaciones. Podés cotizar en tiempo real y agendar en nuestra web con la Cédula del paciente.';
  } else if (cleanMsg.includes('signos') || cleanMsg.includes('estado') || cleanMsg.includes('bitacora')) {
    botReply = 'Para consultar la bitácora médica en vivo de tu familiar o verificar su Cédula, ingresá a la sección "Bitácora Médica" en nuestra web.';
  } else if (cleanMsg.includes('recomendaciones') || cleanMsg.includes('testimonios') || cleanMsg.includes('clientes')) {
    botReply = '¡Nuestros clientes nos recomiendan con 4.9/5 estrellas! Podés ver fotos reales y opiniones de otras familias en la sección de Testimonios de la web.';
  }

  const sentMsg = db.sendWhatsApp({
    toPhone: from,
    messageText: botReply,
    type: 'reporte_diario'
  });

  res.json({ success: true, botReply, messageSent: sentMsg });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 Salud Kawsay API running on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
