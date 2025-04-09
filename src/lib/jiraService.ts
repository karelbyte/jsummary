import { Ticket } from '@/types/ticket';
import axios from 'axios';
import { OpenAI } from 'openai';
const openaiApiKey = process.env.OPENAI_API_KEY!;
const jiraBaseUrl = process.env.JIRA_BASE_URL!;
const jiraApiToken = process.env.JIRA_API_TOKEN!;
const jiraEmail = process.env.JIRA_EMAIL!;

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
    };
    priority?: {
      name: string;
    };
  };
}

interface JiraProject {
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

export async function getJiraProjects(): Promise<JiraProject[]> {
  try {
    const response = await axios.get(`${jiraBaseUrl}/rest/api/3/project`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos de Jira:', error);
    return [];
  }
}

export async function getJiraTickets(projectKey?: string): Promise<Ticket[]> {
  if (!projectKey) {
    return [];
  }

  const jql = `project = "${projectKey}" AND assignee = currentUser() AND status != Done ORDER BY priority DESC`;
  const response = await axios.get(`${jiraBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
      Accept: 'application/json',
    },
  });

  return response.data.issues.map((issue: JiraIssue) => ({
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || 'Sin prioridad',
    resumen: issue.fields.description || 'Sin descripción',
  }));
}

const API_KEY = process.env.GEMINI_API_KEY;

const geminiAPI = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGeminiSummary = async (text: string) => {
  try {
    const response = await geminiAPI.post(`?key=${API_KEY}`, {
      contents: [
        {
          parts: [
            { text: text },
          ],
        },
      ],
    });
    const summary = response.data.candidates[0]?.content;

    if (!summary) {
      throw new Error('No se pudo obtener el resumen.');
    }

    return summary;
  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);
    throw new Error('No se pudo obtener el resumen.');
  }
};

export async function resumirTicketsGeminis(tickets: any[]) {
  const resúmenes = await Promise.all(
    tickets.map(async (ticket) => {
      try {
        const prompt = `Resumen breve del ticket Jira:\nTítulo: ${ticket.summary}\nDescripción: ${ticket.description}`;
        const completion = await getGeminiSummary(prompt);
        return {
          ...ticket,
          resumen: completion.parts[0].text,
        };
      } catch (error) {
        console.error(`Error al obtener el resumen del ticket ${ticket.id}:`, error);
        return { ...ticket, resumen: null, error: true };
      }
    })
  );
  
  const resumes = resúmenes.filter(item => !item.error);
  return resumes
}

export async function resumirTicketsOpenIA(tickets: Ticket[]): Promise<Ticket[]> {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const resúmenes = await Promise.all(
    tickets.map(async (ticket) => {
      const prompt = `Resumen breve del ticket Jira:\nTítulo: ${ticket.summary}\nDescripción: ${ticket.resumen}`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        ...ticket,
        resumen: completion.choices[0].message.content || '',
      };
    })
  );

  return resúmenes;
}

export async function resumirTickets(tickets: Ticket[]): Promise<Ticket[]> {
  return tickets;
}

export async function getCurrentUser(): Promise<JiraUser | null> {
  try {
    const response = await axios.get(`${jiraBaseUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario actual de Jira:', error);
    return null;
  }
} 