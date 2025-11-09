// Default quantities for common food items
export const DEFAULT_QUANTITIES: Record<string, string> = {
  // Dairy
  "milk": "1 L",
  "cheese": "200 g",
  "butter": "250 g",
  "yogurt": "500 g",
  "cream": "250 ml",
  
  // Meat & Protein
  "beef": "500 g",
  "chicken": "500 g",
  "pork": "500 g",
  "lamb": "500 g",
  "bacon": "250 g",
  "sausages": "400 g",
  "eggs": "12 items",
  "salmon": "400 g",
  "cod": "400 g",
  
  // Pantry
  "bread": "800 g",
  "rice": "1 kg",
  "pasta": "500 g",
  "flour": "1 kg",
  "sugar": "1 kg",
  "salt": "500 g",
  "oil": "500 ml",
  "olive oil": "500 ml",
  
  // Vegetables
  "potatoes": "2 kg",
  "onions": "1 kg",
  "carrots": "1 kg",
  "tomatoes": "500 g",
  "garlic": "100 g",
  "peppers": "500 g",
  
  // Fruits
  "apples": "1 kg",
  "bananas": "6 items",
  "oranges": "1 kg",
  
  // Default fallback
  "default": "1 unit"
};

export const getDefaultQuantity = (itemName: string): string => {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Try exact match first
  if (DEFAULT_QUANTITIES[normalizedName]) {
    return DEFAULT_QUANTITIES[normalizedName];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(DEFAULT_QUANTITIES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  return DEFAULT_QUANTITIES.default;
};
