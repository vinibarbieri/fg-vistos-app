"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit2, Check, X, Loader2, Upload } from "lucide-react";
import { ApplicantT } from "@/types/ApplicantT";
import { AttachmentsT } from "@/types/AttachmentsT";
import { DocumentUploadModal } from "@/components/document-upload-modal";

interface VisaApplicationsProps {
  applicants: ApplicantT[];
  onEditName: (personId: string, newName: string) => void;
  editingNames: Set<string>;
}

interface EditableNameProps {
  person: ApplicantT;
  onSave: (newName: string) => void;
  isLoading: boolean;
}

function EditableName({ person, onSave, isLoading }: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(person.name);

  const handleEdit = () => {
    if (isLoading) return;
    setIsEditing(true);
    setEditValue(person.name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(person.name);
  };

  const handleSave = () => {
    if (isLoading) return;
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
          disabled={isLoading}
        />
        <Button 
          size="sm" 
          onClick={handleSave} 
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel} 
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="font-medium">{person.name}</span>
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export function VisaApplications({
  applicants,
  onEditName,
  editingNames
}: VisaApplicationsProps) {
  const router = useRouter();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [applicantDocuments, setApplicantDocuments] = useState<AttachmentsT[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Carregar documentos de um aplicante
  const loadApplicantDocuments = async (applicantId: string) => {
    try {
      setLoadingDocuments(true);
      const response = await fetch(`/api/attachments/list?applicantId=${applicantId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }
      
      const data = await response.json();
      setApplicantDocuments(data.documents || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setApplicantDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Abrir modal de upload
  const handleOpenUploadModal = async (applicantId: string) => {
    setSelectedApplicantId(applicantId);
    setUploadModalOpen(true);
    await loadApplicantDocuments(applicantId);
  };

  // Fechar modal
  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedApplicantId(null);
    setApplicantDocuments([]);
  };

  // Atualizar documentos após upload/remoção
  const handleDocumentsUpdate = (documents: AttachmentsT[]) => {
    setApplicantDocuments(documents);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "nao_iniciado":
        return "Não iniciado";
      case "em_preenchimento":
        return "Em andamento";
      case "submetido":
        return "Submetido - Aguarde a revisão";
      case "em_revisao":
        return "Em revisão";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Desconhecido";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "submetido":
        return "bg-green-500";
      case "em_revisao":
        return "bg-green-500";
      case "aprovado":
        return "bg-green-500";
      default:
        return "bg-primary";
    }
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
            {applicants.map((person) => (
              <Card key={person.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Nome editável */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <EditableName
                        person={person}
                        onSave={(newName) => onEditName(person.id, newName)}
                        isLoading={editingNames.has(person.id)}
                      />
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preenchimento do formulário</span>
                        <span className="font-medium">{person.progress || 0}%</span>
                      </div>
                      <Progress value={person.progress || 0} className={getProgressColor(person.form_status || "nao_iniciado")} />
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(person.form_status || "nao_iniciado")}
                      </p>
                    </div>

                    {/* Botão de ação */}
                    <Button
                      onClick={() => router.push(`/protected/user/form/${person.id}`)}
                      className="w-full"
                      variant={person.form_status === "nao_iniciado" ? "default" : person.form_status === "em_preenchimento" ? "default" : "outline"}
                    >
                      {person.form_status === "nao_iniciado" ? "Iniciar Formulário" : person.form_status === "em_preenchimento" ? "Continuar Formulário" : "Editar Formulário"}
                    </Button>

                    {/* Botão de Enviar Documentos */}
                    <Button
                      onClick={() => handleOpenUploadModal(person.id)}
                      variant="outline"
                      className="w-full"
                      disabled={loadingDocuments}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {loadingDocuments ? "Carregando..." : "Enviar Documentos"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mensagem quando não há aplicações */}
          {applicants.length === 0 && (
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

      {/* Modal de Upload de Documentos */}
      {selectedApplicantId && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={handleCloseUploadModal}
          applicantId={selectedApplicantId}
          existingDocuments={applicantDocuments}
          onDocumentsUpdate={handleDocumentsUpdate}
        />
      )}
    </Card>
  );
} 