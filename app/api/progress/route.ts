import { NextResponse } from 'next/server';
import { updateCardProgress } from '@/lib/db/progress';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

export async function POST(request: Request) {
  try {
    const { cardId, isCorrect } = await request.json();
    
    if (!cardId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const progress = await updateCardProgress(cardId, isCorrect);
    return NextResponse.json({ 
      progress,
      isSampleMode: !isSupabaseConfigured(),
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

