import { ClienteDashboard } from "@/components/pages/cliente/clienteDashboard";

interface ClientePageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function ClientePage({ searchParams }: ClientePageProps) {
  const params = await searchParams;
  const clientId = params?.clientId;

  return <ClienteDashboard clientId={clientId} />;
}