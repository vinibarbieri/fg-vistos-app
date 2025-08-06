import { VisaTypeT } from "./VisaTypeT";

export type PlanT = {
    id: string;
    plan_name: string;
    description: string;
    price: number;
    active: boolean;
    visa_type_id: VisaTypeT["id"];
}