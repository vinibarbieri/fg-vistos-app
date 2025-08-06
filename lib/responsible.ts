import { Person } from "@/types/process";

// ============================================================================
// FUNÇÕES DO BACKEND - DESATIVADAS POR ENQUANTO
// ============================================================================

/*
// Buscar pessoas do responsável
export async function getResponsiblePeople(responsibleId: string): Promise<Person[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('responsible_id', responsibleId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar pessoas:', error);
    return [];
  }
  
  return data || [];
}

// Adicionar nova pessoa
export async function addPerson(responsibleId: string): Promise<Person | null> {
  const supabase = await createClient();
  
  // Contar pessoas existentes para gerar nome padrão
  const { count } = await supabase
    .from('people')
    .select('*', { count: 'exact', head: true })
    .eq('responsible_id', responsibleId);
    
  const personNumber = (count || 0) + 1;
  const defaultName = `Pessoa ${personNumber}`;
  
  const { data, error } = await supabase
    .from('people')
    .insert({
      responsible_id: responsibleId,
      name: defaultName,
      progress: 0,
      status: 'not_started'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao adicionar pessoa:', error);
    return null;
  }
  
  return data;
}

// Atualizar nome da pessoa
export async function updatePersonName(personId: string, newName: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('people')
    .update({
      name: newName,
      updated_at: new Date().toISOString()
    })
    .eq('id', personId);
    
  if (error) {
    console.error('Erro ao atualizar nome:', error);
    return false;
  }
  
  return true;
}

// Atualizar progresso da pessoa
export async function updatePersonProgress(personId: string, progress: number): Promise<boolean> {
  const supabase = await createClient();
  
  const status = progress === 0 ? 'not_started' : 
                 progress < 100 ? 'in_progress' : 'completed';
  
  const { error } = await supabase
    .from('people')
    .update({
      progress,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', personId);
    
  if (error) {
    console.error('Erro ao atualizar progresso:', error);
    return false;
  }
  
  return true;
}
*/

// ============================================================================
// DADOS MOCKADOS PARA TESTE DO FRONTEND
// ============================================================================

// Dados mockados das pessoas
let mockPeople: Person[] = [
  {
    id: "person-1",
    name: "Pessoa 1",
    progress: 80,
    status: "in_progress",
    formData: {},
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T14:30:00Z"
  },
  {
    id: "person-2",
    name: "Pessoa 2",
    progress: 40,
    status: "in_progress",
    formData: {},
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T15:00:00Z"
  },
  {
    id: "person-3",
    name: "Pessoa 3",
    progress: 0,
    status: "not_started",
    formData: {},
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-15T12:00:00Z"
  }
];

// Funções mockadas que simulam o comportamento do backend
export async function getResponsiblePeople(responsibleId: string): Promise<Person[]> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Retornar dados mockados
  return mockPeople;
}

export async function addPerson(responsibleId: string): Promise<Person | null> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Gerar novo ID e nome
  const personNumber = mockPeople.length + 1;
  const newPerson: Person = {
    id: `person-${Date.now()}`,
    name: `Pessoa ${personNumber}`,
    progress: 0,
    status: "not_started",
    formData: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Adicionar à lista mockada
  mockPeople.push(newPerson);
  
  console.log(`[MOCK] Nova pessoa adicionada: ${newPerson.name}`);
  return newPerson;
}

export async function updatePersonName(personId: string, newName: string): Promise<boolean> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Encontrar e atualizar pessoa
  const personIndex = mockPeople.findIndex(p => p.id === personId);
  if (personIndex === -1) return false;
  
  mockPeople[personIndex] = {
    ...mockPeople[personIndex],
    name: newName,
    updated_at: new Date().toISOString()
  };
  
  console.log(`[MOCK] Nome atualizado para: ${newName}`);
  return true;
}

export async function updatePersonProgress(personId: string, progress: number): Promise<boolean> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Encontrar e atualizar pessoa
  const personIndex = mockPeople.findIndex(p => p.id === personId);
  if (personIndex === -1) return false;
  
  const status = progress === 0 ? 'not_started' : 
                 progress < 100 ? 'in_progress' : 'completed';
  
  mockPeople[personIndex] = {
    ...mockPeople[personIndex],
    progress,
    status,
    updated_at: new Date().toISOString()
  };
  
  console.log(`[MOCK] Progresso atualizado para: ${progress}%`);
  return true;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Gerar nome padrão para nova pessoa
export function generateDefaultName(people: Person[]): string {
  const personNumber = people.length + 1;
  return `Pessoa ${personNumber}`;
}

// Verificar se nome já existe
export function isNameTaken(people: Person[], name: string, excludeId?: string): boolean {
  return people.some(person => 
    person.name.toLowerCase() === name.toLowerCase() && 
    person.id !== excludeId
  );
}

// Calcular progresso médio de todas as pessoas
export function calculateAverageProgress(people: Person[]): number {
  if (people.length === 0) return 0;
  
  const totalProgress = people.reduce((sum, person) => sum + person.progress, 0);
  return Math.round(totalProgress / people.length);
} 