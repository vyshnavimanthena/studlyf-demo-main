import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Bell } from 'lucide-react';

interface JudgeEmailNotificationsProps {
  judgeId?: string;
  onSendEmail?: (email: string, subject: string, message: string) => void;
}

const JudgeEmailNotifications: React.FC<JudgeEmailNotificationsProps> = ({ judgeId, onSendEmail }) => {
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 'invitation',
      name: 'Judge Invitation',
      subject: 'Invitation to Judge for Studlyf Event',
      template: 'Dear {judge_name},\n\nWe would like to invite you to be a judge for our upcoming event. Your expertise would be invaluable in evaluating submissions.\n\nPlease click the link below to accept or view details:\n{invitation_link}\n\nBest regards,\n{institution_name}'
    },
    {
      id: 'assignment',
      name: 'New Assignment',
      subject: 'New Submission Assignment',
      template: 'Dear {judge_name},\n\nYou have been assigned to evaluate a new submission:\n\nSubmission: {submission_title}\nEvent: {event_name}\nDeadline: {deadline}\n\nPlease log in to your dashboard to begin evaluation.\n\nBest regards,\n{institution_name}'
    },
    {
      id: 'reminder',
      name: 'Evaluation Reminder',
      subject: 'Evaluation Reminder',
      template: 'Dear {judge_name},\n\nThis is a reminder that you have {pending_count} pending evaluations:\n\n{submission_list}\n\nPlease complete these evaluations by {deadline}.\n\nBest regards,\n{institution_name}'
    },
    {
      id: 'deadline',
      name: 'Deadline Alert',
      subject: 'Evaluation Deadline Approaching',
      template: 'Dear {judge_name},\n\nYou have {hours_left} hours remaining to complete {pending_count} evaluations:\n\n{submission_list}\n\nPlease complete these evaluations before the deadline.\n\nBest regards,\n{institution_name}'
    }
  ]);

  const [customEmail, setCustomEmail] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const handleSendCustomEmail = async () => {
    if (!customEmail.recipient || !customEmail.subject || !customEmail.message) {
      alert('Please fill in all email fields');
      return;
    }

    try {
      const response = await fetch('/api/send-judge-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEmail)
      });

      if (response.ok) {
        alert('Email sent successfully');
        setCustomEmail({ recipient: '', subject: '', message: '' });
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      try { console.error('Email send error:', error instanceof Error ? error.message : String(error)); } catch (_) {}
      alert('Failed to send email');
    }
  };

  const handleTemplateEmail = async (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    const message = template.template
      .replace('{judge_name}', 'Judge Name')
      .replace('{submission_title}', 'Sample Submission')
      .replace('{event_name}', 'Event Name')
      .replace('{deadline}', '2024-12-31')
      .replace('{pending_count}', '3')
      .replace('{hours_left}', '24')
      .replace('{submission_list}', '- Submission 1\n- Submission 2\n- Submission 3')
      .replace('{institution_name}', 'Your Institution')
      .replace('{invitation_link}', 'https://studlyf.com/judge/invite/abc123');

    if (onSendEmail) {
      onSendEmail('judge@example.com', template.subject, message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-black text-slate-900">Judge Email Notifications</h3>
      </div>

      {/* Email Templates */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-black text-slate-700 mb-3">Quick Templates</h4>
        {emailTemplates.map((template) => (
          <div key={template.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900">{template.name}</p>
              <p className="text-xs text-slate-500">{template.subject}</p>
            </div>
            <button
              onClick={() => handleTemplateEmail(template.id)}
              className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 transition-all"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>

      {/* Custom Email */}
      <div className="border-t border-slate-100 pt-6">
        <h4 className="text-sm font-black text-slate-700 mb-3">Custom Email</h4>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Recipient Email"
            value={customEmail.recipient}
            onChange={(e) => setCustomEmail(prev => ({ ...prev, recipient: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-600 focus:outline-none transition-all text-sm"
          />
          <input
            type="text"
            placeholder="Subject"
            value={customEmail.subject}
            onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-600 focus:outline-none transition-all text-sm"
          />
          <textarea
            placeholder="Message"
            value={customEmail.message}
            onChange={(e) => setCustomEmail(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-600 focus:outline-none transition-all text-sm resize-none"
          />
          <button
            onClick={handleSendCustomEmail}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgeEmailNotifications;

