import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_STRING = 1000;
const MAX_ITEMS = 500;

function s(v: unknown, max = MAX_STRING): string {
  if (v === undefined || v === null) return '';
  const str = String(v);
  return str.length > max ? str.slice(0, max) : str;
}

function validateItems(raw: unknown): Array<{ name: string; quantity: string; category: string }> {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((it: any) => ({
    name: s(it?.name, 200),
    quantity: s(it?.quantity, 100),
    category: s(it?.category, 50),
  })).filter((it) => it.name);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT / authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const items = validateItems((body as any).items);
    const mealType = s((body as any).mealType, 50);
    const dietaryPreference = s((body as any).dietaryPreference, 100);
    const optionalIngredients = s((body as any).optionalIngredients, MAX_STRING);
    const generalNotes = s((body as any).generalNotes, 2000);
    const cookingForRaw = Number((body as any).cookingFor);
    const cookingFor = Number.isFinite(cookingForRaw) && cookingForRaw >= 1 && cookingForRaw <= 50
      ? Math.floor(cookingForRaw) : 1;
    const goingShopping = Boolean((body as any).goingShopping);
    const budgetRaw = Number((body as any).budget);
    const budget = Number.isFinite(budgetRaw) && budgetRaw >= 0 && budgetRaw <= 100000 ? budgetRaw : '';
    const homeIngredientUsageRaw = Number((body as any).homeIngredientUsage);
    const homeIngredientUsage = Number.isFinite(homeIngredientUsageRaw)
      ? Math.max(0, Math.min(100, homeIngredientUsageRaw))
      : 60;
    const regenerateAll = Boolean((body as any).regenerateAll);
    const tweakRecipeId = s((body as any).tweakRecipeId, 100);
    const tweakPrompt = s((body as any).tweakPrompt, 2000);
    const currentRecipesRaw = (body as any).currentRecipes;
    const currentRecipes = Array.isArray(currentRecipesRaw) ? currentRecipesRaw.slice(0, 20) : [];

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
          ingredientStrategy = 'Mostly ignore the pantry inventory. Prefer designing new meals using fresh supermarket ingredients.';
        } else if (homeIngredientUsage <= 40) {
          ingredientStrategy = 'Prefer fresh supermarket ingredients, but you may use up to 2-3 pantry items if they clearly enhance the meal.';
        } else if (homeIngredientUsage <= 60) {
          ingredientStrategy = 'Mix pantry and supermarket ingredients in a balanced way. Do not over-prioritise either.';
        } else if (homeIngredientUsage <= 80) {
          ingredientStrategy = 'Prefer pantry ingredients. Add supermarket items only when they noticeably improve the recipe.';
        } else {
          ingredientStrategy = 'Use ONLY pantry ingredients. Do not suggest any items from the supermarket.';
        }

        promptParts.push(`You are a helpful cooking assistant. Generate ${regenerateAll ? '5' : '1'} delicious meal recipe(s).

      **USER NOTES – HIGH PRIORITY THEME:**
      ${generalNotes
        ? `The user has specified: "${generalNotes}"
      Treat this as the main theme, flavour profile, or focus for the recipes. Recipes should closely reflect this where it makes sense, but still respect meal type, dietary preferences, and the ingredient usage strategy. If there is a conflict, prioritise safety and dietary constraints first, then ingredient usage strategy, and then user notes.`
        : 'No specific user notes provided. You may choose a suitable theme yourself.'}

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
Do NOT wrap the JSON in code fences or backticks. Use only standard JSON characters.
Ensure all newlines inside strings are escaped as \\n and any quotes inside strings are escaped.
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
    let rawContent = data.choices?.[0]?.message?.content ?? '';

    console.log('Raw AI response:', rawContent.substring(0, 200));

    // Normalize and strip markdown fences/backticks and odd characters
    rawContent = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .replace(/[\u201C\u201D]/g, '"') // smart double quotes
      .replace(/[\u2018\u2019]/g, "'") // smart single quotes
      .replace(/^\uFEFF/, '') // BOM
      .trim();

    // Isolate the first JSON object if extra text surrounds it
    const jsonStartIndex = rawContent.indexOf('{');
    const jsonEndIndex = rawContent.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      rawContent = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    function tryParseJson(s: string) {
      try { return JSON.parse(s); } catch (_) {}
      try { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); } catch (_) {}
      return null;
    }

    let parsed = tryParseJson(rawContent);
    let fallbackToMarkdown = false;

    if (!parsed || !parsed.recipes) {
      console.warn('Primary JSON parse failed. Falling back to markdown parsing.');
      fallbackToMarkdown = true;
    }

    const normalizeDifficulty = (t: string) => {
      const m = (t || '').toLowerCase();
      if (m.includes('easy')) return 'Easy';
      if (m.includes('hard')) return 'Hard';
      return 'Medium';
    };

    const hasRequiredSections = (content: string) => {
      const lower = (content || '').toLowerCase();
      const hasIngr = lower.includes('ingredients needed') || lower.includes('ingredients');
      const hasSteps = lower.includes('simple cooking instructions') || lower.includes('instructions');
      return hasIngr && hasSteps;
    };

    let recipes: any[] = [];

    if (!fallbackToMarkdown) {
      const arr = Array.isArray(parsed.recipes) ? parsed.recipes : [];
      recipes = arr.filter((r: any) => r && r.id && r.title && r.content && hasRequiredSections(r.content))
        .slice(0, 5)
        .map((r: any, index: number) => ({
          id: r.id || `recipe-${Date.now()}-${index}`,
          title: r.title,
          time: r.time || extractTime(r.content || ''),
          difficulty: r.difficulty || normalizeDifficulty(r.content || ''),
          content: r.content,
          calories: typeof r.calories === 'number' ? r.calories : 0,
          protein: typeof r.protein === 'number' ? r.protein : 0,
          fat: typeof r.fat === 'number' ? r.fat : 0,
          carbs: typeof r.carbs === 'number' ? r.carbs : 0,
        }));
    } else {
      const suggestions = data.choices?.[0]?.message?.content ?? '';
      const parts = suggestions.split('##').filter((p: string) => p.trim());
      recipes = parts.slice(0, 5).map((part: string, index: number) => ({
        id: `recipe-${Date.now()}-${index}`,
        title: part.split('\n')[0].trim(),
        time: extractTime(part),
        difficulty: extractDifficulty(part),
        content: '## ' + part,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      })).filter((r: any) => hasRequiredSections(r.content));
    }

    if (recipes.length === 0) {
      console.error('No valid recipes could be parsed. Returning graceful empty payload.');
      return new Response(
        JSON.stringify({ recipes: [], warning: 'AI output could not be parsed. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully prepared ${recipes.length} recipe(s)`);

    if (tweakRecipeId) {
      const recipe = { ...recipes[0], id: tweakRecipeId };
      return new Response(
        JSON.stringify({ recipe, debugPrompt: prompt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ recipes: recipes.slice(0, 5), debugPrompt: prompt }),
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
