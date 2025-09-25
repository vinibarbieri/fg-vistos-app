import { ApplicantT } from "./ApplicantT";
import { PlanT } from "./PlanT";
import { ProfilesT } from "./ProfilesT";

export type OrderT = {
  id: string;

  responsible_user_id: ProfilesT["id"];

  created_at: string;

  applicants_quantity: number;

  plan_id: PlanT["id"];

  payment_status: string;

  payment_details: any;
};
