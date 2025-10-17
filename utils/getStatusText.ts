export function getStatusText(status: string) {
   switch (status) {
     case "nao_iniciado":
       return "Não iniciado";
     case "em_preenchimento":
       return "Em andamento";
     case "submetido":
       return "Submetido - Aguarde a revisão";
     case "em_revisao":
       return "Em revisão";
     case "aprovado":
       return "Aprovado";
     case "rejeitado":
       return "Rejeitado";
     default:
       return "Desconhecido";
   }
 };