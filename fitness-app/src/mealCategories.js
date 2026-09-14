// Optional time-of-day tag for meals and ingredients, used to filter the
// "Tap to Log" list down to what's actually relevant right now (e.g. not
// scrolling past eggs while looking for dinner). Untagged items only show
// under "All" — they're not hidden, just not claimed for a specific time.
export const MEAL_CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export function categoryLabel(value) {
  return MEAL_CATEGORIES.find((c) => c.value === value)?.label ?? null;
}
