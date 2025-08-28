import { AuthGuard } from "@/components/auth-guard";

export default function DashboardPage() {
  return <AuthGuard />;
}
