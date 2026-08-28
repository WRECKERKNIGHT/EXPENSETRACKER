import { OnboardInputs, Tx, AutopilotId } from './engine';

const KEY = 'spendsmart.profile.v1';

export interface Profile {
  inputs: OnboardInputs;
  tx: Tx[];
  toggles: Record<AutopilotId, boolean>;
  streak: number;
  lastWinDay: string;
  onboardedAt: string;
}

export const emptyToggles = (): Record<AutopilotId, boolean> => ({
  rent: true,
  autopay: true,
  allowance: true,
  ghost: false,
  hunter: true,
  advisor: true,
});

export const loadProfile = (): Profile | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!p.inputs || typeof p.inputs.income !== 'number') return null;
    p.toggles = { ...emptyToggles(), ...(p.toggles || {}) };
    return p;
  } catch {
    return null;
  }
};

export const saveProfile = (p: Profile) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — keep running in-memory */
  }
};

export const clearProfile = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
};

let uid = 0;
export const nextId = () => `${Date.now().toString(36)}-${(uid++).toString(36)}`;