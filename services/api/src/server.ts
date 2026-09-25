import express from 'express';
import cors from 'cors';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HomeCare Central API', time: new Date().toISOString() });
});

// Nurses endpoints
app.get('/api/nurses', (req, res) => {
  res.json({ success: true, data: db.nurses });
});

// Patients endpoints
app.get('/api/patients', (req, res) => {
  res.json({ success: true, data: db.patients });
});

// Bookings endpoints
app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: db.bookings });
});

app.post('/api/bookings', (req, res) => {
  try {
    const booking = db.addBooking(req.body);
    res.status(201).json({ success: true, message: 'Reserva creada y notificada por WhatsApp', data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// WhatsApp Bot Simulator & Log endpoints
app.get('/api/whatsapp/logs', (req, res) => {
  res.json({ success: true, data: db.whatsappLog });
});

// WhatsApp Webhook Receiver Simulator
app.post('/api/whatsapp/webhook', (req, res) => {
  const { from, message } = req.body;
  console.log(`[WHATSAPP BOT WEBHOOK] Mensaje recibido de ${from}: "${message}"`);
  
  let botReply = 'Gracias por escribir a Enfermeras Profesionales. ¿En qué podemos acompañarte hoy?';
  const cleanMsg = (message || '').toLowerCase();
  
  if (cleanMsg.includes('reserva') || cleanMsg.includes('turno') || cleanMsg.includes('precio')) {
    botReply = 'Ofrecemos cuidado integral de adulto mayor, signos vitales, medicamentos y curaciones. Podés ver nuestras enfermeras disponibles y reservar directamente en nuestra web.';
  } else if (cleanMsg.includes('signos') || cleanMsg.includes('estado')) {
    botReply = 'Para consultar la bitácora médica en vivo de tu familiar, ingresá a tu panel con el número de teléfono registrado.';
  }

  const sentMsg = db.sendWhatsApp({
    toPhone: from,
    messageText: botReply,
    type: 'reporte_diario'
  });

  res.json({ success: true, botReply, messageSent: sentMsg });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 HomeCare Central API running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
