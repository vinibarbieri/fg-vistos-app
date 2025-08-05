import { FormQuestionsT } from "./FormQuestionsT";

export type VisaTypeT = {
    id: string;
    form_questions_id: FormQuestionsT["id"];
    name: string;
    country: string;
    visa_type: string;
    active: boolean;
}