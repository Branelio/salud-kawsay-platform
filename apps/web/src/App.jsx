import React, { useState, useEffect } from 'react';
import { ApiClientAdapter } from './infrastructure/api/ApiClient';
import { Navbar } from './presentation/components/Navbar';
import { Hero } from './presentation/components/Hero';
import { Calculator } from './presentation/components/Calculator';
import { Testimonials } from './presentation/components/Testimonials';
import { Services, Nurses } from './presentation/components/Nurses';
import { Bitacora } from './presentation/components/Bitacora';
import { AdminPanel, WhatsAppSim } from './presentation/components/AdminPanel';
import { AdminDashboardModal } from './presentation/components/AdminDashboardModal';
import { AdminLoginModal } from './presentation/modals/AdminLoginModal';
import { BookingModal } from './presentation/modals/BookingModal';
import { ClinicalRecordModal } from './presentation/modals/ClinicalRecordModal';
import { ReviewModal } from './presentation/modals/ReviewModal';

export function App() {
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
        alert('¡Bienvenido Administrador! Abriendo Dashboard General.');
        loadAdminStats();
      } else {
        alert(res.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      alert('Error conectando con la API.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
    localStorage.removeItem('homecare_admin_token');
  };

  const handleVerifyCedula = async (cedula) => {
    try {
      const res = await ApiClientAdapter.verifyCedula(cedula);
      if (res.success && res.found) {
        setPatientData(res.data);
        setSelectedPatientId(res.data.id);
        loadVitals(res.data.id);
        return res.data;
      } else {
        alert(`No se encontró paciente con la Cédula ${cedula}.`);
        return null;
      }
    } catch (err) {
      alert('Error verificando Cédula.');
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
        alert('¡Signos vitales registrados y aviso enviado a WhatsApp!');
        loadVitals(vitalsPayload.patientId);
        loadWaLogs();
        loadAdminStats();
      }
    } catch (err) {
      alert('Error registrando signos vitales.');
    }
  };

  const handleCreateBooking = async (bookingPayload) => {
    try {
      const res = await ApiClientAdapter.createBooking(bookingPayload);
      if (res.success) {
        alert(`¡Reserva #${res.data.id} creada con Cédula ${bookingPayload.patientCedula}!`);
        setIsBookingOpen(false);
        loadInitialData();
      }
    } catch (err) {
      alert('Error creando reserva.');
    }
  };

  const handleSaveClinicalRecord = async (recordPayload) => {
    try {
      const res = await ApiClientAdapter.saveClinicalRecord(recordPayload);
      if (res.success) {
        alert('¡Ficha Clínica guardada con éxito!');
        setIsClinicalRecordOpen(false);
        loadInitialData();
      }
    } catch (err) {
      alert('Error guardando Ficha Clínica.');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await ApiClientAdapter.resolveAlert(alertId, 'Atendido por administración.');
      if (res.success) {
        alert('Alerta marcada como resuelta.');
        loadAdminStats();
      }
    } catch (err) {
      alert('Error resolviendo alerta.');
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await ApiClientAdapter.updateBookingStatus(id, status);
      loadAdminStats();
    } catch (err) {
      alert('Error actualizando reserva.');
    }
  };

  const handleCreateReview = async (reviewPayload) => {
    try {
      const res = await ApiClientAdapter.createReview(reviewPayload);
      if (res.success) {
        alert('¡Muchas gracias por tu recomendación!');
        setIsReviewOpen(false);
        loadInitialData();
      }
    } catch (err) {
      alert('Error publicando recomendación.');
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

      <AdminPanel 
        isAdminLoggedIn={isAdminLoggedIn} 
        stats={stats} 
        alerts={alerts} 
        bookings={bookings} 
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)} 
        onLogoutAdmin={handleAdminLogout} 
        onOpenClinicalRecord={() => setIsClinicalRecordOpen(true)} 
        onResolveAlert={handleResolveAlert} 
        onUpdateBookingStatus={handleUpdateBookingStatus} 
      />

      <WhatsAppSim 
        waLogs={waLogs} 
        onSendMessage={handleSendWaSimMessage} 
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
        defaultNurseId={bookingNurseId} 
        nurses={nurses} 
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
