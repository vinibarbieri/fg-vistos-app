import { AttachmentsT } from "./Attachments";
import { OrderT } from "./OrderT";
import { UserT } from "./ProfilesT";

export type ApplicantT = {
    id: string;
    resposible_user_id: UserT["id"];
    order_id: OrderT["id"];
    is_responsible: boolean;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    from_answer: string;
    form_status: string;
    attachment_id: AttachmentsT["id"];
}