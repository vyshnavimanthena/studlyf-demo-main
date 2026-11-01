import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  helpText?: string;
}

interface StageConfig {
  stage_id: string;
  stage_name: string;
  stage_type: string;
  stage_description?: string;
  stage_deadline?: string;
  fields: Field[];
}

interface RegistrationFormProps {
  stage: any;
  config: StageConfig;
  eventId: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onSuccess: () => void;
  initialData?: Record<string, any>;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  stage,
  config,
  eventId,
  onSubmit,
  onSuccess,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fields = config?.fields || [];

  // Validate individual field
  const validateField = (field: Field, value: any): string => {
    if (field.required && (!value || String(value).trim() === '')) {
      return `${field.label} is required`;
    }

    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field.label} must be a valid email`;
      }
    }

    if (value && field.type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 7) {
        return `${field.label} must be a valid phone number`;
      }
    }

    return '';
  };

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error for this field when user starts typing
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const value = formData[field.id];
      const fieldError = validateField(field, value);
      if (fieldError) {
        errors[field.id] = fieldError;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({});
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-100 rounded-2xl">
        <p className="text-yellow-800 font-bold">No fields configured for this stage yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-black uppercase tracking-tight mb-2">
          {config.stage_name}
        </h2>
        {config.stage_description && (
          <p className="text-lg text-slate-600">{config.stage_description}</p>
        )}
        {config.stage_deadline && (
          <p className="text-sm text-slate-500 mt-2">
            Deadline: {new Date(config.stage_deadline).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-black text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="font-black text-green-700">Registration submitted successfully!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field: Field) => (
          <div key={field.id} className="space-y-2">
            {/* Label */}
            <label className="block font-black uppercase text-sm text-slate-900">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </label>

            {/* Help Text */}
            {field.helpText && (
              <p className="text-xs text-slate-500">{field.helpText}</p>
            )}

            {/* Input Fields */}
            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors ${
                  fieldErrors[field.id]
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-purple-400 focus:bg-purple-50'
                } focus:outline-none`}
              />
            ) : field.type === 'select' || field.type === 'dropdown' ? (
              <select
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors ${
                  fieldErrors[field.id]
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-purple-400'
                } focus:outline-none`}
              >
                <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[field.id] || false}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-slate-300 cursor-pointer"
                />
                <span className="font-medium text-slate-700">{field.label}</span>
              </label>
            ) : field.type === 'radio' && field.options ? (
              <div className="space-y-3">
                {field.options.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={formData[field.id] === opt.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={field.type || 'text'}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors ${
                  fieldErrors[field.id]
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-purple-400 focus:bg-purple-50'
                } focus:outline-none`}
              />
            )}

            {/* Field Error */}
            {fieldErrors[field.id] && (
              <p className="text-sm text-red-600 font-bold">{fieldErrors[field.id]}</p>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-black uppercase rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader size={20} className="animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Registration'
          )}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;

