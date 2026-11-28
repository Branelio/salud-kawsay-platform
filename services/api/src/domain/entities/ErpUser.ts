export type ErpRole = 'admin' | 'doctor' | 'nurse' | 'reception';

export interface ErpUserProps {
  id: string;
  username: string;
  fullName: string;
  role: ErpRole;
  specialty?: string;
  clinicId?: string;
  clinicName?: string;
  passwordHash: string;
  active?: boolean;
  createdAt?: string;
}

export class ErpUser {
  public readonly id: string;
  public readonly username: string;
  public readonly fullName: string;
  public readonly role: ErpRole;
  public readonly specialty: string;
  public readonly clinicId: string;
  public readonly clinicName: string;
  public readonly passwordHash: string;
  public active: boolean;
  public readonly createdAt: string;

  constructor(props: ErpUserProps) {
    this.id = props.id;
    this.username = props.username.trim().toLowerCase();
    this.fullName = props.fullName;
    this.role = props.role || 'doctor';
    this.specialty = props.specialty || 'General';
    this.clinicId = props.clinicId || 'clinic-kawsay-hq';
    this.clinicName = props.clinicName || 'Salud Kawsay Matriz Quito';
    this.passwordHash = props.passwordHash;
    this.active = props.active !== undefined ? props.active : true;
    this.createdAt = props.createdAt || new Date().toISOString();
  }

  public toPublicProfile() {
    return {
      userId: this.id,
      username: this.username,
      name: this.fullName,
      role: this.role,
      specialty: this.specialty,
      clinicId: this.clinicId,
      clinicName: this.clinicName,
      active: this.active,
      createdAt: this.createdAt
    };
  }
}
