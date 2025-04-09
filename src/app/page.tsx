'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/types/ticket';

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    const res = await fetch('/api/tickets');
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 Resumen de Tickets Jira</h1>
      <Button onClick={fetchSummaries} disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar Resumen'}
      </Button>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {tickets.map((ticket, idx) => (
          <Card key={idx} className="bg-zinc-900">
            <CardContent className="p-4">
              <h2 className="text-md text-zinc-300 font-semibold">{ticket.key} - {ticket.summary}</h2>
              <p className="text-zinc-400">{ticket.status} • {ticket.priority}</p>
              <p className="mt-2 text-lg text-white ">Resumen IA: {ticket.resumen}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}