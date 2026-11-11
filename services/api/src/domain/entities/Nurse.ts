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
  }
}

