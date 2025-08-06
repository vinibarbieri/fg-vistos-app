"use client";

import { useState, useEffect } from "react";
import { ProcessInfo } from "@/components/process-info";
import { VisaApplications } from "@/components/visa-applications";
import { DEFAULT_PROCESS_STEPS, ProcessStep, Person } from "@/types/process";
import { getResponsiblePeople, addPerson, updatePersonName } from "@/lib/responsible";

export default function ResponsiblePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dados mockados para teste
  const responsibleData = {
    name: "João Silva",
    email: "joao.silva@email.com"
  };

  // Usar os passos padrão e modificar alguns para teste
  const processSteps: ProcessStep[] = [
    {
      ...DEFAULT_PROCESS_STEPS[0],
      completed: true
    },
    {
      ...DEFAULT_PROCESS_STEPS[1],
      completed: true
    },
    {
      ...DEFAULT_PROCESS_STEPS[2],
      completed: false
    },
    {
      ...DEFAULT_PROCESS_STEPS[3],
      completed: false
    },
    {
      ...DEFAULT_PROCESS_STEPS[4],
      completed: false
    }
  ];

  // Carregar pessoas do responsável
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const mockResponsibleId = "responsible-123";
        const peopleData = await getResponsiblePeople(mockResponsibleId);
        setPeople(peopleData);
      } catch (error) {
        console.error("Erro ao carregar pessoas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPeople();
  }, []);

  const handleNameChange = (newName: string) => {
    console.log("Nome do responsável alterado para:", newName);
    // Aqui você pode implementar a lógica para salvar no backend
  };

  const handleEditPersonName = async (personId: string, newName: string) => {
    try {
      const success = await updatePersonName(personId, newName);
      if (success) {
        setPeople(prev => 
          prev.map(person => 
            person.id === personId 
              ? { ...person, name: newName }
              : person
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
    }
  };

  const handleFillForm = (personId: string) => {
    console.log("Abrir formulário para pessoa:", personId);
    // Aqui você pode implementar a navegação para o formulário
    // Por exemplo: router.push(`/dashboard/responsible/form/${personId}`);
  };

  const handleAddPerson = async () => {
    try {
      const mockResponsibleId = "responsible-123";
      const newPerson = await addPerson(mockResponsibleId);
      if (newPerson) {
        setPeople(prev => [...prev, newPerson]);
      }
    } catch (error) {
      console.error("Erro ao adicionar pessoa:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Área do visto</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Acompanhe o seu processo</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema da FG Vistos. Acompanhe o progresso do seu processo.
        </p>
      </div>

      {/* Informações do Processo */}
      <ProcessInfo
        responsibleName={responsibleData.name}
        responsibleEmail={responsibleData.email}
        processSteps={processSteps}
        onNameChange={handleNameChange}
      />

      {/* Minhas Aplicações de Visto */}
      <VisaApplications
        people={people}
        onEditName={handleEditPersonName}
        onFillForm={handleFillForm}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
} 