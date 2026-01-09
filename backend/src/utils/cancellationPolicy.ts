/**
 * Cancellation Policy Rules:
 * - Free Cancellation: Up to 7 days before check-in (100% refund)
 * - Partial Refund: 3-7 days before check-in (50% refund)
 * - Non-Refundable: Within 72 hours (3 days) of check-in (0% refund)
 */

export interface CancellationInfo {
  refundPercentage: number;
  refundAmount: number;
  policy: string;
  deadline: Date;
}

export function calculateCancellation(
  checkInDate: Date,
  totalPrice: number,
  cancellationDate: Date = new Date()
): CancellationInfo {
  // Calculate days until check-in
  const now = new Date(cancellationDate);
  const checkIn = new Date(checkInDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysUntilCheckIn = Math.floor(
    (checkIn.getTime() - now.getTime()) / millisecondsPerDay
  );

  // Free Cancellation: 7+ days before check-in
  if (daysUntilCheckIn >= 7) {
    const freeDeadline = new Date(checkIn);
    freeDeadline.setDate(freeDeadline.getDate() - 7);
    return {
      refundPercentage: 100,
      refundAmount: totalPrice,
      policy: 'Free Cancellation',
      deadline: freeDeadline,
    };
  }

  // Partial Refund: 3-6 days before check-in (50% refund)
  if (daysUntilCheckIn >= 3) {
    const partialDeadline = new Date(checkIn);
    partialDeadline.setDate(partialDeadline.getDate() - 3);
    return {
      refundPercentage: 50,
      refundAmount: Math.round(totalPrice * 0.5 * 100) / 100,
      policy: 'Partial Refund (50%)',
      deadline: partialDeadline,
    };
  }

  // Non-Refundable: Within 72 hours of check-in
  return {
    refundPercentage: 0,
    refundAmount: 0,
    policy: 'Non-Refundable',
    deadline: checkIn,
  };
}

export function getCancellationDeadlineInfo(checkInDate: Date) {
  const checkIn = new Date(checkInDate);
  const freeDeadline = new Date(checkIn);
  freeDeadline.setDate(freeDeadline.getDate() - 7);

  const partialDeadline = new Date(checkIn);
  partialDeadline.setDate(partialDeadline.getDate() - 3);

  return {
    freeDeadline,
    partialDeadline,
    checkInDate: checkIn,
  };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
