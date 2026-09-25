import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Alert } from 'react-native';
import { MobileApiClient } from './src/services/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('nurse'); // 'nurse' | 'family'
  
  // Data lists
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('pat-1');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalLogs, setVitalLogs] = useState([]);
  
  // Nurse Form state
  const [bpSystolic, setBpSystolic] = useState('122');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [glucose, setGlucose] = useState('110');
  const [spo2, setSpo2] = useState('97');
  const [heartRate, setHeartRate] = useState('72');
  const [temp, setTemp] = useState('36.6');
  const [meds, setMeds] = useState('Enalapril 10mg - 08:00 AM');
  const [notes, setNotes] = useState('Paciente en buen estado general, descansó y almorzó adecuadamente.');
  
  // Status states
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckinTime, setLastCheckinTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatientsData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadVitalsData(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatientsData = async () => {
    const res = await MobileApiClient.getPatients();
    if (res.success && res.data.length > 0) {
      setPatients(res.data);
      const active = res.data.find(p => p.id === selectedPatientId) || res.data[0];
      setSelectedPatient(active);
      setSelectedPatientId(active.id);
    }
  };

  const loadVitalsData = async (patientId) => {
    setLoading(true);
    const res = await MobileApiClient.getVitals(patientId);
    if (res.success) {
      setVitalLogs(res.data);
    }
    setLoading(false);
  };

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setSelectedPatientId(p.id);
  };

  const handleCheckin = async () => {
    const payload = {
      nurseId: 'nurse-1',
      nurseName: 'Lic. María Elena Ramos',
      patientId: selectedPatient ? selectedPatient.id : 'pat-1',
      patientName: selectedPatient ? selectedPatient.fullName : 'Sra. Carmen Rosa Delgado',
      latitude: -0.180653,
      longitude: -78.467838,
      address: selectedPatient ? selectedPatient.address : 'Av. Coruña 124, Quito'
    };

    const res = await MobileApiClient.checkinNurse(payload);
    if (res.success) {
      setIsCheckedIn(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastCheckinTime(timeStr);
      Alert.alert('📍 Fichaje GPS Exitoso', `Fichaje de ingreso verificado para ${payload.patientName} a las ${timeStr}. Notificación enviada a la familia por WhatsApp.`);
    } else {
      Alert.alert('Error', res.error || 'No se pudo registrar el fichaje.');
    }
  };

  const handleSaveVitals = async () => {
    if (!bpSystolic || !bpDiastolic) {
      Alert.alert('Atención', 'Por favor ingresá los valores de Presión Arterial.');
      return;
    }

    const payload = {
      patientId: selectedPatient ? selectedPatient.id : 'pat-1',
      patientName: selectedPatient ? selectedPatient.fullName : 'Sra. Carmen Rosa Delgado',
      nurseId: 'nurse-1',
      nurseName: 'Lic. María Elena Ramos',
      bloodPressureSystolic: parseInt(bpSystolic),
      bloodPressureDiastolic: parseInt(bpDiastolic),
      bloodGlucoseMgDl: parseInt(glucose) || 100,
      oxygenSaturation: parseInt(spo2) || 98,
      heartRateBpm: parseInt(heartRate) || 72,
      temperatureCelsius: parseFloat(temp) || 36.5,
      medicationAdministered: meds,
      nurseNotes: notes
    };

    const res = await MobileApiClient.registerVitals(payload);
    if (res.success) {
      Alert.alert('✅ Registrado', 'Signos vitales guardados en la API central y reporte enviado a la familia por WhatsApp.');
      loadVitalsData(selectedPatientId);
    } else {
      Alert.alert('Error', res.error || 'No se pudo guardar la medición.');
    }
  };

  const latestVital = vitalLogs.length > 0 ? vitalLogs[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 Salud Kawsay App</Text>
        <Text style={styles.headerSubtitle}>Plataforma Móvil para Enfermeras y Familias</Text>
      </View>

      {/* Patient Selector Strip */}
      {patients.length > 1 && (
        <View style={styles.patientSelectorStrip}>
          <Text style={styles.selectorLabel}>Paciente:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {patients.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.patientChip, selectedPatientId === p.id && styles.patientChipActive]}
                onPress={() => handleSelectPatient(p)}
              >
                <Text style={[styles.patientChipText, selectedPatientId === p.id && styles.patientChipTextActive]}>
                  {p.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'nurse' && styles.activeTab]} 
          onPress={() => setActiveTab('nurse')}
        >
          <Text style={[styles.tabText, activeTab === 'nurse' && styles.activeTabText]}>👩‍⚕️ Modulo Enfermera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'family' && styles.activeTab]} 
          onPress={() => setActiveTab('family')}
        >
          <Text style={[styles.tabText, activeTab === 'family' && styles.activeTabText]}>👨‍👩‍👧 Modulo Familia</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'nurse' ? (
          /* Nurse Shift & Vital Entry Screen */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guardia Activa: {selectedPatient ? selectedPatient.fullName : 'Carmen Rosa Delgado'}</Text>
            <Text style={styles.patientSub}>📍 Dirección: {selectedPatient ? selectedPatient.address : 'Av. Coruña 124'} | ⏰ Turno 12h</Text>

            <TouchableOpacity 
              style={[styles.btnCheckin, isCheckedIn && styles.btnCheckinSuccess]} 
              onPress={handleCheckin}
            >
              <Text style={styles.btnCheckinText}>
                {isCheckedIn ? `✅ Fichaje Confirmado GPS (${lastCheckinTime})` : '📍 Fichar Ingreso (Check-in con GPS)'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>Registrar Signos Vitales</Text>
            
            <View style={styles.row}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>P.A Sistólica (mmHg)</Text>
                <TextInput style={styles.input} value={bpSystolic} onChangeText={setBpSystolic} keyboardType="numeric" />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>P.A Diastólica (mmHg)</Text>
                <TextInput style={styles.input} value={bpDiastolic} onChangeText={setBpDiastolic} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>Glucosa (mg/dL)</Text>
                <TextInput style={styles.input} value={glucose} onChangeText={setGlucose} keyboardType="numeric" />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>SatO2 (%)</Text>
                <TextInput style={styles.input} value={spo2} onChangeText={setSpo2} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>Frec. Cardíaca (BPM)</Text>
                <TextInput style={styles.input} value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>Temperatura (°C)</Text>
                <TextInput style={styles.input} value={temp} onChangeText={setTemp} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Medicamento Administrado</Text>
            <TextInput style={styles.input} value={meds} onChangeText={setMeds} />

            <Text style={styles.label}>Notas de la Enfermera</Text>
            <TextInput style={[styles.input, { height: 70 }]} value={notes} onChangeText={setNotes} multiline />

            <TouchableOpacity style={styles.btnSave} onPress={handleSaveVitals}>
              <Text style={styles.btnSaveText}>💾 Guardar y Sincronizar en Tiempo Real</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Family Live Tracking Screen */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monitoreo en Vivo: {selectedPatient ? selectedPatient.fullName : 'Carmen Rosa Delgado'}</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>🟢 Guardia en Curso - Lic. María Elena Ramos</Text>
            </View>

            {latestVital ? (
              <View style={styles.gridVitals}>
                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>Presión Arterial</Text>
                  <Text style={styles.vitalValue}>{latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic} mmHg</Text>
                </View>
                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>Glucosa</Text>
                  <Text style={styles.vitalValue}>{latestVital.bloodGlucoseMgDl} mg/dL</Text>
                </View>
                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>SatO2 / Frecuencia</Text>
                  <Text style={styles.vitalValue}>{latestVital.oxygenSaturation}% | {latestVital.heartRateBpm} bpm</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No hay registros de signos vitales hoy.</Text>
            )}

            <Text style={styles.sectionHeader}>Historial de Guardias y Reportes Sincronizados</Text>
            {vitalLogs.slice(0, 5).map((log, idx) => (
              <View key={log.id || idx} style={styles.historyItem}>
                <View style={styles.historyHeaderRow}>
                  <Text style={styles.historyTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</Text>
                  <Text style={[styles.statusBadge, log.statusFlag === 'critico' ? styles.badgeCritico : log.statusFlag === 'advertencia' ? styles.badgeWarn : styles.badgeOk]}>
                    {log.statusFlag === 'critico' ? '⚠️ CRÍTICO' : log.statusFlag === 'advertencia' ? 'ℹ️ ADVERTENCIA' : '✅ NORMAL'}
                  </Text>
                </View>
                <Text style={styles.historyText}><strong>Medicación:</strong> {log.medicationAdministered || 'Sin medicamentos'}</Text>
                <Text style={styles.historyText}><strong>Notas:</strong> {log.nurseNotes}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.btnWhatsapp}>
              <Text style={styles.btnWhatsappText}>💬 Contactar Enfermera por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#042f2e' },
  header: { padding: 18, backgroundColor: '#064e3b', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#6ee7b7', fontSize: 12, marginTop: 4 },
  patientSelectorStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#022c22', paddingHorizontal: 16, paddingVertical: 8 },
  selectorLabel: { color: '#a7f3d0', fontSize: 12, marginRight: 8, fontWeight: 'bold' },
  patientChip: { backgroundColor: '#044e3a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  patientChipActive: { backgroundColor: '#10b981' },
  patientChipText: { color: '#a7f3d0', fontSize: 12 },
  patientChipTextActive: { color: '#fff', fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#022c22', padding: 6 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#059669' },
  tabText: { color: '#a7f3d0', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#065f46', borderRadius: 16, padding: 20, marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#10b981' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  patientSub: { color: '#a7f3d0', fontSize: 12, marginBottom: 16 },
  btnCheckin: { backgroundColor: '#0284c7', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  btnCheckinSuccess: { backgroundColor: '#059669' },
  btnCheckinText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionHeader: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputCol: { flex: 1 },
  label: { color: '#a7f3d0', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#044e3a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14 },
  btnSave: { backgroundColor: '#10b981', padding: 14, borderRadius: 28, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  badgeSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.25)', padding: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  badgeSuccessText: { color: '#6ee7b7', fontSize: 12, fontWeight: 'bold' },
  gridVitals: { gap: 10, marginBottom: 20 },
  vitalBox: { backgroundColor: '#044e3a', padding: 12, borderRadius: 12 },
  vitalLabel: { color: '#a7f3d0', fontSize: 11 },
  vitalValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  noDataText: { color: '#a7f3d0', fontStyle: 'italic', marginBottom: 16 },
  historyItem: { backgroundColor: '#022c22', padding: 12, borderRadius: 10, marginBottom: 12 },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyTime: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
  statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, color: '#fff' },
  badgeOk: { backgroundColor: '#059669' },
  badgeWarn: { backgroundColor: '#d97706' },
  badgeCritico: { backgroundColor: '#dc2626' },
  historyText: { color: '#d1fae5', fontSize: 13, marginBottom: 4 },
  btnWhatsapp: { backgroundColor: '#25d366', padding: 14, borderRadius: 28, alignItems: 'center', marginTop: 12 },
  btnWhatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
