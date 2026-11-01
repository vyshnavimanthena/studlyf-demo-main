import { useMemo } from 'react';

export type RegistrationCTA =
  | { variant: 'register'; label: string; disabled: boolean; reason?: string }
  | { variant: 'registered'; label: string; teamStatus?: string }
  | { variant: 'closed'; label: string; reason: string }
  | { variant: 'team_full'; label: string; reason: string }
  | { variant: 'external'; label: string; url: string }
  | { variant: 'loading'; label: string };

interface RegistrationStateInput {
  isAuthenticated: boolean;
  isRegistered: boolean;
  deadline?: string | null;
  registrationOpen?: boolean;
  maxTeamSize?: number;
  currentTeamSize?: number;
  isTeamLeader?: boolean;
  externalLink?: string | null;
  isLoading?: boolean;
  eligibilityPassed?: boolean;
}

export function useRegistrationState(input: RegistrationStateInput): RegistrationCTA {
  return useMemo(() => {
    if (input.isLoading) {
      return { variant: 'loading', label: 'Checking...' };
    }

    // External registration link takes priority
    if (input.externalLink) {
      return { variant: 'external', label: 'Register on External Site', url: input.externalLink };
    }

    // Already registered users should keep seeing the registered state even after deadlines close.
    if (input.isRegistered) {
      // Check if team is full (if team leader viewing)
      if (input.maxTeamSize && input.currentTeamSize && input.currentTeamSize >= input.maxTeamSize && input.isTeamLeader) {
        return { variant: 'team_full', label: 'Team Full', reason: `Your team has reached the maximum of ${input.maxTeamSize} members` };
      }
      return { variant: 'registered', label: 'Registered', teamStatus: input.currentTeamSize && input.maxTeamSize ? `${input.currentTeamSize}/${input.maxTeamSize}` : undefined };
    }

    // Check deadline
    if (input.deadline) {
      const deadlineDate = new Date(input.deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
        return { variant: 'closed', label: 'Registration Closed', reason: 'Deadline has passed' };
      }
    }

    // Registration explicitly closed
    if (input.registrationOpen === false) {
      return { variant: 'closed', label: 'Registration Closed', reason: 'Registration is not currently open' };
    }

    // Not authenticated
    if (!input.isAuthenticated) {
      return { variant: 'register', label: 'Register Now', disabled: false };
    }

    // Check eligibility
    if (input.eligibilityPassed === false) {
      return { variant: 'closed', label: 'Not Eligible', reason: 'You do not meet the eligibility criteria' };
    }

    // Default: can register
    return { variant: 'register', label: 'Register Now', disabled: false };
  }, [input]);
}
