import Link from 'next/link';
interface ClientListProps {
  clients: Client[];
}

const ClientList = ({ clients }: ClientListProps) => {
  return (
    <>
      {/* list */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {clients.length === 0 ? (
          <div className="col-span-3 w-full p-3 rounded border-dashed border">
            <p className=" text-center py-4 text-xs font-semibold">Henüz hiç kayıt yok</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
};

export default ClientList;
