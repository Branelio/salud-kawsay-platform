import { Review } from '../../domain/entities/Review';
import { IReviewRepository } from '../../domain/ports/repositories';

export interface AddReviewDTO {
  clientName: string;
  relation: string;
  photoUrl?: string;
  rating: number;
  comment: string;
}

export class AddReviewUseCase {
  constructor(private reviewRepo: IReviewRepository) {}

  async execute(dto: AddReviewDTO): Promise<Review> {
    const id = `rev-${Math.floor(1000 + Math.random() * 9000)}`;
    const review = new Review({
      id,
      clientName: dto.clientName,
      relation: dto.relation,
      photoUrl: dto.photoUrl,
      rating: dto.rating,
      comment: dto.comment,
      isVerified: true
    });
    return this.reviewRepo.save(review);
  }
}

