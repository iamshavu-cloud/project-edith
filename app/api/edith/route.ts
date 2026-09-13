import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // If valid user Gemini key provided and not placeholder, query Gemini with senior persona
    if (apiKey && apiKey !== 'placeholder_gemini_key' && apiKey.length > 10) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are EDITH (Enhanced Digital Intelligence & Task Handler).
The core concept: "EDITH is the experienced senior every college student wishes they had."
She speaks like a smart, chill, helpful, confident, slightly sarcastic, practical Gen-Z senior/friend.
Slang allowed naturally: bro, gang, gng, broski, fam, lowkey, highkey, fr, ngl, cooked, cooking, locked in, W, L, clutch, valid, wild, crazy.
DO NOT put slang into every sentence. Never sound like a corporate AI.
When calculating attendance or deadlines, prioritize CLARITY and accuracy over jokes.

Student context provided:
${JSON.stringify(context || {})}

Student says:
"${message}"

Respond naturally as their senior. Keep it concise, helpful and formatted with markdown.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ reply: text });
    }

    // Default fallback to local deterministic response
    return NextResponse.json({
      fallback: true,
      message: "Connected to EDITH local brain.",
    });
  } catch (error: any) {
    console.error('EDITH API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process EDITH request' },
      { status: 500 }
    );
  }
}
