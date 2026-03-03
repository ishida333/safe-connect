import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string | null;
  name: string;
  relationship: string;
  is_in_disaster_zone: boolean;
  is_evacuated: boolean;
  last_lat: number | null;
  last_lng: number | null;
  last_updated: string | null;
  created_at: string;
}

export const useContacts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });
};

export const useAddContactByFriendCode = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ friendCode, relationship }: { friendCode: string; relationship: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('friend_code', friendCode.toUpperCase().trim())
        .single();

      if (searchError || !profile) throw new Error('ユーザーが見つかりません');
      if (profile.user_id === user.id) throw new Error('自分自身は追加できません');

      const { error } = await supabase.rpc('add_friend', {
        _requester_id: user.id,
        _target_user_id: profile.user_id,
        _relationship: relationship,
      });

      if (error) throw error;
      return profile;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
};

export const useSearchByFriendCode = () => {
  return useMutation({
    mutationFn: async (friendCode: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, friend_code')
        .eq('friend_code', friendCode.toUpperCase().trim())
        .single();
      if (error || !data) throw new Error('ユーザーが見つかりません');
      return data;
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
};

export const useMyProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
