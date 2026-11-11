export interface ReviewProps {
  id: string;
  clientName: string;
  relation: string;
  photoUrl?: string;
  rating: number;
  comment: string;
  date?: string;
  isVerified?: boolean;
}

export class Review {
  public readonly id: string;
  public readonly clientName: string;
  public readonly relation: string;
  public readonly photoUrl: string;
  public readonly rating: number;
  public readonly comment: string;
  public readonly date: string;
  public readonly isVerified: boolean;

  constructor(props: ReviewProps) {
    this.id = props.id;
    this.clientName = props.clientName || 'Familiar de Paciente';
    this.relation = props.relation || 'Familiar';
    this.photoUrl = props.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
    this.rating = Number(props.rating) || 5;
    this.comment = props.comment;
    this.date = props.date || new Date().toISOString().split('T')[0];
    this.isVerified = props.isVerified ?? true;
  }
}

