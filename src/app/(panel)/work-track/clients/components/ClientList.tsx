import Link from 'next/link';

interface ClientListProps {
  clients: Client[];
}

const ClientList = ({ clients }: ClientListProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/work-track/clients/${client.id}`}
          className="p-5 font-semibold bg-accent rounded-lg border hover:border-green-200 hover:bg-green-200/20  dark:hover:bg-green-200/10 dark:hover:border-green-200/20"
        >
          {client.name}
          <span className="block text-gray-600 dark:text-gray-300 text-sm mt-2">
            {client.description}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ClientList;
