import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@shared/api/supabase';
import { onlyDigits } from '@shared/lib/phone/phone';
import { displayNow } from '@shared/lib/notifications';
import { useGroupStore } from '@entities/group';

/**
 * Kelgan takliflarni JONLI kuzatadi (Realtime): yangi invite INSERT bo'lganда
 * store'ni yangilaydi (Team ekrani darhol ko'radi) + local bildirishnoma chiqaradi.
 * Ilova ochiq bo'lsa qayta kirish shart emas. App qatlamida bir marta mount qilinadi.
 */
export function useInviteWatcher() {
  const { t } = useTranslation();
  const loadInvites = useGroupStore((s) => s.loadInvites);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    sb.auth.getUser().then(({ data }) => {
      // M12'дан beri auth telefon bo'yicha — JWT'да email claim YO'Q.
      const phone = onlyDigits(data.user?.phone ?? '');
      if (!phone || cancelled) {
        if (__DEV__ && !phone) console.warn('[Group] inviteWatcher: sessiyada telefon YO\'Q — realtime obuna bo\'lmaydi');
        return;
      }
      if (__DEV__) console.warn(`[Group] inviteWatcher: obuna ${phone}`);
      loadInvites().catch(() => {}); // dastlabki holat
      channel = sb
        .channel('invites-watch')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'invites', filter: `invitee_phone=eq.${phone}` },
          () => {
            loadInvites().catch(() => {});
            displayNow(t('team.inviteNotifTitle'), t('team.inviteNotifBody'));
          },
        )
        .subscribe((status) => {
          if (__DEV__) console.warn(`[Group] inviteWatcher kanal: ${status}`);
        });
    });

    return () => {
      cancelled = true;
      if (channel) sb.removeChannel(channel).catch(() => {});
    };
  }, [loadInvites, t]);
}
