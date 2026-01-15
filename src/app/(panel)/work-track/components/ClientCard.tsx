import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import ProjectCard from './ProjectCard';

interface ClientWithProjects extends Client {
  projects: Project[];
}

interface ClientCardProps {
  client: ClientWithProjects;
  showDetailLink?: boolean;
}

const ClientCard = ({ client, showDetailLink = true }: ClientCardProps) => {
  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="text-base">{client.name}</CardTitle>
        {showDetailLink && (
          <CardAction>
            <Link
              href={`/work-track/clients/${client.id}`}
              className="text-xs flex items-center justify-end gap-1 font-semibold"
            >
              <Eye size={12} />
              Detay
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
        {client.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ClientCard;
