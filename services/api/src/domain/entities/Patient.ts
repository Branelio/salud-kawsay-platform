export interface PatientProps {
  id: string;
  cedula: string;
  fullName: string;
  age: number;
  bloodType: string;
  allergies: string;
  condition: string;
  address: string;
  familyContactName: string;
  familyPhone: string;
}

export class Patient {
  public readonly id: string;
  public readonly cedula: string;
  public readonly fullName: string;
  public readonly age: number;
  public readonly bloodType: string;
  public readonly allergies: string;
  public readonly condition: string;
  public readonly address: string;
  public readonly familyContactName: string;
  public readonly familyPhone: string;

  constructor(props: PatientProps) {
    this.id = props.id;
    this.cedula = props.cedula;
    this.fullName = props.fullName;
    this.age = props.age;
    this.bloodType = props.bloodType || 'O+';
    this.allergies = props.allergies || 'Ninguna';
    this.condition = props.condition;
    this.address = props.address;
    this.familyContactName = props.familyContactName;
    this.familyPhone = props.familyPhone;
  }
}

