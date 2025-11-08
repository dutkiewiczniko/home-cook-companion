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

    if (tweakRecipeId && tweakPrompt) {
      // Tweaking a specific recipe
      const recipeToTweak = currentRecipes.find((r: any) => r.id === tweakRecipeId);
      promptParts.push(`You are a helpful cooking assistant. The user wants to modify this recipe:\n\n${recipeToTweak.content}\n\nUser's request: ${tweakPrompt}\n\nProvide a modified version of the recipe based on the user's request.`);
    } else {
      // Generating new recipes
      promptParts.push(`You are a helpful cooking assistant. Based on the following kitchen inventory, suggest ${regenerateAll ? '5' : '1'} delicious meal idea(s).

Available Ingredients:
${itemsList}

Cooking for: ${cookingFor} ${cookingFor === 1 ? 'person' : 'people'}`);

      if (generalNotes) {
        promptParts.push(`General Notes: ${generalNotes}`);
      }
      
      if (mealType) {
        promptParts.push(`Meal Type: ${mealType}`);
      }
      
      if (dietaryPreference) {
        promptParts.push(`Dietary Preference: ${dietaryPreference}`);
      }
      
      if (optionalIngredients) {
        promptParts.push(`Optional ingredients to try: ${optionalIngredients}`);
      }
      
      if (goingShopping) {
        promptParts.push('User can go shopping for additional ingredients');
        if (budget) {
          promptParts.push(`Budget: €${budget}`);
        }
      } else {
        promptParts.push('User prefers to use only available ingredients');
      }
    }

    promptParts.push(`
For each meal suggestion, provide:
1. Meal name (as a ## heading)
2. Time estimate (e.g., "30 minutes")
3. Difficulty level (Easy/Medium/Hard)
4. Brief description (1-2 sentences)
5. List of ingredients needed (mark which ones need to be purchased if any)
6. Simple cooking instructions (3-5 steps)

Format your response using markdown with ## for meal names, **bold** for section headings, and - for bullet points.`);

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
            content: 'You are a creative and helpful cooking assistant. Provide practical, delicious meal suggestions based on available ingredients.'
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
    const suggestions = data.choices[0].message.content;

    // Parse the response into individual recipes
    const recipeParts = suggestions.split('##').filter((part: string) => part.trim());
    
    if (tweakRecipeId) {
      // Return single tweaked recipe
      const recipe = {
        id: tweakRecipeId,
        title: recipeParts[0]?.split('\n')[0]?.trim() || 'Modified Recipe',
        time: extractTime(recipeParts[0] || ''),
        difficulty: extractDifficulty(recipeParts[0] || ''),
        content: '## ' + recipeParts[0],
      };
      
      return new Response(
        JSON.stringify({ recipe }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipes = recipeParts.slice(0, 5).map((part: string, index: number) => ({
      id: `recipe-${Date.now()}-${index}`,
      title: part.split('\n')[0].trim(),
      time: extractTime(part),
      difficulty: extractDifficulty(part),
      content: '## ' + part,
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
