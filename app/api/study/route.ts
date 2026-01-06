import { NextResponse } from 'next/server';
import { generateTodaySession } from '@/lib/study/scheduler';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

export async function GET() {
  try {
    const cards = await generateTodaySession();
    return NextResponse.json({ 
      cards,
      isSampleMode: !isSupabaseConfigured(),
    });
  } catch (error) {
    console.error('Error generating study session:', error);
    return NextResponse.json(
      { error: 'Failed to generate study session' },
      { status: 500 }
    );
  }
}

