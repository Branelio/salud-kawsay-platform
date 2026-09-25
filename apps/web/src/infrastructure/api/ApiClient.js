const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000')
  ? 'http://localhost:4000/api'
  : '/api';

export class ApiClientAdapter {
  static async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }

  static async loginAdmin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  }

  static async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  }

  static async getNurses() {
    const res = await fetch(`${API_BASE}/nurses`);
    return res.json();
  }

  static async getPatients() {
    const res = await fetch(`${API_BASE}/patients`);
    return res.json();
  }

  static async verifyCedula(cedula) {
    const res = await fetch(`${API_BASE}/patients/cedula/${cedula}`);
    return res.json();
  }

  static async getVitals(patientId) {
    const res = await fetch(`${API_BASE}/vitals/${patientId}`);
    return res.json();
  }

  static async registerVitals(payload) {
    const res = await fetch(`${API_BASE}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  static async saveClinicalRecord(payload) {
    const res = await fetch(`${API_BASE}/clinical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  static async createBooking(payload) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  static async getBookings() {
    const res = await fetch(`${API_BASE}/bookings`);
    return res.json();
  }

  static async updateBookingStatus(id, status) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  }

  static async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    return res.json();
  }

  static async resolveAlert(id, notes) {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    return res.json();
  }

  static async getReviews() {
    const res = await fetch(`${API_BASE}/reviews`);
    return res.json();
  }

  static async createReview(payload) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  static async getWaLogs() {
    const res = await fetch(`${API_BASE}/whatsapp/logs`);
    return res.json();
  }

  static async sendWaWebhook(from, message) {
    const res = await fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, message })
    });
    return res.json();
  }
}
