import { ApplicantT } from "./ApplicantT";
import { PlanT } from "./PlanT";
import { UserT } from "./UserT";

export type OrderT = {
  id: string;

  responsible_id: UserT["id"];

  created_at: string;

  applicants_quantity: number;

  plan_id: PlanT["id"];

  payment_status: string;

  payment_details: any;
};
