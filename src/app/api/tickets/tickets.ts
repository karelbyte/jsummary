import type { NextApiRequest, NextApiResponse } from 'next';
import { getJiraTickets, resumirTicketsGeminis } from '@/lib/jiraService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tickets = await getJiraTickets();
    const ticketsConResumen = await resumirTicketsGeminis(tickets);
    res.status(200).json(ticketsConResumen);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
}