import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Simple test API called');
    return NextResponse.json({
      success: true,
      message: 'Simple test API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in simple test API:', error);
    return NextResponse.json({ 
      error: 'Simple test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
