import { scaleIngredient } from './foodUnits.js';

// A meal is a recipe: a list of items, each either a reference into the
// ingredient library (scaled by quantity) or a one-off custom line with its
// own nutrition. Totals are always derived from current ingredient data at
// call time — editing an ingredient or a meal's item list is reflected
// immediately, everywhere the meal is shown or logged.
//
// Meals saved before this recipe model existed are flat objects
// (name/calories/protein/carbs/fat, no `items`). Those keep working exactly
// as they always have until the user edits them — see migrateLegacyMeal.
export function computeMealNutrition(meal, ingredients) {
  if (!Array.isArray(meal.items)) {
    return {
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
    };
  }

  return meal.items.reduce(
    (acc, item) => {
      const values =
        item.type === 'custom'
          ? { calories: item.calories || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 }
          : (() => {
              const ing = ingredients.find((i) => i.id === item.ingredientId);
              return ing ? scaleIngredient(ing, item.quantity) : null;
            })();
      if (!values) return acc;
      return {
        calories: acc.calories + values.calories,
        protein: acc.protein + values.protein,
        carbs: acc.carbs + values.carbs,
        fat: acc.fat + values.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Converts a legacy flat meal into the items-based shape, as a single custom
// line carrying its exact original numbers — called the first time such a
// meal is opened for editing, so nothing is lost and the user can then add
// real ingredients alongside it.
export function migrateLegacyMeal(meal) {
  if (Array.isArray(meal.items)) return meal;
  return {
    ...meal,
    items: [
      {
        type: 'custom',
        name: meal.name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
      },
    ],
  };
}
