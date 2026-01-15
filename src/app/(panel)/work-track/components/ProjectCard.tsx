import formatPaymentStatus from '@/helpers/formatPaymentStatus';
import { getDeadlineStatus } from '@/helpers/getDeadLineStatus';
import { BadgeTurkishLira, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const paymentStatus = formatPaymentStatus(project.paymentStatus);
  const deadLineStatus = getDeadlineStatus(project.endDate);
  return (
    <Link
      href={`/work-track/clients/${project.client?.id}/works/${project.id}`}
      className="col-span-1 border rounded-lg px-4 py-3 bg-green-200/10 hover:bg-green-200/30 hover:border-green-300 dark:hover:bg-green-200/10 dark:hover:border-green-100/50 transition-all duration-150 flex flex-col justify-between items-baseline-last gap-3 w-full"
    >
      <div>
        <h6 className="text-base font-semibold">{project.name}</h6>
        <p className="text-sm my-2 text-slate-500 dark:text-slate-100 line-clamp-2 ">
          {project.description}
        </p>
      </div>
      <div className="flex items-center justify-between w-full">
        <span
          className={
            paymentStatus.className +
            ' text-xs flex items-center justify-center gap-2 py-1 px-2 rounded-lg font-semibold'
          }
        >
          <BadgeTurkishLira size={16} />
          {paymentStatus.label}
        </span>
        <span
          className={
            deadLineStatus.className +
            ' text-xs flex items-center justify-center gap-2 py-1 px-2 rounded-lg font-semibold'
          }
        >
          <CalendarClock size={16} />
          {deadLineStatus.label}
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
