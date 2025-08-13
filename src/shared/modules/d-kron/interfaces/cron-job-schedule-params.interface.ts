export interface ICronJobScheduleParams {
  // 0-59 or '*'
  second?: '*' | number;
  // 0-59 or '*'
  minute?: '*' | number;
  // 0-23 or '*'
  hour?: '*' | number;
  // 1-31 or '*'
  dayOfMonth?: '*' | number;
  // 1-12 or '*'
  month?: '*' | number;
  // 0-6 (Sunday = 0) or '*'
  dayOfWeek?: '*' | number;
}
