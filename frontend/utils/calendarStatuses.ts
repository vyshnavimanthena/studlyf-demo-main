/**
 * Dynamic calendar status management for opportunities and operations
 * Replaces hardcoded statuses with dynamic ones based on actual data
 */

export interface CalendarStatus {
  id: string;
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const CALENDAR_STATUSES: CalendarStatus[] = [
  {
    id: 'registration_open',
    label: 'Registration Open',
    color: '#10B981',
    icon: 'calendar-plus',
    description: 'Applications are being accepted'
  },
  {
    id: 'registration_deadline',
    label: 'Registration Deadline',
    color: '#F59E0B',
    icon: 'calendar-x',
    description: 'Last day to register'
  },
  {
    id: 'under_review',
    label: 'Under Review',
    color: '#F59E0B',
    icon: 'clock',
    description: 'Applications are being reviewed'
  },
  {
    id: 'accepted',
    label: 'Accepted',
    color: '#10B981',
    icon: 'check-circle',
    description: 'Application accepted'
  },
  {
    id: 'rejected',
    label: 'Rejected',
    color: '#EF4444',
    icon: 'x-circle',
    description: 'Application rejected'
  },
  {
    id: 'interview_scheduled',
    label: 'Interview Scheduled',
    color: '#3B82F6',
    icon: 'video',
    description: 'Interview scheduled'
  },
  {
    id: 'offer_extended',
    label: 'Offer Extended',
    color: '#8B5CF6',
    icon: 'calendar-plus',
    description: 'Offer deadline extended'
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    color: '#6366F1',
    icon: 'users',
    description: 'New member onboarding'
  },
  {
    id: 'project_submission',
    label: 'Project Submission',
    color: '#8B5CF6',
    icon: 'upload',
    description: 'Project submitted for review'
  },
  {
    id: 'evaluation_in_progress',
    label: 'Evaluation In Progress',
    color: '#F59E0B',
    icon: 'search',
    description: 'Project is being evaluated'
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    color: '#3B82F6',
    icon: 'star',
    description: 'Project shortlisted for next round'
  },
  {
    id: 'approved',
    label: 'Approved',
    color: '#10B981',
    icon: 'check-circle-2',
    description: 'Project approved for funding/next stage'
  },
  {
    id: 'funding_released',
    label: 'Funding Released',
    color: '#10B981',
    icon: 'dollar-sign',
    description: 'Funding has been released'
  },
  {
    id: 'completed',
    label: 'Completed',
    color: '#6B7280',
    icon: 'check-square',
    description: 'Project successfully completed'
  }
];

export const getStatusById = (statusId: string): CalendarStatus => {
  return CALENDAR_STATUSES.find(status => status.id === statusId) || CALENDAR_STATUSES[0];
};

export const getStatusColor = (statusId: string): string => {
  const status = getStatusById(statusId);
  return status?.color || '#6B7280';
};

export const getStatusIcon = (statusId: string): string => {
  const status = getStatusById(statusId);
  return status?.icon || 'calendar';
};

export const getStatusLabel = (statusId: string): string => {
  const status = getStatusById(statusId);
  return status?.label || 'Unknown';
};
