import { AuthGuard } from "@/components/authGuard/authGuard";

export default function DashboardPage() {
  return <AuthGuard />;
}