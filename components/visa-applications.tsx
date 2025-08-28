"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit2, Check, X } from "lucide-react";
import { Person } from "@/types/process";

interface VisaApplicationsProps {
  people: Person[];
  onEditName: (personId: string, newName: string) => void;
  onFillForm: (personId: string) => void;
}

interface EditableNameProps {
  person: Person;
  onSave: (newName: string) => void;
}

function EditableName({ person, onSave }: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(person.name);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(person.name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(person.name);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== person.name) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o nome"
          className="h-8 text-sm"
          autoFocus
        />
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="font-medium">{person.name}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function VisaApplications({
  people,
  onEditName,
  onFillForm
}: VisaApplicationsProps) {

  const getStatusText = (progress: number) => {
    if (progress === 0) return "Não iniciado";
    if (progress < 80) return "Em andamento";
    if (progress < 100) return "Quase completo";
    return "Completo";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Minhas Aplicações de Visto
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso dos formulários de cada aplicante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person) => (
              <Card key={person.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Nome editável */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <EditableName
                        person={person}
                        onSave={(newName) => onEditName(person.id, newName)}
                      />
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preenchimento do formulário</span>
                        <span className="font-medium">{person.progress}%</span>
                      </div>
                      <Progress value={person.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(person.progress)}
                      </p>
                    </div>

                    {/* Botão de ação */}
                    <Button
                      onClick={() => onFillForm(person.id)}
                      className="w-full"
                      variant={person.progress === 0 ? "default" : "outline"}
                    >
                      {person.progress === 0 ? "Iniciar Formulário" : "Continuar Formulário"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mensagem quando não há aplicações */}
          {people.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma aplicação encontrada
              </h3>
              <p className="text-muted-foreground">
                Você ainda não possui aplicações de visto registradas no sistema.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 