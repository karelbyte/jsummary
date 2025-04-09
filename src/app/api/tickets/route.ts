import { NextResponse } from 'next/server';
import { getJiraTickets, resumirTicketsGeminis } from '@/lib/jiraService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectKey = searchParams.get('project');
    
    const tickets = await getJiraTickets(projectKey || undefined);

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