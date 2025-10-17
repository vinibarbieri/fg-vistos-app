import { AttachmentsT } from "./AttachmentsT";
import { OrderT } from "./OrderT";
import { ProfilesT } from "./ProfilesT";

export type ApplicantT = {
    id: string;
    responsible_user_id: ProfilesT["id"];
    order_id: OrderT["id"];
    is_responsible: boolean;
    name: string;
    created_at: string;
    updated_at: string;
    form_answer: string;
    attachment_id: AttachmentsT["id"];
    status: string;
    form_status: string;
    /**
     * @description Progresso do formulário - Não existe no banco de dados, é calculado no frontend
     */
    progress?: number;
}