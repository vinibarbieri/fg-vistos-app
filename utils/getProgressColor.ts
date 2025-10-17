export function getProgressColor (status: string) {
   switch (status) {
     case "submetido":
       return "bg-green-500";
     case "em_revisao":
       return "bg-green-500";
     case "aprovado":
       return "bg-green-500";
     default:
       return "bg-primary";
   }
 };