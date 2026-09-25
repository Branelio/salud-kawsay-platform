const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

class MockDatabase {
  constructor() {
    this.nurses = [];
    this.patients = [];
    this.bookings = [];
    this.vitalLogs = [];
    this.whatsappLog = [];
    this.reviews = [];
    this.alerts = [];
    this.clinicalRecords = [];
    this.checkins = [];

    this.initStorage();
  }

  initStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.nurses = data.nurses || [];
        this.patients = data.patients || [];
        this.bookings = data.bookings || [];
        this.vitalLogs = data.vitalLogs || [];
        this.whatsappLog = data.whatsappLog || [];
        this.reviews = data.reviews || [];
        this.alerts = data.alerts || [];
        this.clinicalRecords = data.clinicalRecords || [];
        this.checkins = data.checkins || [];
        console.log(`[DATABASE] Base de datos cargada desde archivo persistent: ${DATA_FILE}`);
        
        // Ensure default seed patient has cedula
        if (this.patients.length > 0 && !this.patients[0].cedula) {
          this.seedDefaults();
          this.save();
        }
        return;
      } catch (err) {
        console.error(`[DATABASE] Error leyendo database.json, re-inicializando: ${err.message}`);
      }
    }

    // Default Seed Data
    this.seedDefaults();
    this.save();
  }

  seedDefaults() {
    this.nurses = [
      {
        id: 'nurse-1',
        name: 'Lic. María Elena Ramos',
        photoUrl: 'https://images.unsplash.com/photo-1594824813571-215f7e02e1c9?w=400&q=80',
        specialty: 'Cuidado de Adulto Mayor y Gerontología',
        rating: 4.9,
        phone: '0969532186',
        experienceYears: 8,
        isAvailable: true,
        bio: 'Especialista en geriatría con 8 años en asistencia en el hogar y rehabilitación física suave.'
      },
      {
        id: 'nurse-2',
        name: 'Lic. Andrea Suárez',
        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
        specialty: 'Tratamiento de Heridas Complejas y Postoperatorio',
        rating: 5.0,
        phone: '0983005692',
        experienceYears: 10,
        isAvailable: true,
        bio: 'Certificada en curación avanzada de heridas, manejo de catéteres y recuperación postquirúrgica.'
      },
      {
        id: 'nurse-3',
        name: 'Lic. Carmen Villacís',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
        specialty: 'Control de Constantes y Administración de Medicamentos',
        rating: 4.8,
        phone: '0991234567',
        experienceYears: 6,
        isAvailable: true,
        bio: 'Experta en monitoreo continuo de signos vitales, administración de fármacos por vía endovenosa e intramuscular.'
      }
    ];

    this.patients = [
      {
        id: 'pat-1',
        cedula: '1712345678',
        fullName: 'Sra. Carmen Rosa Delgado',
        age: 82,
        bloodType: 'O+',
        allergies: 'Penicilina, Sulfas',
        condition: 'Hipertensión arterial y asistencia en actividades de vida diaria',
        address: 'Av. Coruña 124, Quito',
        familyContactName: 'Carlos Delgado (Hijo)',
        familyPhone: '0998765432'
      },
      {
        id: 'pat-2',
        cedula: '1798765432',
        fullName: 'Sr. Manuel Fernando Ortiz',
        age: 76,
        bloodType: 'A+',
        allergies: 'Ninguna conocida',
        condition: 'Postoperatorio de cadera y curación de heridas',
        address: 'Calle Los Alisos N34, Quito',
        familyContactName: 'Sofía Ortiz (Hija)',
        familyPhone: '0987654321'
      }
    ];

    this.clinicalRecords = [
      {
        patientId: 'pat-1',
        cedula: '1712345678',
        fullName: 'Sra. Carmen Rosa Delgado',
        age: 82,
        bloodType: 'O+',
        allergies: 'Penicilina, Sulfas',
        primaryDiagnosis: 'Hipertensión Arterial Grado II, Movilidad Reducida',
        prescribedMeds: 'Enalapril 10mg (Cada 12h), Amlodipino 5mg (1 al día en la mañana)',
        attendingDoctor: 'Dr. Fernando Salazar (Cardiólogo M.P 4512)',
        emergencyContact: 'Carlos Delgado (Hijo - Tel: 0998765432)',
        specialCareNotes: 'Monitorear presión arterial 2 veces al día. Dieta hiposódica y caminata asistida de 15 min.',
        lastUpdated: new Date().toISOString()
      },
      {
        patientId: 'pat-2',
        cedula: '1798765432',
        fullName: 'Sr. Manuel Fernando Ortiz',
        age: 76,
        bloodType: 'A+',
        allergies: 'Ninguna conocida',
        primaryDiagnosis: 'Postoperatorio de Artroplastia Total de Cadera Derecha',
        prescribedMeds: 'Rivaroxabán 10mg (Anticoagulante), Paracetamol 1g cada 8h',
        attendingDoctor: 'Dr. Javier Morales (Traumatólogo M.P 8920)',
        emergencyContact: 'Sofía Ortiz (Hija - Tel: 0987654321)',
        specialCareNotes: 'Curación aséptica de herida quirúrgica cada 48h. Evitar flexión de cadera mayor a 90 grados.',
        lastUpdated: new Date().toISOString()
      }
    ];

    this.bookings = [
      {
        id: 'res-101',
        patientId: 'pat-1',
        patientCedula: '1712345678',
        patientName: 'Sra. Carmen Rosa Delgado',
        familyPhone: '0998765432',
        nurseId: 'nurse-1',
        nurseName: 'Lic. María Elena Ramos',
        serviceType: 'adulto-mayor',
        date: new Date().toISOString().split('T')[0],
        shiftHours: '12h',
        status: 'en-proceso',
        totalPriceUSD: 65,
        createdAt: new Date().toISOString()
      }
    ];

    this.vitalLogs = [
      {
        id: 'vital-1',
        patientId: 'pat-1',
        nurseId: 'nurse-1',
        nurseName: 'Lic. María Elena Ramos',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 82,
        bloodGlucoseMgDl: 110,
        oxygenSaturation: 97,
        heartRateBpm: 72,
        temperatureCelsius: 36.6,
        medicationAdministered: 'Enalapril 10mg - 08:00 AM',
        nurseNotes: 'Paciente tranquila, desayunó adecuadamente. Realizamos caminata asistida de 15 min.',
        statusFlag: 'normal'
      }
    ];

    this.whatsappLog = [];
    this.reviews = [
      {
        id: 'rev-1',
        clientName: 'Ing. Roberto Mendoza',
        relation: 'Hijo de paciente (84 años)',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        rating: 5,
        comment: 'Contratar el servicio para mi papá fue la mejor decisión. La Lic. Andrea Suárez es sumamente profesional y cariñosa. La bitácora en vivo me da paz mental.',
        date: '2026-08-20',
        isVerified: true
      }
    ];
    this.alerts = [];
  }

  save() {
    try {
      const data = {
        nurses: this.nurses,
        patients: this.patients,
        bookings: this.bookings,
        vitalLogs: this.vitalLogs,
        whatsappLog: this.whatsappLog,
        reviews: this.reviews,
        alerts: this.alerts,
        clinicalRecords: this.clinicalRecords,
        checkins: this.checkins
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`[DATABASE] Error guardando archivo JSON: ${err.message}`);
    }
  }

  verifyAdminLogin(username, password) {
    if ((username === 'admin' || username === 'admin@saludkawsay.ec') && password === 'admin123') {
      return {
        success: true,
        token: `token-admin-${Date.now()}`,
        user: { name: 'Administrador General', role: 'admin', email: 'admin@saludkawsay.ec' }
      };
    }
    return { success: false, error: 'Credenciales inválidas. Usar admin / admin123' };
  }

  findPatientByCedula(cedula) {
    const patient = this.patients.find(p => p.cedula === cedula);
    if (!patient) return null;
    const record = this.clinicalRecords.find(r => r.patientId === patient.id || r.cedula === cedula);
    return { ...patient, clinicalRecord: record || null };
  }

  saveClinicalRecord(recordData) {
    let patient = this.patients.find(p => p.cedula === recordData.cedula || p.id === recordData.patientId);
    
    if (!patient) {
      patient = {
        id: `pat-${Math.floor(1000 + Math.random() * 9000)}`,
        cedula: recordData.cedula,
        fullName: recordData.fullName,
        age: parseInt(recordData.age) || 70,
        bloodType: recordData.bloodType || 'O+',
        allergies: recordData.allergies || 'Ninguna',
        condition: recordData.primaryDiagnosis || 'En atención domiciliaria',
        address: recordData.address || 'Quito, Ecuador',
        familyContactName: recordData.emergencyContact || 'Familiar',
        familyPhone: recordData.familyPhone || '0998765432'
      };
      this.patients.push(patient);
    } else {
      patient.fullName = recordData.fullName || patient.fullName;
      patient.age = parseInt(recordData.age) || patient.age;
      patient.bloodType = recordData.bloodType || patient.bloodType;
      patient.allergies = recordData.allergies || patient.allergies;
      patient.condition = recordData.primaryDiagnosis || patient.condition;
    }

    const existingRecordIdx = this.clinicalRecords.findIndex(r => r.cedula === recordData.cedula || r.patientId === patient.id);
    const newRecord = {
      patientId: patient.id,
      cedula: recordData.cedula,
      fullName: patient.fullName,
      age: patient.age,
      bloodType: recordData.bloodType || 'O+',
      allergies: recordData.allergies || 'Ninguna',
      primaryDiagnosis: recordData.primaryDiagnosis || 'En monitoreo regular',
      prescribedMeds: recordData.prescribedMeds || 'Según indicación médica',
      attendingDoctor: recordData.attendingDoctor || 'Médico Tratante',
      emergencyContact: recordData.emergencyContact || patient.familyPhone,
      specialCareNotes: recordData.specialCareNotes || 'Sin observaciones adicionales',
      lastUpdated: new Date().toISOString()
    };

    if (existingRecordIdx >= 0) {
      this.clinicalRecords[existingRecordIdx] = newRecord;
    } else {
      this.clinicalRecords.push(newRecord);
    }

    this.save();
    return { patient, clinicalRecord: newRecord };
  }

  addBooking(bookingData) {
    let patient = this.patients.find(p => p.cedula === bookingData.patientCedula);
    if (!patient) {
      patient = {
        id: `pat-${Math.floor(1000 + Math.random() * 9000)}`,
        cedula: bookingData.patientCedula || '1700000000',
        fullName: bookingData.patientName,
        age: 75,
        bloodType: 'O+',
        allergies: 'En revisión',
        condition: bookingData.serviceType,
        address: 'Quito, Ecuador',
        familyContactName: 'Familiar Responsable',
        familyPhone: bookingData.familyPhone
      };
      this.patients.push(patient);
    }

    const newBooking = {
      ...bookingData,
      id: `res-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      patientCedula: patient.cedula,
      createdAt: new Date().toISOString()
    };
    this.bookings.unshift(newBooking);

    this.sendWhatsApp({
      toPhone: newBooking.familyPhone,
      messageText: `¡Hola! Tu reserva (#${newBooking.id}) para ${newBooking.patientName} (Cédula: ${newBooking.patientCedula}) fue confirmada exitosamente.`,
      type: 'reserva_confirmada'
    });

    this.save();
    return newBooking;
  }

  updateBookingStatus(id, status) {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      this.save();
    }
    return booking;
  }

  addVitalLog(logData) {
    let flag = 'normal';
    if (logData.bloodPressureSystolic > 140 || logData.bloodGlucoseMgDl > 180 || logData.oxygenSaturation < 92) {
      flag = 'advertencia';
    }
    if (logData.bloodPressureSystolic > 170 || logData.bloodGlucoseMgDl > 250 || logData.oxygenSaturation < 88) {
      flag = 'critico';
    }

    const newLog = {
      ...logData,
      id: `vital-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      statusFlag: flag
    };
    this.vitalLogs.unshift(newLog);

    if (flag !== 'normal') {
      const alertItem = {
        id: `alert-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: logData.patientId,
        patientName: logData.patientName || 'Paciente Domiciliario',
        vitalId: newLog.id,
        severity: flag,
        message: flag === 'critico' ? `ALERTA CRÍTICA: P.A ${logData.bloodPressureSystolic}/${logData.bloodPressureDiastolic} mmHg, SatO2 ${logData.oxygenSaturation}%` : `Aviso: P.A ${logData.bloodPressureSystolic}/${logData.bloodPressureDiastolic} mmHg`,
        timestamp: newLog.timestamp,
        resolved: false
      };
      this.alerts.unshift(alertItem);
    }

    const patient = this.patients.find(p => p.id === logData.patientId);
    const phone = patient ? patient.familyPhone : '0998765432';

    let alertPrefix = flag === 'critico' ? '⚠️ ALERTA MÉDICA: ' : flag === 'advertencia' ? 'ℹ️ Aviso de Signos Vitales: ' : '📋 Reporte de Guardia: ';

    this.sendWhatsApp({
      toPhone: phone,
      messageText: `${alertPrefix}Nuevos signos vitales registrados por ${logData.nurseName}: P.A: ${logData.bloodPressureSystolic}/${logData.bloodPressureDiastolic} mmHg, Glucosa: ${logData.bloodGlucoseMgDl} mg/dL, SatO2: ${logData.oxygenSaturation}%. Notas: ${logData.nurseNotes}`,
      type: flag !== 'normal' ? 'alerta_signos' : 'reporte_diario'
    });

    this.save();
    return newLog;
  }

  addNurseCheckin(checkinData) {
    const newCheckin = {
      id: `chk-${Math.floor(1000 + Math.random() * 9000)}`,
      nurseId: checkinData.nurseId || 'nurse-1',
      nurseName: checkinData.nurseName || 'Lic. María Elena Ramos',
      patientId: checkinData.patientId || 'pat-1',
      patientName: checkinData.patientName || 'Sra. Carmen Rosa Delgado',
      latitude: checkinData.latitude || -0.180653,
      longitude: checkinData.longitude || -78.467838,
      address: checkinData.address || 'Av. Coruña 124, Quito',
      timestamp: new Date().toISOString(),
      status: 'ingreso_confirmado'
    };

    this.checkins.unshift(newCheckin);

    const patient = this.patients.find(p => p.id === newCheckin.patientId);
    const phone = patient ? patient.familyPhone : '0998765432';

    this.sendWhatsApp({
      toPhone: phone,
      messageText: `📍 Fichaje GPS Confirmado: ${newCheckin.nurseName} ha ingresado al domicilio para la guardia de ${newCheckin.patientName}. Ubicación verificada (${newCheckin.latitude.toFixed(4)}, ${newCheckin.longitude.toFixed(4)}).`,
      type: 'fichaje_ingreso'
    });

    this.save();
    return newCheckin;
  }

  resolveAlert(alertId, notes) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = 'Administración Médica';
      alert.resolvedNotes = notes || 'Atendido y verificado telefónicamente.';
      this.save();
    }
    return alert;
  }

  addReview(reviewData) {
    const newReview = {
      id: `rev-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: reviewData.clientName || 'Cliente Satisfecho',
      relation: reviewData.relation || 'Familiar de Paciente',
      photoUrl: reviewData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment || 'Excelente atención y gran profesionalismo de la enfermera.',
      date: new Date().toISOString().split('T')[0],
      isVerified: true
    };
    this.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  sendWhatsApp(data) {
    const msg = {
      id: `wa-${Math.floor(1000 + Math.random() * 9000)}`,
      toPhone: data.toPhone,
      messageText: data.messageText,
      type: data.type,
      timestamp: new Date().toISOString(),
      status: 'entregado'
    };
    this.whatsappLog.unshift(msg);
    this.save();
    return msg;
  }

  getStats() {
    const totalBookings = this.bookings.length;
    const activePatients = this.patients.length;
    const totalNurses = this.nurses.length;
    const activeAlerts = this.alerts.filter(a => !a.resolved).length;
    const avgRating = (this.reviews.reduce((acc, r) => acc + r.rating, 0) / (this.reviews.length || 1)).toFixed(1);

    return {
      totalBookings,
      activePatients,
      totalNurses,
      activeAlerts,
      avgRating,
      totalReviews: this.reviews.length
    };
  }
}

const db = new MockDatabase();
module.exports = { db };
