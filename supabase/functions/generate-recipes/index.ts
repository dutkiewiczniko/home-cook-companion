import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      items, 
      mealType, 
      dietaryPreference, 
      optionalIngredients, 
      generalNotes,
      cookingFor,
      goingShopping, 
      budget,
      homeIngredientUsage = 60,
      regenerateAll,
      tweakRecipeId,
      tweakPrompt,
      currentRecipes
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const itemsList = items
      .map((item: any) => `- ${item.name} (${item.quantity}) [${item.category}]`)
      .join('\n');

    let promptParts: string[] = [];
    let systemPrompt = 'You are a creative and helpful cooking assistant. Provide practical, delicious meal suggestions based on available ingredients.';

    if (tweakRecipeId && tweakPrompt) {
      // Tweaking a specific recipe
      const recipeToTweak = currentRecipes.find((r: any) => r.id === tweakRecipeId);
      promptParts.push(`You are a helpful cooking assistant. The user wants to modify this recipe:\n\n${recipeToTweak.content}\n\nUser's request: ${tweakPrompt}\n\nProvide a modified version of the recipe based on the user's request.`);
    } else {
      // Generating new recipes
      
      // Determine ingredient preference wording based on slider
      let ingredientStrategy = '';
      if (homeIngredientUsage <= 20) {
        ingredientStrategy = 'Ignore the pantry inventory entirely. Design new meals using fresh supermarket ingredients.';
      } else if (homeIngredientUsage <= 40) {
        ingredientStrategy = 'Prefer fresh supermarket ingredients, but you may use 1-2 pantry items if they enhance the meal.';
      } else if (homeIngredientUsage <= 60) {
        ingredientStrategy = 'Mix pantry and supermarket ingredients evenly. Create balanced recipes using both.';
      } else if (homeIngredientUsage <= 80) {
        ingredientStrategy = 'Prefer pantry ingredients. Only add extras from the supermarket when truly needed for the recipe.';
      } else {
        ingredientStrategy = 'Use ONLY pantry ingredients. Do not suggest any items from the supermarket.';
      }

      promptParts.push(`You are a helpful cooking assistant. Generate ${regenerateAll ? '5' : '1'} delicious meal recipe(s).

**CRITICAL CONSTRAINT - USER NOTES OVERRIDE EVERYTHING:**
${generalNotes ? `The user has specified: "${generalNotes}"
ALL recipes MUST align with this theme or constraint. This is a HARD REQUIREMENT that overrides all other preferences including ingredient usage, meal type, and dietary preferences.` : 'No specific user notes provided.'}

**Ingredient Usage Strategy:**
${ingredientStrategy}

${homeIngredientUsage > 0 ? `**Pantry Inventory:**
${itemsList}` : ''}

**Cooking for:** ${cookingFor} ${cookingFor === 1 ? 'person' : 'people'}`);

      if (mealType) {
        promptParts.push(`**Meal Type:** ${mealType}`);
      }
      
      if (dietaryPreference) {
        promptParts.push(`**Dietary Preference:** ${dietaryPreference}`);
      }
      
      if (optionalIngredients) {
        promptParts.push(`**Optional ingredients to explore:** ${optionalIngredients}`);
      }
      
      if (goingShopping) {
        promptParts.push('**Shopping Mode:** User can purchase additional ingredients from the supermarket.');
        if (budget) {
          promptParts.push(`**Budget Constraint:** Try to keep total recipe cost under €${budget} using estimated Irish grocery prices.`);
        }
      }
    }

    promptParts.push(`
**CRITICAL OUTPUT FORMAT - STRICT JSON ONLY:**
Return ONLY a valid JSON object, no intro text, no explanations, no markdown.
The JSON must have this exact structure:

{
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Recipe Name",
      "time": "30 minutes",
      "difficulty": "Easy",
      "content": "## Recipe Name\\n\\n**Time:** 30 minutes\\n**Difficulty:** Easy\\n\\n**Description:**\\nBrief 1-2 sentence description.\\n\\n**Ingredients needed:**\\n- Ingredient 1 (amount)\\n- Ingredient 2 (amount)\\n\\n**Simple cooking instructions:**\\n1. Step one\\n2. Step two\\n3. Step three",
      "calories": 450,
      "protein": 25,
      "fat": 15,
      "carbs": 50
    }
  ]
}

Each recipe must include:
- Unique id
- Clear title
- Time estimate
- Difficulty level (Easy/Medium/Hard)
- Full content in markdown format with Description, Ingredients needed, and Simple cooking instructions sections
- Estimated nutrition values (calories, protein in g, fat in g, carbs in g)

Return exactly ${regenerateAll ? '5' : '1'} recipe(s) in the recipes array.`);

    const prompt = promptParts.join('\n\n');

    console.log('Sending request to AI gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content;

    console.log('Raw AI response:', rawContent.substring(0, 200));

    // Strip any leading text before the JSON object
    const jsonStartIndex = rawContent.indexOf('{');
    if (jsonStartIndex > 0) {
      console.log('Stripping intro text before JSON');
      rawContent = rawContent.substring(jsonStartIndex);
    }

    // Strip any trailing text after the JSON object
    const jsonEndIndex = rawContent.lastIndexOf('}');
    if (jsonEndIndex > 0 && jsonEndIndex < rawContent.length - 1) {
      console.log('Stripping outro text after JSON');
      rawContent = rawContent.substring(0, jsonEndIndex + 1);
    }

    let parsedData;
    try {
      parsedData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON parse failed:', parseError);
      console.error('Content snippet:', rawContent.substring(0, 500));
      throw new Error('AI returned invalid JSON format');
    }

    if (!parsedData.recipes || !Array.isArray(parsedData.recipes)) {
      throw new Error('AI response missing recipes array');
    }

    // Validate and clean recipes
    const validRecipes = parsedData.recipes.filter((r: any) => {
      const hasRequiredFields = r.id && r.title && r.content;
      const hasIngredients = r.content.includes('Ingredients needed');
      const hasInstructions = r.content.includes('cooking instructions');
      return hasRequiredFields && hasIngredients && hasInstructions;
    }).slice(0, 5);

    if (validRecipes.length === 0) {
      throw new Error('No valid recipes returned by AI');
    }

    console.log(`Successfully validated ${validRecipes.length} recipes`);
    
    if (tweakRecipeId) {
      // Return single tweaked recipe
      const recipe = {
        ...validRecipes[0],
        id: tweakRecipeId,
      };
      
      return new Response(
        JSON.stringify({ recipe }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipes = validRecipes.map((r: any, index: number) => ({
      id: r.id || `recipe-${Date.now()}-${index}`,
      title: r.title,
      time: r.time || '30 minutes',
      difficulty: r.difficulty || 'Medium',
      content: r.content,
      calories: r.calories || 0,
      protein: r.protein || 0,
      fat: r.fat || 0,
      carbs: r.carbs || 0,
    }));

    console.log('Successfully generated recipes');

    return new Response(
      JSON.stringify({ recipes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recipes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTime(text: string): string {
  const timeMatch = text.match(/(\d+)\s*(minute|min|hour|hr)/i);
  return timeMatch ? timeMatch[0] : '30 minutes';
}

function extractDifficulty(text: string): string {
  const diffMatch = text.match(/(Easy|Medium|Hard)/i);
  return diffMatch ? diffMatch[0] : 'Medium';
}
