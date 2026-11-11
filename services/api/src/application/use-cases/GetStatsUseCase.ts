import { IBookingRepository, IPatientRepository, INurseRepository, IAlertRepository, IReviewRepository } from '../../domain/ports/repositories';

export interface PlatformStats {
  totalBookings: number;
  activePatients: number;
  totalNurses: number;
  activeAlerts: number;
  avgRating: string;
  totalReviews: number;
}

export class GetStatsUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private patientRepo: IPatientRepository,
    private nurseRepo: INurseRepository,
    private alertRepo: IAlertRepository,
    private reviewRepo: IReviewRepository
  ) {}

  async execute(): Promise<PlatformStats> {
    const bookings = await this.bookingRepo.getAll();
    const patients = await this.patientRepo.getAll();
    const nurses = await this.nurseRepo.getAll();
    const alerts = await this.alertRepo.getAll();
    const reviews = await this.reviewRepo.getAll();

    const activeAlerts = alerts.filter(a => !a.resolved).length;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return {
      totalBookings: bookings.length,
      activePatients: patients.length,
      totalNurses: nurses.length,
      activeAlerts,
      avgRating,
      totalReviews: reviews.length
    };
  }
}

