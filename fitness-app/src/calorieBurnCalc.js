// MET (Metabolic Equivalent of Task) values for common cardio activities.
// calories/min = MET * 3.5 * weightKg / 200. Standard estimate used by most
// fitness trackers — actual burn varies with intensity and individual, but
// it's far better than guessing a number out of thin air.
export const CARDIO_ACTIVITIES = [
  { value: 'jump_rope', label: 'Jump Rope / Skipping', met: 11.8 },
  { value: 'running_fast', label: 'Running (fast)', met: 11.8 },
  { value: 'running_jog', label: 'Running (jog)', met: 9.8 },
  { value: 'walking_brisk', label: 'Walking (brisk)', met: 5.0 },
  { value: 'walking_moderate', label: 'Walking (moderate)', met: 3.5 },
  { value: 'cycling_vigorous', label: 'Cycling (vigorous)', met: 10.0 },
  { value: 'cycling_moderate', label: 'Cycling (moderate)', met: 7.5 },
  { value: 'swimming', label: 'Swimming', met: 7.0 },
  { value: 'rowing', label: 'Rowing', met: 7.0 },
  { value: 'hiit', label: 'HIIT / Circuit', met: 8.0 },
  { value: 'elliptical', label: 'Elliptical', met: 5.0 },
  { value: 'boxing', label: 'Boxing (bag/pad work)', met: 7.8 },
  { value: 'sports', label: 'Football / Basketball / Sports', met: 8.0 },
  { value: 'other', label: 'Other (enter manually)', met: null },
];

export function estimateCaloriesBurned(met, weightKg, minutes) {
  if (!met || !weightKg || !minutes) return 0;
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}
