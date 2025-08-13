import { ICronJobScheduleParams } from '@shared/modules/d-kron/interfaces/cron-job-schedule-params.interface';

export function buildCronJobSchedule(
  scheduleParamsArr: ICronJobScheduleParams[],
): string {
  // Initialize arrays to gather values for each cron field
  const cronFields = {
    second: [] as (string | number | undefined)[],
    minute: [] as (string | number | undefined)[],
    hour: [] as (string | number | undefined)[],
    dayOfMonth: [] as (string | number | undefined)[],
    month: [] as (string | number | undefined)[],
    dayOfWeek: [] as (string | number | undefined)[],
  };

  // Single loop to gather all field values
  for (const scheduleParams of scheduleParamsArr) {
    const validationResult = validateScheduleParams(scheduleParams);
    if (!validationResult) {
      throw new Error(
        `not valid input data for scheduleParam: ${JSON.stringify(scheduleParams)}`,
      );
    }

    cronFields.second.push(scheduleParams.second);
    cronFields.minute.push(scheduleParams.minute);
    cronFields.hour.push(scheduleParams.hour);
    cronFields.dayOfMonth.push(scheduleParams.dayOfMonth);
    cronFields.month.push(scheduleParams.month);
    cronFields.dayOfWeek.push(scheduleParams.dayOfWeek);
  }

  // Single loop to combine values for each field using the helper function
  const combinedFields: { [key: string]: string } = {};
  for (const [key, values] of Object.entries(cronFields)) {
    // eslint-disable-next-line security/detect-object-injection
    combinedFields[key] = combineFieldValues(values);
  }

  // Return the composed cron expression
  return `${combinedFields.second} ${combinedFields.minute} ${combinedFields.hour} ${combinedFields.dayOfMonth} ${combinedFields.month} ${combinedFields.dayOfWeek}`;
}

// Helper function to combine multiple values and filter out duplicates and undefined values
function combineFieldValues(values: (string | number | undefined)[]): string {
  const filteredValues = values
    .filter(val => val !== undefined && val !== '*') // Remove undefined and wildcard values
    .map(val => val!.toString()); // Convert to strings

  if (filteredValues.length === 0) {
    return '*'; // If no specific values, return the wildcard
  }

  // Remove duplicates and join as comma-separated string
  return [...new Set(filteredValues)].join(',');
}

// Validate the entire schedule
function validateScheduleParams(params: ICronJobScheduleParams): boolean {
  const validSecond = validateCronField(params.second, 0, 59, 'second');
  const validMinute = validateCronField(params.minute, 0, 59, 'minute');
  const validHour = validateCronField(params.hour, 0, 23, 'hour');
  const validDayOfMonth = validateCronField(params.dayOfMonth, 1, 31, 'dayOfMonth');
  const validMonth = validateCronField(params.month, 1, 12, 'month');
  const validDayOfWeek = validateCronField(params.dayOfWeek, 0, 6, 'dayOfWeek');

  return (
    validSecond &&
    validMinute &&
    validHour &&
    validDayOfMonth &&
    validMonth &&
    validDayOfWeek
  );
}

// Validation function for cron fields
function validateCronField(
  field: string | number | undefined,
  min: number,
  max: number,
  fieldName: string,
): boolean {
  if (field === undefined || field === '*') {
    return true; // Undefined or wildcard is always valid
  }

  const value = Number(field);
  if (isNaN(value) || value < min || value > max) {
    throw new Error(
      `Invalid value for ${fieldName}: ${field}. Expected between ${min} and ${max} or '*'.`,
    );
  }

  return true;
}
