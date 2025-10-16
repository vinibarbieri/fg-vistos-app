export type AttachmentsT = {
    id: string;
    applicant_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
    document_type?: 'passport' | 'other';
}