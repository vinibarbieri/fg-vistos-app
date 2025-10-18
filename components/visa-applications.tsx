"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit2, Check, X, Loader2, Upload, Trash2, Plus } from "lucide-react";
import { ApplicantT } from "@/types/ApplicantT";
import { AttachmentsT } from "@/types/AttachmentsT";
import { DocumentUploadModal } from "@/components/document-upload-modal";
import { createApplicantAPI } from "@/lib/api/responsible-api";
import { getStatusText } from "@/utils/getStatusText";
import { getProgressColor } from "@/utils/getProgressColor";

interface VisaApplicationsProps {
  applicantsProps: ApplicantT[];
  userIdResponsavel: string;
  onEditName: (personId: string, newName: string) => void;
  editingNames: Set<string>;
  isStaff?: boolean;
  onDeleteApplicant?: (applicantId: string) => void;
  onUpdateFormStatus?: (applicantId: string, formStatus: string) => void;
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
  applicantsProps,
  userIdResponsavel,
  onEditName,
  editingNames,
  isStaff = false,
  onDeleteApplicant,
  onUpdateFormStatus
}: VisaApplicationsProps) {
  const router = useRouter();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [applicantDocuments, setApplicantDocuments] = useState<AttachmentsT[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [applicants, setApplicants] = useState<ApplicantT[]>(applicantsProps);

  // Sincronizar estado local com props quando elas mudarem
  useEffect(() => {
    setApplicants(applicantsProps);
  }, [applicantsProps]);

  // Função para atualizar o form_status localmente e chamar a função do pai
  const handleUpdateFormStatus = async (applicantId: string, formStatus: string) => {
    // Atualizar estado local imediatamente para feedback visual
    setApplicants(prev => 
      prev.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, form_status: formStatus }
          : applicant
      )
    );
    
    // Chamar a função do pai para persistir no banco de dados
    onUpdateFormStatus?.(applicantId, formStatus);
  };

  const [showCreateApplicant, setShowCreateApplicant] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    name: "",
    status: "pendente",
    form_status: "nao_iniciado",
    is_responsible: false
  });

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

  const handleCreateApplicant = async () => {
    if (!userIdResponsavel || !newApplicant.name.trim()) return;
    
    try {
      const result = await createApplicantAPI({
        responsible_user_id: userIdResponsavel,
        order_id: applicants[0]?.order_id || "", // Usar o mesmo order_id dos outros applicants
        is_responsible: newApplicant.is_responsible,
        name: newApplicant.name,
        status: applicants[0]?.status || "pendente",
        form_status: "nao_iniciado"
      });
      
      if (result.success && result.data) {
        setApplicants(prev => [...prev, result.data as ApplicantT]);
        setNewApplicant({
          name: "",
          status: "pendente",
          form_status: "nao_iniciado",
          is_responsible: false
        });
        setShowCreateApplicant(false);
      }
    } catch (error) {
      console.error("Erro ao criar applicant:", error);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex-col items-center gap-2">
            <CardTitle className="flex items-center gap-2 mb-1.5">
              <User className="h-5 w-5" />
              Minhas Aplicações de Visto
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos formulários de cada aplicante
            </CardDescription>
          </div>
        {isStaff && (
          <div>
            <Button 
              onClick={() => setShowCreateApplicant(true)}
              className="bg-primary text-primary-foreground"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aplicante
              </Button>
            </div>
        )}
        </div>
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
                    <div className="flex items-center gap-2 just">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <EditableName
                        person={person}
                        onSave={(newName) => onEditName(person.id, newName)}
                        isLoading={editingNames.has(person.id)}
                      />
                      {isStaff && (
                      <div className="ml-auto">
                        <Button 
                          variant="outline" 
                          className="border-transparent shadow-none p-0 h-6 w-6 hover:bg-transparent hover:text-destructive" 
                          size="sm"
                          onClick={() => onDeleteApplicant?.(person.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      )}
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
                      variant={person.form_status === "nao_iniciado" ? "default" : person.form_status === "em_preenchimento" ? "default" : "secondary"}
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

                    {/* Controles para Funcionários/Admins */}
                    {isStaff && (
                      <div className="space-y-2 pt-2 border-t">
                        
                        {/* Status do Formulário */}
                        <div className="space-y-1">
                          <Label htmlFor={`formStatus-${person.id}`} className="text-sm">Status do Formulário:</Label>
                          <select
                            id={`formStatus-${person.id}`}
                            className="w-full p-1 text-sm border rounded bg-white"
                            value={person.form_status || "nao_iniciado"}
                            onChange={(e) => handleUpdateFormStatus(person.id, e.target.value)}
                          >
                            <option value="nao_iniciado">Não iniciado</option>
                            <option value="em_preenchimento">Em andamento</option>
                            <option value="submetido">Submetido</option>
                            <option value="em_revisao">Em revisão</option>
                            <option value="aprovado">Aprovado</option>
                          </select>
                        </div>
                      </div>
                    )}
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
          loadingDocuments={loadingDocuments}
          onDocumentsUpdate={handleDocumentsUpdate}
        />
      )}

      {/* Modal para Criar Applicant */}
      {showCreateApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Novo Aplicante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applicantName">Nome do Aplicante</Label>
                <Input
                  id="applicantName"
                  value={newApplicant.name}
                  onChange={(e) => setNewApplicant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isResponsible"
                  checked={newApplicant.is_responsible}
                  onChange={(e) => setNewApplicant(prev => ({ ...prev, is_responsible: e.target.checked }))}
                />
                <Label htmlFor="isResponsible">É o responsável pelo processo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateApplicant}
                  className="flex-1"
                  disabled={!newApplicant.name.trim()}
                >
                  Criar Aplicante
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateApplicant(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
} 