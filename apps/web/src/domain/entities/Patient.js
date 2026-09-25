export class PatientEntity {
  constructor({ id, cedula, fullName, age, bloodType, allergies, condition, address, familyContactName, familyPhone, clinicalRecord }) {
    this.id = id;
    this.cedula = cedula;
    this.fullName = fullName;
    this.age = age;
    this.bloodType = bloodType || 'O+';
    this.allergies = allergies || 'Ninguna';
    this.condition = condition;
    this.address = address;
    this.familyContactName = familyContactName;
    this.familyPhone = familyPhone;
    this.clinicalRecord = clinicalRecord || null;
  }
}
