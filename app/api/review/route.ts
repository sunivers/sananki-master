import { NextResponse } from 'next/server';
import { getReviewCards } from '@/lib/db/cards';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

export async function GET() {
  try {
    const cards = await getReviewCards();
    return NextResponse.json({ 
      cards,
      isSampleMode: !isSupabaseConfigured(),
    });
  } catch (error) {
    console.error('Error fetching review cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review cards' },
      { status: 500 }
    );
  }
}

