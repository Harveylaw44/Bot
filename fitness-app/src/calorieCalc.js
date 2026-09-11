// Mifflin-St Jeor BMR + activity multiplier for TDEE, then a goal
// adjustment and a simple macro split. Not medical advice — a reasonable
// general-purpose default, same as most tracking apps use.

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'little or no exercise', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active', hint: '1-3 days/week', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active', hint: '3-5 days/week', multiplier: 1.55 },
  { value: 'active', label: 'Active', hint: '6-7 days/week', multiplier: 1.725 },
  { value: 'veryActive', label: 'Very Active', hint: 'physical job or 2x/day training', multiplier: 1.9 },
];

export const GOAL_TYPES = [
  { value: 'lose', label: 'Lose Weight', adjust: -500 },
  { value: 'maintain', label: 'Maintain', adjust: 0 },
  { value: 'gain', label: 'Gain Weight', adjust: 300 },
];

export function calculateGoals({ sex, age, heightCm, weightKg, activityLevel, goalType }) {
  const bmr =
    sex === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel) || ACTIVITY_LEVELS[2];
  const tdee = bmr * activity.multiplier;

  const goal = GOAL_TYPES.find((g) => g.value === goalType) || GOAL_TYPES[1];
  const calorieGoal = Math.max(1200, Math.round(tdee + goal.adjust));

  const proteinGoal = Math.round(weightKg * 2); // ~2g/kg bodyweight
  const fatGoal = Math.round((calorieGoal * 0.25) / 9); // ~25% of calories
  const carbGoal = Math.max(0, Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieGoal,
    proteinGoal,
    carbGoal,
    fatGoal,
  };
}
