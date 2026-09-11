// Measuring units an ingredient's nutrition can be defined per. Weight/volume
// units (g, ml) conventionally use a 100-unit reference serving (how
// nutrition labels work); small units (tbsp, tsp, piece) use a 1-unit
// reference, since they're already serving-sized.
export const MEASURE_UNITS = [
  { value: 'g', label: 'grams (g)', defaultServing: 100 },
  { value: 'ml', label: 'millilitres (ml)', defaultServing: 100 },
  { value: 'tbsp', label: 'tablespoon (tbsp)', defaultServing: 1 },
  { value: 'tsp', label: 'teaspoon (tsp)', defaultServing: 1 },
  { value: 'piece', label: 'piece / each', defaultServing: 1 },
];

export function defaultServingAmount(unit) {
  return MEASURE_UNITS.find((u) => u.value === unit)?.defaultServing ?? 100;
}

export function unitLabel(unit) {
  return MEASURE_UNITS.find((u) => u.value === unit)?.value ?? unit;
}

// Scales an ingredient's per-serving nutrition to an actual logged quantity,
// in the same unit the ingredient's nutrition is defined in.
export function scaleIngredient(ingredient, quantity) {
  const scale = (Number(quantity) || 0) / (ingredient.servingAmount || 1);
  return {
    calories: ingredient.calories * scale,
    protein: (ingredient.protein || 0) * scale,
    carbs: (ingredient.carbs || 0) * scale,
    fat: (ingredient.fat || 0) * scale,
  };
}
