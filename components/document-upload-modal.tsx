"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Image, 
  FileImage, 
  X, 
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { AttachmentsT } from "@/types/AttachmentsT";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string;
  existingDocuments: AttachmentsT[];
  onDocumentsUpdate: (documents: AttachmentsT[]) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  documentType: 'passport' | 'other';
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  applicantId,
  existingDocuments,
  onDocumentsUpdate
}: DocumentUploadModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [passportDocument, setPassportDocument] = useState<AttachmentsT | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<AttachmentsT[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  // Separar documentos existentes
  useEffect(() => {
    const passport = existingDocuments.find(doc => doc.document_type === 'passport');
    const others = existingDocuments.filter(doc => doc.document_type === 'other');
    
    setPassportDocument(passport || null);
    setOtherDocuments(others);
  }, [existingDocuments]);

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    return <FileImage className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: 10MB. Arquivo atual: ${formatFileSize(file.size)}`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `Formato não suportado. Formatos aceitos: PDF, JPG, PNG. Formato atual: ${file.type}`;
    }
    
    return null;
  };

  const handleFileSelect = (files: FileList | null, documentType: 'passport' | 'other') => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      alert(validationError);
      return;
    }

    const uploadingFile: UploadingFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading',
      documentType
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);
    uploadFile(uploadingFile);
  };

  const uploadFile = async (uploadingFile: UploadingFile) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadingFile.file);
      formData.append('applicantId', applicantId);
      formData.append('documentType', uploadingFile.documentType);

      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no servidor');
      }

      const result = await response.json();
      
      // Atualizar estado com documento salvo
      if (uploadingFile.documentType === 'passport') {
        setPassportDocument(result.document);
      } else {
        setOtherDocuments(prev => [...prev, result.document]);
      }

      // Remover da lista de uploads
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
      
      // Notificar componente pai
      const updatedDocuments = uploadingFile.documentType === 'passport' 
        ? [result.document, ...otherDocuments]
        : [...otherDocuments, result.document];
      onDocumentsUpdate(updatedDocuments);

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = async (documentId: string, documentType: 'passport' | 'other') => {
    try {
      const response = await fetch(`/api/attachments/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover documento');
      }

      // Atualizar estado local
      if (documentType === 'passport') {
        setPassportDocument(null);
      } else {
        setOtherDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }

      // Notificar componente pai
      const updatedDocuments = documentType === 'passport'
        ? otherDocuments
        : otherDocuments.filter(doc => doc.id !== documentId);
      onDocumentsUpdate(updatedDocuments);

    } catch (error) {
      console.error('Erro ao remover documento:', error);
      alert('Erro ao remover documento. Tente novamente.');
    }
  };

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Enviar Documentos</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Seção do Passaporte */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Passaporte (Obrigatório)
            </h3>
            
            {passportDocument ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(passportDocument.file_type)}
                      <div>
                        <p className="font-medium">{passportDocument.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(passportDocument.file_size)} • {passportDocument.file_type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(passportDocument.id, 'passport')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhum passaporte enviado</p>
                  <Button
                    onClick={() => passportInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enviar Passaporte
                  </Button>
                  <input
                    ref={passportInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e.target.files, 'passport')}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Seção de Outros Documentos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Outros Documentos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Documentos existentes */}
              {otherDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{doc.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id, 'other')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Arquivos sendo enviados */}
              {uploadingFiles
                .filter(f => f.documentType === 'other')
                .map((uploadingFile) => (
                  <Card key={uploadingFile.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFileIcon(uploadingFile.file.type)}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{uploadingFile.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(uploadingFile.file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadingFile(uploadingFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {uploadingFile.status === 'uploading' && (
                          <div className="space-y-1">
                            <Progress value={uploadingFile.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">Enviando...</p>
                          </div>
                        )}
                        
                        {uploadingFile.status === 'success' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <p className="text-sm">Enviado com sucesso!</p>
                          </div>
                        )}
                        
                        {uploadingFile.status === 'error' && (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{uploadingFile.error}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Botão para adicionar novo documento */}
              <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">Adicionar documento</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e.target.files, 'other')}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Arquivo de passaporte sendo enviado */}
          {uploadingFiles
            .filter(f => f.documentType === 'passport')
            .map((uploadingFile) => (
              <Card key={uploadingFile.id} className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadingFile.file.type)}
                        <div>
                          <p className="font-medium">{uploadingFile.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(uploadingFile.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadingFile(uploadingFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {uploadingFile.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={uploadingFile.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">Enviando passaporte...</p>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <p className="text-sm">Passaporte enviado com sucesso!</p>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{uploadingFile.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
