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
    const { items, mealType, dietaryPreference, optionalIngredients, goingShopping, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for meal suggestions
    const itemsList = items
      .map((item: any) => `- ${item.name} (${item.quantity}) [${item.category}]`)
      .join('\n');

    let promptParts = [`You are a helpful cooking assistant. Based on the following kitchen inventory (as well as other ingredients if user can go shopping), suggest 3 delicious meal ideas.

Available Ingredients:
${itemsList}
`];

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
      promptParts.push('User can go shopping for additional ingredients, dont just use ingredients from the inventory');
      if (budget) {
        promptParts.push(`Budget: €${budget}`);
      }
    } else {
      promptParts.push('User prefers to use only available ingredients');
    }

    promptParts.push(`
For each meal suggestion, provide:
1. Meal name
2. Brief description (1-2 sentences)
3. List of ingredients needed (mark which ones need to be purchased if any)
4. Simple cooking instructions (3-5 steps)
5. Estimated cooking time

Format your response using markdown with ### for headings, ** for bold text, and - for bullet points. Be creative and consider the user's preferences!`);

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
            content: 'You are a creative and helpful cooking assistant. Provide practical, delicious meal suggestions.'
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

    console.log('Successfully generated meal suggestions');

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in meal-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});