export interface NurseProps {
  id: string;
  name: string;
  photoUrl: string;
  specialty: string;
  rating: number;
  phone: string;
  experienceYears: number;
  isAvailable: boolean;
  bio?: string;
  licenseNumber?: string;
  credentialStatus?: 'verificada' | 'por_vencer' | 'pendiente';
}

export class Nurse {
  public readonly id: string;
  public readonly name: string;
  public readonly photoUrl: string;
  public readonly specialty: string;
  public readonly rating: number;
  public readonly phone: string;
  public readonly experienceYears: number;
  public readonly isAvailable: boolean;
  public readonly bio?: string;
  public readonly licenseNumber: string;
  public readonly credentialStatus: 'verificada' | 'por_vencer' | 'pendiente';

  constructor(props: NurseProps) {
    this.id = props.id;
    this.name = props.name;
    this.photoUrl = props.photoUrl;
    this.specialty = props.specialty;
    this.rating = props.rating ?? 5.0;
    this.phone = props.phone;
    this.experienceYears = props.experienceYears;
    this.isAvailable = props.isAvailable ?? true;
    this.bio = props.bio;
    this.licenseNumber = props.licenseNumber || 'MSP-EC-PEND';
    this.credentialStatus = props.credentialStatus || 'verificada';
  }
}

