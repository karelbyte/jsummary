import { NextResponse } from 'next/server';
import { getJiraProjects } from '@/lib/jiraService';

export async function GET() {
  try {
    const projects = await getJiraProjects();
    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error al obtener los proyectos' },
      { status: 500 }
    );
  }
} 