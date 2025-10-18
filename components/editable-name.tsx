"use client";

import { EditableField } from "@/components/editable-field";
import { saveStepData } from "@/lib/application";
import { PersonalData } from "@/types/application";
import { useToast } from "@/components/toast";
import { Toast } from "@/components/toast";

interface EditableNameProps {
  currentName: string;
  applicationId: string;
  currentPersonalData: PersonalData | null;
  onUpdate: (newName: string) => void;
}

export function EditableName({ 
  currentName, 
  applicationId, 
  currentPersonalData,
  onUpdate 
}: EditableNameProps) {
  const { toasts, showToast, removeToast } = useToast();

  const handleSaveName = async (newName: string): Promise<boolean> => {
    try {
      // Atualizar os dados pessoais com o novo nome
      const updatedPersonalData: Partial<PersonalData> = {
        ...currentPersonalData,
        full_name: newName
      };

      // Salvar no backend (mockado por enquanto)
      const success = await saveStepData(applicationId, "personal_data", updatedPersonalData);
      
      if (success) {
        // Atualizar o estado local
        onUpdate(newName);
        showToast("Nome atualizado com sucesso!", "success");
        console.log(`[MOCK] Nome atualizado para: ${newName}`);
        return true;
      } else {
        showToast("Erro ao atualizar nome. Tente novamente.", "error");
        return false;
      }
    } catch (error) {
      console.error("Erro ao salvar nome:", error);
      showToast("Erro ao atualizar nome. Tente novamente.", "error");
      return false;
    }
  };

  return (
    <>
      <EditableField
        value={currentName}
        onSave={handleSaveName}
        label="Nome"
        placeholder="Digite seu nome completo..."
        className="w-full"
      />
      
      {/* Renderizar toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
} 