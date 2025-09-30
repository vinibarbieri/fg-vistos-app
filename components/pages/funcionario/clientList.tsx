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
import { apiService } from "@/lib/api-service";
import { ProfilesT } from "@/types/ProfilesT";

// Tipo estendido para incluir dados relacionados
type ClientDetails = ProfilesT & {
  status_processo?: string;
  applicants_quantity?: number;
  plan_name?: string;
  visa_name?: string;
  country?: string;
};


export function ClientList() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    statusCliente: true,
    statusProcesso: "",
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

      // Buscar todos os clientes
      const clientesResponse = await apiService.getClientes();
      if (clientesResponse.error) throw new Error(clientesResponse.error);

      // Combinar dados dos usuários com seus candidatos e pedidos
      const clientsDetails: ClientDetails[] = await Promise.all(clientesResponse.data?.map(async (profile) => {

        // status_processo
        const userProcessoStatus = await apiService.getApplicantStatusByResponsibleUserId(profile.id);
        if (userProcessoStatus.error) {
          console.warn(`Erro ao buscar status do processo para usuário ${profile.id}:`, userProcessoStatus.error);
        }
        const status_processo = userProcessoStatus.data || "Não informado";

        // applicants_quantity, plan_id
        const userOrderDetails = await apiService.getUserOrderDetails(profile.id);
        if (userOrderDetails.error) {
          console.warn(`Erro ao buscar detalhes do pedido para usuário ${profile.id}:`, userOrderDetails.error);
        }
        const applicants_quantity = userOrderDetails.data?.applicants_quantity || 0;
        const plan_id = userOrderDetails.data?.plan_id || "Não informado";

        // plan_name, visa_id
        let plan_name = "Não informado";
        let visa_name = "Não informado";
        let country = "Não informado";
        
        if (plan_id) {
          const userPlanDetails = await apiService.getPlanNameAndVisaId(plan_id);
          if (userPlanDetails.error) {
            console.warn(`Erro ao buscar detalhes do plano ${plan_id}:`, userPlanDetails.error);
          } else {
            plan_name = userPlanDetails.data?.plan_name || "Não informado";
            const visa_id = userPlanDetails.data?.visa_id;
            
            if (visa_id) {
              const userVisaDetails = await apiService.getVisaNameAndCountry(visa_id);
              if (userVisaDetails.error) {
                console.warn(`Erro ao buscar detalhes do visto ${visa_id}:`, userVisaDetails.error);
              } else {
                visa_name = userVisaDetails.data?.name || "Não informado";
                country = userVisaDetails.data?.country || "Não informado";
              }
            }
          }
        }

        return {
          ...profile,
          status_processo,
          applicants_quantity,
          plan_name,
          visa_name,
          country,
          // Adicionar campos que podem não existir no Profile
          interview_city: profile.interview_city || "Não informada",
          account_status: profile.account_status || false,
        };
      }) || []);

      setClients(clientsDetails);
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

    const matchesStatus = !filters.statusCliente || 
      client.account_status === filters.statusCliente;

    const matchesCity = !filters.city ||
      client.interview_city?.toLowerCase().includes(filters.city.toLowerCase());

    const matchesVisaType = !filters.visaType ||
      client.visa_name?.toLowerCase().includes(filters.visaType.toLowerCase());

    const matchesCountry = !filters.country ||
      client.country?.toLowerCase().includes(filters.country.toLowerCase());

    return matchesSearch && matchesStatus && matchesCity && matchesVisaType && matchesCountry;
  });

  const handleClientClick = (clientId: string) => {
    router.push(`/protected/user?clientId=${clientId}`);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "em_andamento":
        return "secondary";
      case "submetido":
        return "secondary";
      case "em_revisao":
        return "secondary";
      case "aprovado":
        return "default";
      case "rejeitado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "em_andamento":
        return "Em Andamento";
      case "submetido":
        return "Submetido";
      case "em_revisao":
        return "Em Revisão";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Desconhecido";
    }
  };
  
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
              placeholder="Digite o nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="statusProcesso">Status do Processo</Label>
              <select
                id="statusProcesso"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.statusProcesso}
                onChange={(e) => setFilters(prev => ({ ...prev, statusProcesso: e.target.value }))}
              >
                <option value="">Todos os status</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="submetido">Submetido</option>
                <option value="em_revisao">Em Revisão</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
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
                {clients.map((client) => (
                  client.visa_name !== "Não informado" && (
                  <option key={client.visa_name} value={client.visa_name}>
                    {client.visa_name}
                  </option>
                  )
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <select
                id="country"
                className="w-full bg-white p-2 border rounded-md mt-1"
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              >
                <option value="">Todos os países</option>
                {clients.map((client) => (
                  client.country !== "Não informado" && (
                    <option key={client.country} value={client.country}>
                      {client.country}
                    </option>
                  )
                ))}
              </select>
            </div>

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
              setFilters({ statusCliente: true, statusProcesso: "", visaType: "", country: "", city: "" });
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
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
                  <div className="mr-4 self-center flex flex-col items-end">
                    <span className="text-sm text-muted-foreground mb-1">Status do processo</span>
                    <Badge variant={getStatusColor(client.status_processo)}>
                      {getStatusText(client.status_processo)}
                    </Badge>
                  </div>
                </div>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cidade:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.interview_city}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">País:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.country}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tipo de Visto:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.visa_name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Aplicantes:</span>
                      <span className="text-sm text-muted-foreground">
                        {client.applicants_quantity}
                      </span>
                    </div>

                    <div className="pt-2 border-t">
                      <Button variant="outline" className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
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
