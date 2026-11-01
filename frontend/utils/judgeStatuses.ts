/**
 * Dynamic judge status management for judge dashboard
 * Replaces hardcoded statuses with dynamic ones based on actual data
 */

export interface JudgeStatus {
  id: string;
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const JUDGE_STATUSES: JudgeStatus[] = [
  {
    id: 'pending_invitation',
    label: 'Pending Invitation',
    color: '#F59E0B',
    icon: 'mail',
    description: 'Invitation sent, waiting for response'
  },
  {
    id: 'invitation_accepted',
    label: 'Invitation Accepted',
    color: '#10B981',
    icon: 'user-check',
    description: 'Judge accepted invitation and joined platform'
  },
  {
    id: 'active',
    label: 'Active',
    color: '#10B981',
    icon: 'gavel',
    description: 'Judge is actively evaluating submissions'
  },
  {
    id: 'on_leave',
    label: 'On Leave',
    color: '#6B7280',
    icon: 'log-out',
    description: 'Judge is temporarily unavailable'
  },
  {
    id: 'suspended',
    label: 'Suspended',
    color: '#EF4444',
    icon: 'shield-x',
    description: 'Judge account is suspended'
  },
  {
    id: 'evaluation_complete',
    label: 'Evaluation Complete',
    color: '#059669',
    icon: 'check-circle',
    description: 'Judge has completed all assigned evaluations'
  }
];

export const getJudgeStatusById = (statusId: string): JudgeStatus => {
  return JUDGE_STATUSES.find(status => status.id === statusId) || JUDGE_STATUSES[0];
};

export const getJudgeStatusColor = (statusId: string): string => {
  const status = getJudgeStatusById(statusId);
  return status?.color || '#6B7280';
};

export const getJudgeStatusIcon = (statusId: string): string => {
  const status = getJudgeStatusById(statusId);
  return status?.icon || 'users';
};

export const getJudgeStatusLabel = (statusId: string): string => {
  const status = getJudgeStatusById(statusId);
  return status?.label || 'Unknown';
};
