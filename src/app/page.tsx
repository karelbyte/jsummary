'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/types/ticket';
import { CustomSelect } from '@/components/custom-select';

interface Project {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraUser {
  self: string;
  accountId: string;
  accountType: string;
  emailAddress: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
  locale: string;
  groups: {
    size: number;
    items: any[];
  };
  applicationRoles: {
    size: number;
    items: any[];
  };
  expand: string;
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<JiraUser | null>(null);

  const projectOptions = useMemo(() => 
    projects.map(project => ({
      id: project.id,
      key: project.key,
      name: project.name
    }))
  , [projects]);

  useEffect(() => {
    setMounted(true);
    fetchCurrentUser();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
    setLoading(false);
  };

  const fetchTickets = async (projectKey: string) => {
    setLoading(true);
    try {
      const ticketsRes = await fetch(`/api/tickets?project=${projectKey}`);
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    }
    setLoading(false);
  };

  const fetchCurrentUser = async () => {
    try {
      const userRes = await fetch('/api/user');
      const userData = await userRes.json();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error al cargar el usuario actual:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTickets(selectedProject);
    } else {
      setTickets([]);
    }
  }, [selectedProject]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🧠 IA Resumen de Tickets Jira</h1>
        {currentUser && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <img
              src={currentUser.avatarUrls['32x32']}
              alt={currentUser.displayName}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-medium">{currentUser.displayName}</span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <CustomSelect
          options={projectOptions}
          value={selectedProject}
          onChange={setSelectedProject}
          placeholder="Selecciona un proyecto"
        />
      </div>

      <Button onClick={() => selectedProject && fetchTickets(selectedProject)} disabled={loading || !selectedProject}>
        {loading ? 'Actualizando...' : 'Actualizar Tickets'}
      </Button>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Tickets</h2>
        <div className="grid grid-cols-3 gap-4">
          {tickets.map((ticket, idx) => (
            <Card key={idx} className="bg-zinc-900">
              <CardContent className="p-4">
                <h2 className="text-md  text-zinc-400 font-semibold">{ticket.key} - {ticket.summary}</h2>
                <p className="text-sm text-zinc-400">{ticket.status} • {ticket.priority}</p>
                <p className="mt-2 text-lg  text-zinc-300">Resumen IA: {ticket.resumen}</p>
              </CardContent>
            </Card>
          ))}
          {selectedProject && tickets.length === 0 && !loading && (
            <p className="text-zinc-400">No hay tickets disponibles para este proyecto.</p>
          )}
        </div>
      </div>
    </main>
  );
}
