/**
 * Storage utility — works in both Claude.ai artifacts and standalone deployments.
 *
 * In Claude artifacts:  uses window.storage API
 * In standalone apps:   uses localStorage (or swap for Supabase/Firebase below)
 */

const isArtifact = typeof window !== 'undefined' && typeof window.storage !== 'undefined';

export const loadState = async (key) => {
  try {
    if (isArtifact) {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : null;
    } else {
      const val = localStorage.getItem(`dormchef_${key}`);
      return val ? JSON.parse(val) : null;
    }
  } catch {
    return null;
  }
};

export const saveState = async (key, val) => {
  try {
    if (isArtifact) {
      await window.storage.set(key, JSON.stringify(val));
    } else {
      localStorage.setItem(`dormchef_${key}`, JSON.stringify(val));
    }
  } catch {}
};

export const deleteState = async (key) => {
  try {
    if (isArtifact) {
      await window.storage.delete(key);
    } else {
      localStorage.removeItem(`dormchef_${key}`);
    }
  } catch {}
};

// ─── Supabase alternative (uncomment to use) ──────────────────────────────────
//
// import { supabase } from './supabaseClient';
//
// export const loadState = async (key, userId) => {
//   const { data } = await supabase
//     .from('user_data')
//     .select('value')
//     .eq('user_id', userId)
//     .eq('key', key)
//     .single();
//   return data?.value ?? null;
// };
//
// export const saveState = async (key, val, userId) => {
//   await supabase.from('user_data').upsert({
//     user_id: userId,
//     key,
//     value: val,
//     updated_at: new Date().toISOString(),
//   });
// };
