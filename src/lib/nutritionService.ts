import { supabase } from "@/integrations/supabase/client";

// Fallback nutrition values per 100g
const NUTRITION_FALLBACK = {
  energy_kcal: 150,
  protein_g: 5,
  fat_g: 5,
  carbs_g: 20,
};

export interface NutritionData {
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  is_estimate?: boolean;
}

export interface ScaledNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * Fetch nutrition profile from database by ingredient name
 */
export async function fetchNutritionProfile(ingredientName: string): Promise<NutritionData> {
  const { data: nutritionProfile } = await supabase
    .from("nutrition_profiles")
    .select("*")
    .ilike("food_name", `%${ingredientName}%`)
    .limit(1)
    .maybeSingle();

  if (nutritionProfile) {
    return {
      energy_kcal: nutritionProfile.energy_kcal,
      protein_g: nutritionProfile.protein_g,
      fat_g: nutritionProfile.fat_g,
      carbs_g: nutritionProfile.carbs_g,
      is_estimate: nutritionProfile.is_estimate,
    };
  }

  return {
    ...NUTRITION_FALLBACK,
    is_estimate: true,
  };
}

/**
 * Scale nutrition values by grams (assumes nutrition data is per 100g)
 */
export function scaleNutritionByGrams(nutrition: NutritionData, grams: number): ScaledNutrition {
  const multiplier = grams / 100;
  return {
    calories: nutrition.energy_kcal * multiplier,
    protein: nutrition.protein_g * multiplier,
    fat: nutrition.fat_g * multiplier,
    carbs: nutrition.carbs_g * multiplier,
  };
}

/**
 * Write nutrition totals to daily nutrition log
 */
export async function logNutritionToDaily(
  userId: string,
  scaled: ScaledNutrition,
  date?: string
): Promise<void> {
  const logDate = date || new Date().toISOString().split("T")[0];

  const { data: existingLog } = await supabase
    .from("daily_nutrition_log")
    .select("*")
    .eq("date", logDate)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingLog) {
    await supabase
      .from("daily_nutrition_log")
      .update({
        total_calories: existingLog.total_calories + scaled.calories,
        total_protein: existingLog.total_protein + scaled.protein,
        total_fat: existingLog.total_fat + scaled.fat,
        total_carbs: existingLog.total_carbs + scaled.carbs,
      })
      .eq("id", existingLog.id);
  } else {
    await supabase.from("daily_nutrition_log").insert({
      user_id: userId,
      date: logDate,
      total_calories: scaled.calories,
      total_protein: scaled.protein,
      total_fat: scaled.fat,
      total_carbs: scaled.carbs,
    });
  }
}

/**
 * Parse quantity string to extract numeric value
 */
export function parseQuantity(quantityStr: string): number {
  const match = quantityStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 100;
}
