import { Nurse, Patient, ServiceBooking, VitalSignEntry, WhatsAppMessage } from './types';

class MockDatabase {
  public nurses: Nurse[] = [
    {
      id: 'nurse-1',
      name: 'Lic. María Elena Ramos',
      photoUrl: 'https://images.unsplash.com/photo-1594824813571-215f7e02e1c9?w=400&q=80',
      specialty: 'Cuidado de Adulto Mayor y Gerontología',
      rating: 4.9,
      phone: '0969532186',
      experienceYears: 8,
      isAvailable: true
    },
    {
      id: 'nurse-2',
      name: 'Lic. Andrea Suárez',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      specialty: 'Tratamiento de Heridas Complejas y Postoperatorio',
      rating: 5.0,
      phone: '0983005692',
      experienceYears: 10,
      isAvailable: true
    },
    {
      id: 'nurse-3',
      name: 'Lic. Carmen Villacís',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
      specialty: 'Control de Constantes y Administración de Medicamentos',
      rating: 4.8,
      phone: '0991234567',
      experienceYears: 6,
      isAvailable: true
    }
  ];

  public patients: Patient[] = [
    {
      id: 'pat-1',
      fullName: 'Sra. Carmen Rosa Delgado (82 años)',
      age: 82,
      condition: 'Hipertensión arterial y asistencia en actividades de vida diaria',
      address: 'Av. Coruña 124, Quito',
      familyContactName: 'Carlos Delgado (Hijo)',
      familyPhone: '0998765432'
    },
    {
      id: 'pat-2',
      fullName: 'Sr. Manuel Fernando Ortiz (76 años)',
      age: 76,
      condition: 'Postoperatorio de cadera y curación de heridas',
      address: 'Calle Los Alisos N34, Quito',
      familyContactName: 'Sofía Ortiz (Hija)',
      familyPhone: '0987654321'
    }
  ];

  public bookings: ServiceBooking[] = [
    {
      id: 'res-101',
      patientId: 'pat-1',
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

  public vitalLogs: VitalSignEntry[] = [
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

  public whatsappLog: WhatsAppMessage[] = [
    {
      id: 'wa-1',
      toPhone: '0998765432',
      messageText: 'Hola Carlos! Te notificamos que la Lic. María Elena Ramos ha ingresado al domicilio para la guardia de 12h.',
      type: 'checkin_enfermera',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'entregado'
    }
  ];

  addBooking(bookingData: Omit<ServiceBooking, 'id' | 'createdAt'>): ServiceBooking {
    const newBooking: ServiceBooking = {
      ...bookingData,
      id: `res-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    this.bookings.unshift(newBooking);

    // Auto-trigger WhatsApp notification to family
    this.sendWhatsApp({
      toPhone: newBooking.familyPhone,
      messageText: `¡Hola! Tu reserva (#${newBooking.id}) para ${newBooking.patientName} de ${newBooking.shiftHours} fue confirmada exitosamente con ${newBooking.nurseName || 'nuestras enfermeras de turno'}.`,
      type: 'reserva_confirmada'
    });

    return newBooking;
  }

  addVitalLog(logData: Omit<VitalSignEntry, 'id' | 'timestamp' | 'statusFlag'>): VitalSignEntry {
    // Detect status flag automatically
    let flag: 'normal' | 'advertencia' | 'critico' = 'normal';
    if (logData.bloodPressureSystolic > 140 || logData.bloodGlucoseMgDl > 180 || logData.oxygenSaturation < 92) {
      flag = 'advertencia';
    }
    if (logData.bloodPressureSystolic > 170 || logData.bloodGlucoseMgDl > 250 || logData.oxygenSaturation < 88) {
      flag = 'critico';
    }

    const newLog: VitalSignEntry = {
      ...logData,
      id: `vital-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      statusFlag: flag
    };
    this.vitalLogs.unshift(newLog);

    // Notify family via WhatsApp
    const patient = this.patients.find(p => p.id === logData.patientId);
    const phone = patient ? patient.familyPhone : '0998765432';

    let alertPrefix = flag === 'critico' ? '⚠️ ALERTA MÉDICA: ' : flag === 'advertencia' ? 'ℹ️ Aviso de Signos Vitales: ' : '📋 Reporte de Guardia: ';

    this.sendWhatsApp({
      toPhone: phone,
      messageText: `${alertPrefix}Nuevos signos vitales registrados por ${logData.nurseName}: P.A: ${logData.bloodPressureSystolic}/${logData.bloodPressureDiastolic} mmHg, Glucosa: ${logData.bloodGlucoseMgDl} mg/dL, SatO2: ${logData.oxygenSaturation}%. Notas: ${logData.nurseNotes}`,
      type: flag !== 'normal' ? 'alerta_signos' : 'reporte_diario'
    });

    return newLog;
  }

  sendWhatsApp(data: { toPhone: string; messageText: string; type: WhatsAppMessage['type'] }): WhatsAppMessage {
    const msg: WhatsAppMessage = {
      id: `wa-${Math.floor(1000 + Math.random() * 9000)}`,
      toPhone: data.toPhone,
      messageText: data.messageText,
      type: data.type,
      timestamp: new Date().toISOString(),
      status: 'entregado'
    };
    this.whatsappLog.unshift(msg);
    return msg;
  }
}

export const db = new MockDatabase();
