import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VitalSignRecord } from './VitalSignRecord';

describe('VitalSignRecord - Reglas Clínicas de Triage', () => {
  it('debe catalogar como "normal" a signos vitales en rangos estándar', () => {
    const record = new VitalSignRecord({
      id: 'vital-test-1',
      patientId: 'pat-1',
      nurseId: 'nurse-1',
      nurseName: 'Lic. Ramos',
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      bloodGlucoseMgDl: 100,
      oxygenSaturation: 98,
      heartRateBpm: 72,
      temperatureCelsius: 36.6,
      medicationAdministered: 'Paracetamol 500mg',
      nurseNotes: 'Paciente estable'
    });

    assert.strictEqual(record.statusFlag, 'normal');
  });

  it('debe catalogar como "advertencia" cuando la presión arterial sistólica supera 140 mmHg', () => {
    const record = new VitalSignRecord({
      id: 'vital-test-2',
      patientId: 'pat-1',
      nurseId: 'nurse-1',
      nurseName: 'Lic. Ramos',
      bloodPressureSystolic: 145,
      bloodPressureDiastolic: 85,
      bloodGlucoseMgDl: 110,
      oxygenSaturation: 96,
      heartRateBpm: 78,
      temperatureCelsius: 36.8,
      medicationAdministered: 'Ninguna',
      nurseNotes: 'Presión ligeramente elevada'
    });

    assert.strictEqual(record.statusFlag, 'advertencia');
  });

  it('debe catalogar como "critico" cuando la saturación de oxígeno cae por debajo de 88%', () => {
    const record = new VitalSignRecord({
      id: 'vital-test-3',
      patientId: 'pat-1',
      nurseId: 'nurse-1',
      nurseName: 'Lic. Ramos',
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      bloodGlucoseMgDl: 100,
      oxygenSaturation: 85,
      heartRateBpm: 110,
      temperatureCelsius: 37.0,
      medicationAdministered: 'Oxígeno asistido',
      nurseNotes: 'Desaturación severa'
    });

    assert.strictEqual(record.statusFlag, 'critico');
  });
});

