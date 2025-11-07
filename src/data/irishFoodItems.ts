export interface FoodItem {
  id: string;
  name: string;
  category: string;
  commonNames: string[];
  image?: string;
}

export const IRISH_FOOD_ITEMS: FoodItem[] = [
  // Dairy & Eggs
  { id: "milk", name: "Milk", category: "fridge", commonNames: ["milk", "whole milk", "semi-skimmed", "skimmed"] },
  { id: "butter", name: "Butter", category: "fridge", commonNames: ["butter", "kerrygold"] },
  { id: "cheese", name: "Cheese", category: "fridge", commonNames: ["cheese", "cheddar", "red cheddar"] },
  { id: "eggs", name: "Eggs", category: "fridge", commonNames: ["eggs", "free range eggs"] },
  { id: "yogurt", name: "Yogurt", category: "fridge", commonNames: ["yogurt", "yoghurt", "natural yogurt"] },
  { id: "cream", name: "Cream", category: "fridge", commonNames: ["cream", "double cream", "single cream"] },
  
  // Meat & Fish
  { id: "chicken", name: "Chicken Breast", category: "fridge", commonNames: ["chicken", "chicken breast", "chicken fillets"] },
  { id: "mince", name: "Beef Mince", category: "fridge", commonNames: ["mince", "beef mince", "minced beef"] },
  { id: "bacon", name: "Bacon", category: "fridge", commonNames: ["bacon", "rashers", "back bacon"] },
  { id: "sausages", name: "Sausages", category: "fridge", commonNames: ["sausages", "pork sausages"] },
  { id: "salmon", name: "Salmon", category: "fridge", commonNames: ["salmon", "salmon fillet"] },
  { id: "ham", name: "Ham", category: "fridge", commonNames: ["ham", "cooked ham", "sliced ham"] },
  
  // Vegetables
  { id: "potatoes", name: "Potatoes", category: "produce", commonNames: ["potatoes", "spuds", "rooster potatoes"] },
  { id: "carrots", name: "Carrots", category: "produce", commonNames: ["carrots"] },
  { id: "onions", name: "Onions", category: "produce", commonNames: ["onions", "brown onions"] },
  { id: "tomatoes", name: "Tomatoes", category: "produce", commonNames: ["tomatoes", "cherry tomatoes"] },
  { id: "lettuce", name: "Lettuce", category: "produce", commonNames: ["lettuce", "iceberg lettuce"] },
  { id: "cucumber", name: "Cucumber", category: "produce", commonNames: ["cucumber"] },
  { id: "peppers", name: "Bell Peppers", category: "produce", commonNames: ["peppers", "bell peppers", "sweet peppers"] },
  { id: "broccoli", name: "Broccoli", category: "produce", commonNames: ["broccoli"] },
  { id: "cauliflower", name: "Cauliflower", category: "produce", commonNames: ["cauliflower"] },
  { id: "mushrooms", name: "Mushrooms", category: "produce", commonNames: ["mushrooms", "button mushrooms"] },
  { id: "courgette", name: "Courgette", category: "produce", commonNames: ["courgette", "zucchini"] },
  { id: "garlic", name: "Garlic", category: "produce", commonNames: ["garlic", "garlic bulb"] },
  { id: "ginger", name: "Ginger", category: "produce", commonNames: ["ginger", "fresh ginger"] },
  { id: "scallions", name: "Scallions", category: "produce", commonNames: ["scallions", "spring onions"] },
  { id: "parsnips", name: "Parsnips", category: "produce", commonNames: ["parsnips"] },
  { id: "turnip", name: "Turnip", category: "produce", commonNames: ["turnip", "swede"] },
  { id: "cabbage", name: "Cabbage", category: "produce", commonNames: ["cabbage", "white cabbage", "savoy cabbage"] },
  { id: "leek", name: "Leek", category: "produce", commonNames: ["leek", "leeks"] },
  
  // Fruits
  { id: "apples", name: "Apples", category: "produce", commonNames: ["apples", "granny smith", "pink lady"] },
  { id: "bananas", name: "Bananas", category: "produce", commonNames: ["bananas"] },
  { id: "oranges", name: "Oranges", category: "produce", commonNames: ["oranges"] },
  { id: "strawberries", name: "Strawberries", category: "produce", commonNames: ["strawberries"] },
  { id: "grapes", name: "Grapes", category: "produce", commonNames: ["grapes", "red grapes", "white grapes"] },
  { id: "blueberries", name: "Blueberries", category: "produce", commonNames: ["blueberries"] },
  { id: "raspberries", name: "Raspberries", category: "produce", commonNames: ["raspberries"] },
  { id: "lemons", name: "Lemons", category: "produce", commonNames: ["lemons"] },
  { id: "limes", name: "Limes", category: "produce", commonNames: ["limes"] },
  
  // Frozen
  { id: "peas", name: "Frozen Peas", category: "freezer", commonNames: ["peas", "frozen peas"] },
  { id: "sweetcorn", name: "Frozen Sweetcorn", category: "freezer", commonNames: ["sweetcorn", "frozen sweetcorn", "corn"] },
  { id: "mixed-veg", name: "Mixed Vegetables", category: "freezer", commonNames: ["mixed veg", "frozen veg"] },
  { id: "chips", name: "Frozen Chips", category: "freezer", commonNames: ["chips", "frozen chips", "oven chips"] },
  { id: "fish-fingers", name: "Fish Fingers", category: "freezer", commonNames: ["fish fingers"] },
  { id: "ice-cream", name: "Ice Cream", category: "freezer", commonNames: ["ice cream"] },
  
  // Pantry - Grains & Pasta
  { id: "rice", name: "Rice", category: "pantry", commonNames: ["rice", "white rice", "basmati rice", "long grain rice"] },
  { id: "pasta", name: "Pasta", category: "pantry", commonNames: ["pasta", "spaghetti", "penne", "fusilli"] },
  { id: "flour", name: "Flour", category: "pantry", commonNames: ["flour", "plain flour", "self-raising flour"] },
  { id: "bread", name: "Bread", category: "pantry", commonNames: ["bread", "sliced bread", "white bread", "brown bread"] },
  { id: "oats", name: "Porridge Oats", category: "pantry", commonNames: ["oats", "porridge", "porridge oats"] },
  { id: "cereal", name: "Cereal", category: "pantry", commonNames: ["cereal", "cornflakes", "weetabix"] },
  
  // Pantry - Canned & Jarred
  { id: "beans", name: "Baked Beans", category: "pantry", commonNames: ["beans", "baked beans"] },
  { id: "tinned-tomatoes", name: "Tinned Tomatoes", category: "pantry", commonNames: ["tinned tomatoes", "chopped tomatoes", "canned tomatoes"] },
  { id: "chickpeas", name: "Chickpeas", category: "pantry", commonNames: ["chickpeas", "tinned chickpeas"] },
  { id: "kidney-beans", name: "Kidney Beans", category: "pantry", commonNames: ["kidney beans", "red kidney beans"] },
  { id: "tuna", name: "Tinned Tuna", category: "pantry", commonNames: ["tuna", "tinned tuna"] },
  { id: "coconut-milk", name: "Coconut Milk", category: "pantry", commonNames: ["coconut milk", "tinned coconut milk"] },
  { id: "peanut-butter", name: "Peanut Butter", category: "pantry", commonNames: ["peanut butter"] },
  { id: "jam", name: "Jam", category: "pantry", commonNames: ["jam", "strawberry jam"] },
  { id: "honey", name: "Honey", category: "pantry", commonNames: ["honey"] },
  
  // Pantry - Condiments & Sauces
  { id: "ketchup", name: "Ketchup", category: "pantry", commonNames: ["ketchup", "tomato ketchup"] },
  { id: "mayo", name: "Mayonnaise", category: "pantry", commonNames: ["mayo", "mayonnaise"] },
  { id: "mustard", name: "Mustard", category: "pantry", commonNames: ["mustard"] },
  { id: "soy-sauce", name: "Soy Sauce", category: "pantry", commonNames: ["soy sauce"] },
  { id: "olive-oil", name: "Olive Oil", category: "pantry", commonNames: ["olive oil", "extra virgin olive oil"] },
  { id: "veg-oil", name: "Vegetable Oil", category: "pantry", commonNames: ["vegetable oil", "sunflower oil"] },
  { id: "vinegar", name: "Vinegar", category: "pantry", commonNames: ["vinegar", "white vinegar", "balsamic vinegar"] },
  { id: "stock-cubes", name: "Stock Cubes", category: "pantry", commonNames: ["stock cubes", "chicken stock", "beef stock", "vegetable stock"] },
  
  // Spices & Herbs
  { id: "salt", name: "Salt", category: "spices", commonNames: ["salt", "table salt", "sea salt"] },
  { id: "pepper", name: "Black Pepper", category: "spices", commonNames: ["pepper", "black pepper"] },
  { id: "paprika", name: "Paprika", category: "spices", commonNames: ["paprika"] },
  { id: "cumin", name: "Cumin", category: "spices", commonNames: ["cumin", "ground cumin"] },
  { id: "coriander", name: "Coriander", category: "spices", commonNames: ["coriander", "ground coriander"] },
  { id: "chilli", name: "Chilli Powder", category: "spices", commonNames: ["chilli", "chilli powder", "chili powder"] },
  { id: "curry-powder", name: "Curry Powder", category: "spices", commonNames: ["curry powder"] },
  { id: "turmeric", name: "Turmeric", category: "spices", commonNames: ["turmeric"] },
  { id: "cinnamon", name: "Cinnamon", category: "spices", commonNames: ["cinnamon"] },
  { id: "mixed-herbs", name: "Mixed Herbs", category: "spices", commonNames: ["mixed herbs", "italian herbs"] },
  { id: "basil", name: "Basil", category: "spices", commonNames: ["basil", "dried basil"] },
  { id: "oregano", name: "Oregano", category: "spices", commonNames: ["oregano"] },
  
  // Beverages
  { id: "tea", name: "Tea Bags", category: "pantry", commonNames: ["tea", "tea bags", "barrys tea", "lyons tea"] },
  { id: "coffee", name: "Coffee", category: "pantry", commonNames: ["coffee", "instant coffee"] },
  { id: "sugar", name: "Sugar", category: "pantry", commonNames: ["sugar", "white sugar", "caster sugar"] },
];

export const searchFoodItems = (query: string): FoodItem[] => {
  if (!query) return IRISH_FOOD_ITEMS;
  
  const lowerQuery = query.toLowerCase();
  return IRISH_FOOD_ITEMS.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.commonNames.some(name => name.toLowerCase().includes(lowerQuery))
  );
};

export const getCategoryItems = (category: string): FoodItem[] => {
  return IRISH_FOOD_ITEMS.filter(item => item.category === category);
};
