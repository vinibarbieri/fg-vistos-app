export type ProfilesT = {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Funcionario" | "Cliente";
    interview_city: string;
    address: string;
    account_status: boolean;
}