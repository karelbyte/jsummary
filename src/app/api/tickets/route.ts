import { NextResponse } from 'next/server';
import { getJiraTickets, resumirTicketsGeminis } from '@/lib/jiraService';

export async function GET() {
  try {
    const tickets = await getJiraTickets();
    const ticketsConResumen = await resumirTicketsGeminis(tickets);
    return NextResponse.json(ticketsConResumen);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error al obtener los tickets' },
      { status: 500 }
    );
  }
} 