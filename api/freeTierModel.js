export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: { message: 'Method not allowed' } }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the request body
    const requestData = await req.json();
    
    // Validate the request
    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return new Response(
        JSON.stringify({ error: { message: 'Invalid request: messages array is required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the model is the free tier model
    if (requestData.model !== 'google/gemini-2.0-flash-lite-001-free') {
      return new Response(
        JSON.stringify({ error: { message: 'Invalid model: only free tier model is supported' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'Server configuration error: API key not found' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward the request to OpenRouter with our API key
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.get('referer') || 'https://f1-race-strategy-simulator.vercel.app/',
        'X-Title': 'F1 Race Strategy Simulator'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001', // Use the actual model ID without the -free suffix
        messages: requestData.messages,
        max_tokens: requestData.max_tokens || 1024
      })
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      return new Response(
        JSON.stringify({ error: { message: `OpenRouter API error: ${errorData.error?.message || 'Unknown error'}` } }),
        { status: openRouterResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the OpenRouter response
    const data = await openRouterResponse.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in free tier model API:', error);
    return new Response(
      JSON.stringify({ error: { message: `Server error: ${error.message}` } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
