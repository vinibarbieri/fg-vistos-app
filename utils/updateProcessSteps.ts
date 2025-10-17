import { DEFAULT_PROCESS_STEPS } from "@/types/process";

  // Atualizar passos do processo baseado no status
  export function updateProcessSteps(status: string) {
   const newSteps = [...DEFAULT_PROCESS_STEPS];
   
   newSteps.forEach(step => step.completed = false);
   
   switch (status) {
     case 'rejeitado':
       newSteps.forEach(step => step.completed = true);
       break;
     case 'aprovado':
       newSteps.forEach(step => step.completed = true);
       break;
     case 'entrevista':
       newSteps.slice(0, 4).forEach(step => step.completed = true);
       break;
     case 'documentos_em_analise':
       newSteps.slice(0, 3).forEach(step => step.completed = true);
       break;
     case 'documentos_enviados':
       newSteps.slice(0, 2).forEach(step => step.completed = true);
       break;
     case 'pago':
       newSteps.slice(0, 1).forEach(step => step.completed = true);
       break;
     case 'pendente':
       break;
   }
   
   return (newSteps);
 };