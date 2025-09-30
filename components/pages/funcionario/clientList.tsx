"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiService, VisaType } from "@/lib/api-service";
import { ProfilesT } from "@/types/ProfilesT";
import { OrderT } from "@/types/OrderT";
import { ApplicantT } from "@/types/ApplicantT";

// Tipo estendido para incluir dados relacionados
type ClientWithDetails = ProfilesT & {
  applicants?: ApplicantT[];
  orders?: OrderT[];
};


export function ClientList() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [order, setOrder] = useState<OrderT[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    visaType: "",
    country: "",
    city: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Buscar todos os perfis (usuários)
      const profilesResponse = await apiService.getProfiles();
      if (profilesResponse.error) throw new Error(profilesResponse.error);

      // Buscar tipos de visto
      const visaTypesResponse = await apiService.getVisaTypes();
      if (visaTypesResponse.data) {
        setVisaTypes(visaTypesResponse.data);
      }

      // Buscar candidatos para cada usuário
      const applicantsResponse = await apiService.getApplicants();
      if (applicantsResponse.error) throw new Error(applicantsResponse.error);

      // Buscar pedidos para cada usuário
      const ordersResponse = await apiService.getOrders();
      if (ordersResponse.error) throw new Error(ordersResponse.error);

      // Combinar dados dos usuários com seus candidatos e pedidos
      const clientsWithDetails: ClientWithDetails[] = profilesResponse.data?.map((profile) => {
        const userApplicants = applicantsResponse.data?.filter(
          (applicant) => applicant.order_details?.responsible_user_email === profile.email
        ) || [];

        const userOrders = ordersResponse.data?.filter(
          (order) => order.user_email === profile.email
        ) || [];

        return {
          ...profile,
          applicants: userApplicants as unknown as ApplicantT[],
          orders: userOrders as unknown as OrderT[],
          // Adicionar campos que podem não existir no Profile
          interview_city: profile.interview_city || "Não informada",
          address: profile.address || "Não informado",
          account_status: profile.account_status || "active",
        };
      }) || [];

      setClients(clientsWithDetails);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar clientes baseado nos filtros e termo de busca
  const filteredClients = clients.filter((client) => {
    const clientName = `${client.name || ''}`.trim();
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || 
      client.account_status?.toLowerCase() === filters.status.toLowerCase();

    // orders.responsible_user_id === client.id && orders.plan_id === plans.id -> plans.plan_name === filters.visaType
    // const matchesVisaType = !filters.visaType || (() => {
    //   order?.some(order => order.responsible_user_id?.includes(client.id) && order.plan_name?.includes(filters.visaType));
    // })();

    // const matchesCountry = !filters.country ||
    //   client.orders?.some(order => {
    //     const visaType = visaTypes.find(vt => vt.name === order.plan_name);
    //     return visaType?.country === filters.country;
    //   });

    const matchesCity = !filters.city ||
      client.interview_city?.toLowerCase().includes(filters.city.toLowerCase());

    return matchesSearch && matchesStatus && matchesCity;
  });

  const handleClientClick = (clientId: string) => {
    router.push(`/protected/user?clientId=${clientId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      case "processing":
        return "Processando";
      default:
        return "Desconhecido";
    }
  };

  // Obter países únicos dos tipos de visto
  // const uniqueCountries = [...new Set(visaTypes.map(vt => vt.country))].filter(Boolean);
  
  // Obter cidades únicas dos clientes
  const uniqueCities = [...new Set(clients.map(c => c.interview_city))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Lista de Clientes</h2>
        <div className="text-sm text-muted-foreground">
          {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de busca */}
          <div>
            <Label htmlFor="search">Buscar por nome ou email</Label>
            <Input
              id="search"
              placeholder="Digite o nome ou email do responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>

            <div>
              <Label htmlFor="visaType">Tipo de Visto</Label>
              <select
                id="visaType"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.visaType}
                onChange={(e) => setFilters(prev => ({ ...prev, visaType: e.target.value }))}
              >
                <option value="">Todos os tipos</option>
                {visaTypes.map((visaType) => (
                  <option key={visaType.id} value={visaType.name}>
                    {visaType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <Label htmlFor="country">País</Label>
              <select
                id="country"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              >
                <option value="">Todos os países</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div> */}

            <div>
              <Label htmlFor="city">Cidade da Entrevista</Label>
              <select
                id="city"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              >
                <option value="">Todas as cidades</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão para limpar filtros */}
          <Button
            variant="outline"
            className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            onClick={() => {
              setSearchTerm("");
              setFilters({ status: "", visaType: "", country: "", city: "" });
            }}
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {clients.length === 0 
                  ? "Nenhum cliente encontrado" 
                  : "Nenhum cliente corresponde aos filtros aplicados"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card 
                key={client.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleClientClick(client.id)}
              >
                <div className="flex justify-between">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {`${client.name || ''}`.trim() || 'Nome não informado'}
                    </CardTitle>
                    <CardDescription>{client.email}</CardDescription>
                  </CardHeader>
                  <Badge variant={client.account_status === "active" ? "default" : "secondary"} className="mr-4 self-center">
                          {client.account_status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cidade:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.interview_city || "Não informada"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tipo de Visto:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.orders && client.orders.length > 0 
                          ? client.orders.map(order => {
                              const plan = visaTypes.find(vt => vt.id === order.plan_id);
                              return plan ? plan.name : "Plano não encontrado";
                            }).join(", ")
                          : "Não informado"
                        }
                      </span>
                    </div>

                    {/* {client.applicants && client.applicants.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Candidatos:</span>
                        {client.applicants.map((applicant) => (
                          <div key={applicant.id} className="flex justify-between text-sm">
                            <span>{applicant.name}</span>
                            <Badge className={getStatusColor(applicant.status)}>
                              {getStatusText(applicant.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )} */}

                    {/* {client.orders && client.orders.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Pedidos:</span>
                        {client.orders.map((order) => (
                          <div key={order.id} className="text-sm">
                            <div className="flex justify-between">
                              <span>{order.plan_name}</span>
                              <Badge variant="outline">
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )} */}

                    <div className="pt-2 border-t">
                      <Button variant="outline" size="sm" className="w-full bg-primary text-primary-foreground">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
