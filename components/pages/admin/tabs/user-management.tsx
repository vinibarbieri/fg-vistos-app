// ============================================================================
// COMPONENTE DE INTERFACE PARA GERENCIAMENTO DE USUÁRIOS
// ============================================================================
// Este componente fornece uma interface para admins gerenciarem roles de usuários

"use client";

import { useState, useEffect, useCallback } from 'react';
import { roleManager, UserProfile, UserRole } from '@/lib/services/role-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const { success, error } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleManager.getUsersList();
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        error("Erro", response.error || "Erro ao carregar usuários.");
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      error("Erro", "Erro interno ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissionsAndLoadUsers = useCallback(async () => {
    try {
      // Verificar se o usuário atual é admin
      const adminCheck = await roleManager.isCurrentUserAdmin();
      setIsAdmin(adminCheck);

      if (!adminCheck) {
        error("Acesso Negado", "Apenas administradores podem gerenciar usuários.");
        return;
      }

      // Carregar lista de usuários
      await loadUsers();
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      error("Erro", "Erro ao verificar permissões.");
    }
  }, [loadUsers]);

  useEffect(() => {
    checkPermissionsAndLoadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUsers(prev => new Set(prev).add(userId));
      
      const response = await roleManager.setUserRole(userId, newRole);
      
      if (response.success) {
        success("Sucesso", `Role do usuário alterado para ${newRole}.`);
        
        // Recarregar lista de usuários
        await loadUsers();
      } else {
        error("Erro", response.error || "Erro ao alterar role do usuário.");
      }
    } catch (err) {
      console.error('Erro ao alterar role:', err);
      error("Erro", "Erro interno ao alterar role.");
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'funcionario':
        return 'default';
      case 'cliente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Apenas administradores podem acessar esta funcionalidade.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Carregando usuários...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Gerencie os roles e permissões dos usuários do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum usuário encontrado.
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.email}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, 'admin')}
                      disabled={updatingUsers.has(user.id)}
                    >
                      {updatingUsers.has(user.id) ? 'Alterando...' : 'Promover a admin'}
                    </Button>
                  )}
                  
                  {user.role !== 'funcionario' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, 'funcionario')}
                      disabled={updatingUsers.has(user.id)}
                    >
                      {updatingUsers.has(user.id) ? 'Alterando...' : 'Promover a funcionário'}
                    </Button>
                  )}
                  
                  {user.role !== 'cliente' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, 'cliente')}
                      disabled={updatingUsers.has(user.id)}
                    >
                      {updatingUsers.has(user.id) ? 'Alterando...' : 'Rebaixar a cliente'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
