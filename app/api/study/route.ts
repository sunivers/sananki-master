import { NextResponse } from 'next/server';
import { generateTodaySession } from '@/lib/study/scheduler';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const additional = searchParams.get('additional') === 'true';
    
    const sessionData = await generateTodaySession(additional);
    
    return NextResponse.json({ 
      cards: sessionData.cards,
      currentIndex: sessionData.currentIndex,
      totalCards: sessionData.totalCards,
      completedCards: sessionData.completedCards,
      isAdditionalStudy: additional,
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

export async function POST(request: Request) {
  try {
    const { additional } = await request.json();
    const isAdditionalStudy = additional === true;
    
    const sessionData = await generateTodaySession(isAdditionalStudy);
    
    return NextResponse.json({ 
      cards: sessionData.cards,
      currentIndex: sessionData.currentIndex,
      totalCards: sessionData.totalCards,
      completedCards: sessionData.completedCards,
      isAdditionalStudy: isAdditionalStudy,
      isSampleMode: !isSupabaseConfigured(),
    });
  } catch (error) {
    console.error('Error generating additional study session:', error);
    return NextResponse.json(
      { error: 'Failed to generate additional study session' },
      { status: 500 }
    );
  }
}

