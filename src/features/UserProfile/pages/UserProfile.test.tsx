import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import UserProfile from './UserProfile';
import { toast } from '../../../components/tremor/TremorComponents.tsx';

// El perfil "no disponible" es el caso que antes disparaba el toast en el
// cuerpo del render (spam por re-render).
const profile = vi.hoisted(() => ({
  user: null as unknown,
  formData: null as unknown,
  loading: false,
}));

vi.mock('../hooks/useUserProfile.ts', () => ({
  useUserProfile: () => ({
    user: profile.user,
    results: [],
    formData: profile.formData,
    loading: profile.loading,
    isEditing: false,
    saving: false,
    stats: { totalRaces: 0, victories: 0, podiums: 0 },
    handleStartEdit: vi.fn(),
    handleChange: vi.fn(),
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
  }),
}));

vi.mock('../../../components/tremor/TremorComponents.tsx', () => ({
  toast: vi.fn(),
}));

const mockToast = vi.mocked(toast);

describe('UserProfile (BE #63: toast fuera del render)', () => {
  beforeEach(() => {
    mockToast.mockReset();
    profile.user = null;
    profile.formData = null;
    profile.loading = false;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('avisa el error de carga una sola vez, aunque haya re-renders', () => {
    const { rerender } = render(<UserProfile />);
    rerender(<UserProfile />);
    rerender(<UserProfile />);

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error de Carga',
      description: 'No se pudo cargar el perfil de usuario.',
      variant: 'error',
    });
  });
});
