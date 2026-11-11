import { IBookingRepository, IPatientRepository, INurseRepository, IAlertRepository, IReviewRepository } from '../../domain/ports/repositories';

export interface PlatformStats {
  totalBookings: number;
  activePatients: number;
  totalNurses: number;
  activeAlerts: number;
  avgRating: string;
  totalReviews: number;
  // Métricas Financieras y Operativas ERP
  totalRevenueUSD: number;
  totalNursePayoutUSD: number;
  netAgencyMarginUSD: number;
  marginPercentage: string;
  pendingAssignments: number;
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

    const totalRevenueUSD = bookings.reduce((sum, b) => sum + (b.totalPriceUSD || 0), 0);
    const totalNursePayoutUSD = bookings.reduce((sum, b) => sum + (b.nursePayoutUSD || 0), 0);
    const netAgencyMarginUSD = Number((totalRevenueUSD - totalNursePayoutUSD).toFixed(2));
    const marginPercentage = totalRevenueUSD > 0
      ? ((netAgencyMarginUSD / totalRevenueUSD) * 100).toFixed(1)
      : '0.0';

    const pendingAssignments = bookings.filter(b => b.status === 'pendiente' || !b.nurseId).length;

    return {
      totalBookings: bookings.length,
      activePatients: patients.length,
      totalNurses: nurses.length,
      activeAlerts,
      avgRating,
      totalReviews: reviews.length,
      totalRevenueUSD,
      totalNursePayoutUSD,
      netAgencyMarginUSD,
      marginPercentage,
      pendingAssignments
    };
  }
}
