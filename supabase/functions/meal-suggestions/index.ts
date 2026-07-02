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
    const goingShopping = Boolean((body as any).goingShopping);
    const budgetRaw = Number((body as any).budget);
    const budget = Number.isFinite(budgetRaw) && budgetRaw >= 0 && budgetRaw <= 100000 ? budgetRaw : '';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for meal suggestions
    const itemsList = items
      .map((item) => `- ${item.name} (${item.quantity}) [${item.category}]`)
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
