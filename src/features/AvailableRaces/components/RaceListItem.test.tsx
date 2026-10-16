import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RaceListItem } from './RaceListItem';
import { useRaceInscription } from '../hooks/useRaceInscription';
import { User, Race } from '../../../types/entities';

// Se mockea el hook para observar dos cosas: que se invoque SIEMPRE (hook
// incondicional) y que el botón dispare el handler (botón vivo).
const handleInscription = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useRaceInscription', () => ({
  useRaceInscription: vi.fn(() => ({
    loading: false,
    success: false,
    handleInscription,
  })),
}));

const mockUseRaceInscription = vi.mocked(useRaceInscription);

const user = { id: 1, userName: 'piloto' } as User;
const race = {
  id: 2,
  raceDateTime: new Date(Date.now() + 86_400_000).toISOString(),
  registrationDeadline: new Date(Date.now() + 3_600_000).toISOString(),
  raceUsers: [],
  combination: { id: 3 },
} as unknown as Race;

describe('RaceListItem (BE #55)', () => {
  beforeEach(() => {
    mockUseRaceInscription.mockClear();
    handleInscription.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('invoca el hook aunque no haya sesión (hook incondicional)', () => {
    render(<RaceListItem race={race} user={null} />);

    expect(mockUseRaceInscription).toHaveBeenCalled();
  });

  it('al hacer click en Inscribirse dispara la inscripción (botón vivo)', async () => {
    render(<RaceListItem race={race} user={user} />);

    await userEvent.click(
      screen.getByRole('button', { name: /inscribirse/i }),
    );

    expect(handleInscription).toHaveBeenCalledTimes(1);
  });
});
