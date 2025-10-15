import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo à FG Vistos</h1>
          <p className="text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
