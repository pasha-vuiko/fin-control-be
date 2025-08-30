import { IntervalJobScheduleParams } from '@shared/modules/d-kron/interfaces/interval-job-schedule-params.interface';

export function buildIntervalJobSchedule(
  intervalParams: IntervalJobScheduleParams,
): string {
  const { seconds = 0, minutes = 0, hours = 0, days = 0, weeks = 0 } = intervalParams;

  // Build the DKron interval string
  let intervalString = '@every ';

  // Add weeks to the interval if specified
  if (weeks > 0) {
    intervalString += `${weeks}w `;
  }

  // Add days to the interval if specified
  if (days > 0) {
    intervalString += `${days}d `;
  }

  // Add hours to the interval if specified
  if (hours > 0) {
    intervalString += `${hours}h `;
  }

  // Add minutes to the interval if specified
  if (minutes > 0) {
    intervalString += `${minutes}m `;
  }

  // Add seconds to the interval if specified
  if (seconds > 0) {
    intervalString += `${seconds}s `;
  }

  // Trim any trailing space and return the formatted interval string
  return intervalString.trim();
}
