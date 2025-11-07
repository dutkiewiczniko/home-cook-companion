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
{ id: "cheese", name: "Cheese", category: "fridge", commonNames: ["cheese", "cheddar", "red cheddar", "mozzarella", "parmesan", "feta"] },
{ id: "eggs", name: "Eggs", category: "fridge", commonNames: ["eggs", "free range eggs"] },
{ id: "yogurt", name: "Yogurt", category: "fridge", commonNames: ["yogurt", "yoghurt", "natural yogurt", "greek yogurt"] },
{ id: "cream", name: "Cream", category: "fridge", commonNames: ["cream", "double cream", "single cream", "whipping cream"] },
{ id: "cream-cheese", name: "Cream Cheese", category: "fridge", commonNames: ["cream cheese", "philadelphia"] },
{ id: "milk-alt", name: "Milk Alternatives", category: "fridge", commonNames: ["almond milk", "oat milk", "soy milk"] },

// Meat & Fish
{ id: "chicken", name: "Chicken Breast", category: "fridge", commonNames: ["chicken", "chicken breast", "chicken fillets"] },
{ id: "mince", name: "Beef Mince", category: "fridge", commonNames: ["mince", "beef mince", "minced beef"] },
{ id: "bacon", name: "Bacon", category: "fridge", commonNames: ["bacon", "rashers", "back bacon"] },
{ id: "sausages", name: "Sausages", category: "fridge", commonNames: ["sausages", "pork sausages"] },
{ id: "salmon", name: "Salmon", category: "fridge", commonNames: ["salmon", "salmon fillet"] },
{ id: "ham", name: "Ham", category: "fridge", commonNames: ["ham", "cooked ham", "sliced ham"] },
{ id: "turkey", name: "Turkey", category: "fridge", commonNames: ["turkey", "turkey mince", "turkey breast"] },
{ id: "prawns", name: "Prawns", category: "fridge", commonNames: ["prawns", "king prawns", "shrimp"] },
{ id: "white-fish", name: "White Fish", category: "fridge", commonNames: ["cod", "haddock", "white fish"] },

// Vegetables
{ id: "potatoes", name: "Potatoes", category: "produce", commonNames: ["potatoes", "spuds", "rooster potatoes"] },
{ id: "sweet-potato", name: "Sweet Potato", category: "produce", commonNames: ["sweet potato", "sweet potatoes"] },
{ id: "carrots", name: "Carrots", category: "produce", commonNames: ["carrots"] },
{ id: "onions", name: "Onions", category: "produce", commonNames: ["onions", "brown onions", "red onions"] },
{ id: "tomatoes", name: "Tomatoes", category: "produce", commonNames: ["tomatoes", "cherry tomatoes", "plum tomatoes"] },
{ id: "lettuce", name: "Lettuce", category: "produce", commonNames: ["lettuce", "iceberg lettuce", "shredded lettuce"] },
{ id: "salad-leaves", name: "Salad Leaves", category: "produce", commonNames: ["mixed leaves", "baby spinach", "rocket"] },
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
{ id: "cabbage", name: "Cabbage", category: "produce", commonNames: ["cabbage", "white cabbage", "savoy cabbage", "red cabbage"] },
{ id: "leek", name: "Leek", category: "produce", commonNames: ["leek", "leeks"] },
{ id: "spinach", name: "Spinach", category: "produce", commonNames: ["spinach", "baby spinach"] },
{ id: "chilli-fresh", name: "Fresh Chilli", category: "produce", commonNames: ["chilli", "chili"] },
{ id: "herbs-fresh", name: "Fresh Herbs", category: "produce", commonNames: ["parsley", "coriander", "basil", "mint"] },

// Fruits
{ id: "apples", name: "Apples", category: "produce", commonNames: ["apples", "granny smith", "pink lady"] },
{ id: "bananas", name: "Bananas", category: "produce", commonNames: ["bananas"] },
{ id: "oranges", name: "Oranges", category: "produce", commonNames: ["oranges", "mandarins", "satsumas"] },
{ id: "strawberries", name: "Strawberries", category: "produce", commonNames: ["strawberries"] },
{ id: "grapes", name: "Grapes", category: "produce", commonNames: ["grapes", "red grapes", "white grapes"] },
{ id: "blueberries", name: "Blueberries", category: "produce", commonNames: ["blueberries"] },
{ id: "raspberries", name: "Raspberries", category: "produce", commonNames: ["raspberries"] },
{ id: "lemons", name: "Lemons", category: "produce", commonNames: ["lemons"] },
{ id: "limes", name: "Limes", category: "produce", commonNames: ["limes"] },
{ id: "pineapple", name: "Pineapple", category: "produce", commonNames: ["pineapple"] },
{ id: "mango", name: "Mango", category: "produce", commonNames: ["mango"] },
{ id: "watermelon", name: "Watermelon", category: "produce", commonNames: ["watermelon"] },
{ id: "pear", name: "Pear", category: "produce", commonNames: ["pear", "conference pear"] },
{ id: "kiwi", name: "Kiwi", category: "produce", commonNames: ["kiwi", "kiwifruit"] },
{ id: "plum", name: "Plum", category: "produce", commonNames: ["plum", "plums"] },
{ id: "avocado", name: "Avocado", category: "produce", commonNames: ["avocado", "avocados"] },

// Frozen
{ id: "peas", name: "Frozen Peas", category: "freezer", commonNames: ["peas", "frozen peas"] },
{ id: "sweetcorn", name: "Frozen Sweetcorn", category: "freezer", commonNames: ["sweetcorn", "frozen sweetcorn", "corn"] },
{ id: "mixed-veg", name: "Mixed Vegetables", category: "freezer", commonNames: ["mixed veg", "frozen veg", "country mix", "garden mix"] },
{ id: "broccoli-frozen", name: "Frozen Broccoli", category: "freezer", commonNames: ["broccoli", "frozen broccoli"] },
{ id: "stirfry-mix", name: "Stir-Fry Veg Mix", category: "freezer", commonNames: ["stir fry", "stir-fry veg", "satay mix", "asian veg mix"] },
{ id: "chips", name: "Frozen Chips", category: "freezer", commonNames: ["chips", "frozen chips", "oven chips", "fries"] },
{ id: "wedges", name: "Potato Wedges", category: "freezer", commonNames: ["wedges", "potato wedges"] },
{ id: "waffles", name: "Potato Waffles", category: "freezer", commonNames: ["waffles", "potato waffles"] },
{ id: "hash-browns", name: "Hash Browns", category: "freezer", commonNames: ["hash browns"] },
{ id: "onion-rings", name: "Onion Rings", category: "freezer", commonNames: ["onion rings"] },
{ id: "fish-fingers", name: "Fish Fingers", category: "freezer", commonNames: ["fish fingers"] },
{ id: "fish-fillets", name: "Frozen Fish Fillets", category: "freezer", commonNames: ["fish fillets", "breaded fish", "battered fish"] },
{ id: "prawns-frozen", name: "Frozen Prawns", category: "freezer", commonNames: ["prawns", "frozen prawns", "shrimp"] },
{ id: "nuggets", name: "Chicken Nuggets", category: "freezer", commonNames: ["chicken nuggets", "nuggets"] },
{ id: "goujons", name: "Chicken Goujons", category: "freezer", commonNames: ["chicken goujons", "goujons"] },
{ id: "burgers", name: "Beef Burgers", category: "freezer", commonNames: ["burgers", "beef burgers"] },
{ id: "pizza", name: "Frozen Pizza", category: "freezer", commonNames: ["pizza", "frozen pizza"] },
{ id: "ice-cream", name: "Ice Cream", category: "freezer", commonNames: ["ice cream", "tub ice cream"] },
{ id: "ice-lollies", name: "Ice Lollies", category: "freezer", commonNames: ["ice lollies", "ice pops"] },
{ id: "frozen-fruit", name: "Frozen Mixed Berries", category: "freezer", commonNames: ["frozen fruit", "mixed berries", "frozen strawberries"] },
{ id: "desserts", name: "Frozen Desserts", category: "freezer", commonNames: ["apple pie", "cheesecake", "dessert", "frozen dessert"] },

// Pantry - Grains & Pasta
{ id: "rice", name: "Rice", category: "pantry", commonNames: ["rice", "white rice", "basmati rice", "long grain rice"] },
{ id: "pasta", name: "Pasta", category: "pantry", commonNames: ["pasta", "spaghetti", "penne", "fusilli"] },
{ id: "flour", name: "Flour", category: "pantry", commonNames: ["flour", "plain flour", "self-raising flour"] },
{ id: "bread", name: "Bread", category: "pantry", commonNames: ["bread", "sliced bread", "white bread", "brown bread", "wraps", "bagels"] },
{ id: "oats", name: "Porridge Oats", category: "pantry", commonNames: ["oats", "porridge", "porridge oats"] },
{ id: "cereal", name: "Cereal", category: "pantry", commonNames: ["cereal", "cornflakes", "weetabix", "granola", "muesli"] },

// Pantry - Canned & Jarred
{ id: "beans", name: "Baked Beans", category: "pantry", commonNames: ["beans", "baked beans"] },
{ id: "tinned-tomatoes", name: "Tinned Tomatoes", category: "pantry", commonNames: ["tinned tomatoes", "chopped tomatoes", "canned tomatoes"] },
{ id: "chickpeas", name: "Chickpeas", category: "pantry", commonNames: ["chickpeas", "tinned chickpeas"] },
{ id: "kidney-beans", name: "Kidney Beans", category: "pantry", commonNames: ["kidney beans", "red kidney beans"] },
{ id: "tuna", name: "Tinned Tuna", category: "pantry", commonNames: ["tuna", "tinned tuna"] },
{ id: "coconut-milk", name: "Coconut Milk", category: "pantry", commonNames: ["coconut milk", "tinned coconut milk"] },
{ id: "peanut-butter", name: "Peanut Butter", category: "pantry", commonNames: ["peanut butter"] },
{ id: "jam", name: "Jam", category: "pantry", commonNames: ["jam", "strawberry jam", "raspberry jam"] },
{ id: "honey", name: "Honey", category: "pantry", commonNames: ["honey"] },

// Pantry - Condiments & Sauces
{ id: "ketchup", name: "Ketchup", category: "pantry", commonNames: ["ketchup", "tomato ketchup"] },
{ id: "mayo", name: "Mayonnaise", category: "pantry", commonNames: ["mayo", "mayonnaise"] },
{ id: "mustard", name: "Mustard", category: "pantry", commonNames: ["mustard", "dijon mustard", "english mustard", "wholegrain mustard"] },
{ id: "soy-sauce", name: "Soy Sauce", category: "pantry", commonNames: ["soy sauce"] },
{ id: "olive-oil", name: "Olive Oil", category: "pantry", commonNames: ["olive oil", "extra virgin olive oil"] },
{ id: "veg-oil", name: "Vegetable Oil", category: "pantry", commonNames: ["vegetable oil", "sunflower oil", "rapeseed oil"] },
{ id: "vinegar", name: "Vinegar", category: "pantry", commonNames: ["vinegar", "white vinegar", "balsamic vinegar", "apple cider vinegar"] },
{ id: "stock-cubes", name: "Stock Cubes", category: "pantry", commonNames: ["stock cubes", "chicken stock", "beef stock", "vegetable stock"] },
{ id: "bbq-sauce", name: "BBQ Sauce", category: "pantry", commonNames: ["bbq sauce", "barbecue sauce"] },
{ id: "pesto", name: "Pesto", category: "pantry", commonNames: ["pesto", "green pesto", "red pesto"] },
{ id: "tomato-puree", name: "Tomato Purée", category: "pantry", commonNames: ["tomato purée", "paste"] },
{ id: "hot-sauce", name: "Hot Sauce", category: "pantry", commonNames: ["hot sauce", "sriracha", "franks"] },

// Spices & Herbs (dry)
{ id: "salt", name: "Salt", category: "spices", commonNames: ["salt", "table salt", "sea salt"] },
{ id: "pepper", name: "Black Pepper", category: "spices", commonNames: ["pepper", "black pepper"] },
{ id: "paprika", name: "Paprika", category: "spices", commonNames: ["paprika", "smoked paprika"] },
{ id: "cumin", name: "Cumin", category: "spices", commonNames: ["cumin", "ground cumin"] },
{ id: "coriander", name: "Coriander", category: "spices", commonNames: ["coriander", "ground coriander"] },
{ id: "chilli", name: "Chilli Powder", category: "spices", commonNames: ["chilli", "chilli powder", "chili powder"] },
{ id: "curry-powder", name: "Curry Powder", category: "spices", commonNames: ["curry powder"] },
{ id: "turmeric", name: "Turmeric", category: "spices", commonNames: ["turmeric"] },
{ id: "cinnamon", name: "Cinnamon", category: "spices", commonNames: ["cinnamon"] },
{ id: "mixed-herbs", name: "Mixed Herbs", category: "spices", commonNames: ["mixed herbs", "italian herbs"] },
{ id: "basil-dried", name: "Basil", category: "spices", commonNames: ["basil", "dried basil"] },
{ id: "oregano", name: "Oregano", category: "spices", commonNames: ["oregano"] },
{ id: "garlic-powder", name: "Garlic Powder", category: "spices", commonNames: ["garlic powder"] },
{ id: "onion-powder", name: "Onion Powder", category: "spices", commonNames: ["onion powder"] },
{ id: "thyme", name: "Thyme", category: "spices", commonNames: ["thyme"] },
{ id: "rosemary", name: "Rosemary", category: "spices", commonNames: ["rosemary"] },

// Beverages & Sugar
{ id: "tea", name: "Tea Bags", category: "pantry", commonNames: ["tea", "tea bags", "barrys tea", "lyons tea"] },
{ id: "coffee", name: "Coffee", category: "pantry", commonNames: ["coffee", "instant coffee", "ground coffee"] },
{ id: "sugar", name: "Sugar", category: "pantry", commonNames: ["sugar", "white sugar", "caster sugar", "granulated sugar"] },
{ id: "juice", name: "Fruit Juice", category: "pantry", commonNames: ["orange juice", "apple juice", "juice"] },
{ id: "water", name: "Bottled Water", category: "pantry", commonNames: ["water", "bottled water", "sparkling water", "still water"] },
{ id: "soft-drinks", name: "Soft Drinks", category: "pantry", commonNames: ["coke", "fizzy drinks", "lemonade"] },
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
