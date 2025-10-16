import { AttachmentsT } from "./Attachments";
import { OrderT } from "./OrderT";
import { ProfilesT } from "./ProfilesT";

export type ApplicantT = {
    id: string;
    resposible_user_id: ProfilesT["id"];
    order_id: OrderT["id"];
    is_responsible: boolean;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    from_answer: string;
    form_status: string;
    attachment_id: AttachmentsT["id"];
    /**
     * @description Progresso do formulário - Não existe no banco de dados, é calculado no frontend
     */
    progress?: number;
}