"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProfilesT } from "@/types/ProfilesT";
import { apiService } from "@/lib/api-service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfilesT | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Obter usuário atual
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Se há usuário, buscar o perfil
        if (user) {
          const profileResponse = await apiService.getProfile(user.id);
          if (!profileResponse.error && profileResponse.data) {
            setProfile(profileResponse.data);
          }
        }
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        // Se há sessão, buscar o perfil
        if (session?.user) {
          try {
            const profileResponse = await apiService.getProfile(session.user.id);
            if (!profileResponse.error && profileResponse.data) {
              setProfile(profileResponse.data);
            }
          } catch (error) {
            console.error("Erro ao buscar perfil:", error);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return {
    user,
    profile,
    loading,
    userId: user?.id || null,
    userRole: profile?.role || null,
    isAuthenticated: !!user
  };
}

