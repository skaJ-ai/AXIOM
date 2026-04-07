import type { IdeaStatus } from '@/lib/db/schema';

interface Idea {
  content: string;
  createdAt: string;
  id: string;
  order: number;
  sessionId: string;
  status: IdeaStatus;
}

interface Cluster {
  createdAt: string;
  id: string;
  label: string;
  sessionId: string;
  summary: string | null;
}

interface ClusterWithIdeas extends Cluster {
  ideas: Idea[];
}

export type { Cluster, ClusterWithIdeas, Idea };
