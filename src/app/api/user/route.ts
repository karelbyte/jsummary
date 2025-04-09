import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jiraService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error al obtener el usuario actual' },
      { status: 500 }
    );
  }
} 