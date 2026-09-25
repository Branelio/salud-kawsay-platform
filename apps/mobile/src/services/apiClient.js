const API_BASE_URL = 'http://localhost:4000/api';

export const MobileApiClient = {
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`);
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error fetching patients:', error);
      return { success: false, data: [] };
    }
  },

  async getNurses() {
    try {
      const res = await fetch(`${API_BASE_URL}/nurses`);
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error fetching nurses:', error);
      return { success: false, data: [] };
    }
  },

  async getVitals(patientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/vitals/${patientId}`);
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error fetching vitals:', error);
      return { success: false, data: [] };
    }
  },

  async registerVitals(vitalPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalPayload)
      });
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error registering vitals:', error);
      return { success: false, error: 'Error de conexión con la API' };
    }
  },

  async checkinNurse(checkinPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/nurses/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinPayload)
      });
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error registering checkin:', error);
      return { success: false, error: 'Error de conexión con la API' };
    }
  },

  async getBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      return await res.json();
    } catch (error) {
      console.error('[MobileAPI] Error fetching bookings:', error);
      return { success: false, data: [] };
    }
  }
};
