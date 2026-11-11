import React, { useState, useEffect } from 'react';
import { ApiClientAdapter } from './infrastructure/api/ApiClient';
import { useToast } from './presentation/components/Toast';
import { Navbar } from './presentation/components/Navbar';
import { Hero } from './presentation/components/Hero';
import { Calculator } from './presentation/components/Calculator';
import { Testimonials } from './presentation/components/Testimonials';
import { Services, Nurses } from './presentation/components/Nurses';
import { Bitacora } from './presentation/components/Bitacora';
import { AdminDashboardModal } from './presentation/components/AdminDashboardModal';
import { AdminLoginModal } from './presentation/modals/AdminLoginModal';
import { BookingModal } from './presentation/modals/BookingModal';
import { ClinicalRecordModal } from './presentation/modals/ClinicalRecordModal';
import { ReviewModal } from './presentation/modals/ReviewModal';

export function App() {
  const { showToast } = useToast();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('pat-1');
  const [patientData, setPatientData] = useState(null);
  const [vitalLogs, setVitalLogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waLogs, setWaLogs] = useState([]);

  // Modals state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState('');
  const [bookingShift, setBookingShift] = useState('');
  const [bookingNurseId, setBookingNurseId] = useState('');
  const [isClinicalRecordOpen, setIsClinicalRecordOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('homecare_admin_token');
    if (savedToken) setIsAdminLoggedIn(true);

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const nursesRes = await ApiClientAdapter.getNurses();
      if (nursesRes.success) setNurses(nursesRes.data);

      const reviewsRes = await ApiClientAdapter.getReviews();
      if (reviewsRes.success) setReviews(reviewsRes.data);

      const patientsRes = await ApiClientAdapter.getPatients();
      if (patientsRes.success && patientsRes.data.length > 0) {
        setPatients(patientsRes.data);
        const p1 = patientsRes.data.find(p => p.id === selectedPatientId) || patientsRes.data[0];
        setPatientData(p1);
      }

      await loadVitals(selectedPatientId);
      await loadAdminStats();
      await loadWaLogs();
    } catch (err) {
      console.warn('Cargando datos iniciales...');
    }
  };

  const loadVitals = async (patientId) => {
    try {
      const res = await ApiClientAdapter.getVitals(patientId);
      if (res.success) setVitalLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminStats = async () => {
    try {
      const statsRes = await ApiClientAdapter.getStats();
      if (statsRes.success) setStats(statsRes.data);

      const alertsRes = await ApiClientAdapter.getAlerts();
      if (alertsRes.success) setAlerts(alertsRes.data);

      const bookingsRes = await ApiClientAdapter.getBookings();
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWaLogs = async () => {
    try {
      const res = await ApiClientAdapter.getWaLogs();
      if (res.success) setWaLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminHeaderClick = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogin = async (username, password) => {
    try {
      const res = await ApiClientAdapter.loginAdmin(username, password);
      if (res.success) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('homecare_admin_token', res.token);
        setIsAdminLoginOpen(false);
        setIsAdminDashboardOpen(true);
        showToast('¡Bienvenido Administrador! Abriendo Dashboard.', 'success');
        loadAdminStats();
      } else {
        showToast(res.error || 'Credenciales inválidas.', 'error');
      }
    } catch (err) {
      showToast('Error conectando con la API central.', 'error');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
    localStorage.removeItem('homecare_admin_token');
    showToast('Sesión administrativa finalizada.', 'info');
  };

  const handleVerifyCedula = async (cedula) => {
    if (!cedula || cedula.trim().length < 9) {
      showToast('Por favor ingrese una Cédula válida (mínimo 9-10 dígitos).', 'warning');
      return null;
    }
    try {
      const res = await ApiClientAdapter.verifyCedula(cedula);
      if (res.success && res.found) {
        setPatientData(res.data);
        setSelectedPatientId(res.data.id);
        loadVitals(res.data.id);
        showToast(`Paciente ${res.data.fullName} verificado con éxito.`, 'success');
        return res.data;
      } else {
        showToast(`No se encontró paciente con la Cédula ${cedula}.`, 'warning');
        return null;
      }
    } catch (err) {
      showToast('Error verificando Cédula con el servidor.', 'error');
      return null;
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    const p = patients.find(item => item.id === patientId);
    if (p) setPatientData(p);
    loadVitals(patientId);
  };

  const handleRegisterVitals = async (vitalsPayload) => {
    try {
      const res = await ApiClientAdapter.registerVitals(vitalsPayload);
      if (res.success) {
        showToast('¡Signos vitales registrados y alerta/reporte enviado a WhatsApp!', 'success');
        loadVitals(vitalsPayload.patientId);
        loadWaLogs();
        loadAdminStats();
      }
    } catch (err) {
      showToast('Error registrando signos vitales.', 'error');
    }
  };

  const handleCreateBooking = async (bookingPayload) => {
    try {
      const res = await ApiClientAdapter.createBooking(bookingPayload);
      if (res.success) {
        showToast(`¡Reserva #${res.data.id} creada exitosamente! Notificación enviada.`, 'success');
        setIsBookingOpen(false);
        loadInitialData();
      }
    } catch (err) {
      showToast('Error creando la reserva.', 'error');
    }
  };

  const handleSaveClinicalRecord = async (recordPayload) => {
    try {
      const res = await ApiClientAdapter.saveClinicalRecord(recordPayload);
      if (res.success) {
        showToast('¡Ficha Clínica guardada con éxito en el expediente!', 'success');
        setIsClinicalRecordOpen(false);
        loadInitialData();
      }
    } catch (err) {
      showToast('Error guardando Ficha Clínica.', 'error');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await ApiClientAdapter.resolveAlert(alertId, 'Atendido por administración médica.');
      if (res.success) {
        showToast('Alerta médica marcada como resuelta.', 'success');
        loadAdminStats();
      }
    } catch (err) {
      showToast('Error resolviendo la alerta.', 'error');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await ApiClientAdapter.updateBookingStatus(id, status);
      showToast(`Estado de reserva actualizado a "${status}".`, 'info');
      loadAdminStats();
    } catch (err) {
      showToast('Error actualizando estado de la reserva.', 'error');
    }
  };

  const handleCreateReview = async (reviewPayload) => {
    try {
      const res = await ApiClientAdapter.createReview(reviewPayload);
      if (res.success) {
        showToast('¡Muchas gracias por tu recomendación! Ha sido publicada.', 'success');
        setIsReviewOpen(false);
        loadInitialData();
      }
    } catch (err) {
      showToast('Error publicando recomendación.', 'error');
    }
  };

  const handleCreateNurse = async (nursePayload) => {
    try {
      const res = await ApiClientAdapter.createNurse(nursePayload);
      if (res.success) {
        showToast(`¡Enfermera ${res.data.name} dada de alta con éxito!`, 'success');
        loadInitialData();
      } else {
        showToast(res.error || 'No se pudo registrar la enfermera.', 'error');
      }
    } catch (err) {
      showToast('Error conectando con la API al registrar la enfermera.', 'error');
    }
  };

  const handleSendWaSimMessage = async (message) => {
    try {
      const res = await ApiClientAdapter.sendWaWebhook('0998765432', message);
      loadWaLogs();
      return res.botReply;
    } catch (err) {
      return 'Error conectando con el bot de WhatsApp.';
    }
  };

  const openBooking = (service = '', shift = '', nurseId = '') => {
    setBookingService(service);
    setBookingShift(shift);
    setBookingNurseId(nurseId);
    setIsBookingOpen(true);
  };

  return (
    <div className="homecare-app">
      <Navbar 
        onOpenBooking={openBooking} 
        onOpenAdminClick={handleAdminHeaderClick} 
        isAdminLoggedIn={isAdminLoggedIn} 
        onLogoutAdmin={handleAdminLogout}
      />

      <Hero onOpenBooking={openBooking} />

      <Calculator onOpenBooking={openBooking} />

      <Testimonials 
        reviews={reviews} 
        onOpenReviewModal={() => setIsReviewOpen(true)} 
      />

      <Services onOpenBooking={openBooking} />

      <Nurses 
        nurses={nurses} 
        onOpenBookingWithNurse={(nurseId) => openBooking('', '', nurseId)} 
      />

      <Bitacora 
        patients={patients} 
        selectedPatientId={selectedPatientId} 
        patientData={patientData} 
        vitalLogs={vitalLogs} 
        onSelectPatient={handleSelectPatient} 
        onVerifyCedula={handleVerifyCedula} 
        onRegisterVitals={handleRegisterVitals} 
      />

      <footer className="footer-banner">
        <div className="footer-container">
          <div className="footer-brand">
            <h2>CUIDAMOS CON VOCACIÓN, SERVIMOS CON EL CORAZÓN <i className="fa-solid fa-heart"></i></h2>
            <p>Estamos para cuidarlos como merecen. Atención médica personalizada a domicilio.</p>
          </div>

          <div className="footer-phones">
            <a href="https://wa.me/593969532186" target="_blank" rel="noreferrer" className="phone-chip">
              <i className="fa-brands fa-whatsapp"></i> 096 953 2186
            </a>
            <a href="https://wa.me/593983005692" target="_blank" rel="noreferrer" className="phone-chip">
              <i className="fa-brands fa-whatsapp"></i> 098 300 5692
            </a>
          </div>
        </div>
      </footer>

      {/* Fullscreen Admin Dashboard Modal */}
      <AdminDashboardModal 
        isOpen={isAdminDashboardOpen} 
        onClose={() => setIsAdminDashboardOpen(false)} 
        stats={stats} 
        patients={patients} 
        bookings={bookings} 
        alerts={alerts} 
        nurses={nurses} 
        onLogoutAdmin={handleAdminLogout} 
        onOpenClinicalRecord={() => setIsClinicalRecordOpen(true)} 
        onResolveAlert={handleResolveAlert} 
        onUpdateBookingStatus={handleUpdateBookingStatus} 
        onCreateNurse={handleCreateNurse}
      />

      {/* Modals */}
      <AdminLoginModal 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
        onLogin={handleAdminLogin} 
      />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        defaultService={bookingService} 
        defaultShift={bookingShift} 
        onVerifyCedula={handleVerifyCedula} 
        onSubmitBooking={handleCreateBooking} 
      />

      <ClinicalRecordModal 
        isOpen={isClinicalRecordOpen} 
        onClose={() => setIsClinicalRecordOpen(false)} 
        selectedPatient={patientData} 
        onSubmitRecord={handleSaveClinicalRecord} 
      />

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        onSubmitReview={handleCreateReview} 
      />
    </div>
  );
}
export default App;
