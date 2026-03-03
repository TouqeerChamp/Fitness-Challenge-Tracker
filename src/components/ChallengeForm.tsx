import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ChallengeFormData } from '../types/Challenge';

interface ChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChallengeFormData) => Promise<void>;
  isLoading: boolean;
  initialData?: ChallengeFormData;
  isEditing?: boolean;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    targetValue: 0,
    unit: 'reps',
    deadline: '',
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
    } else if (!isOpen) {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        targetValue: 0,
        unit: 'reps',
        deadline: '',
      });
    }
  }, [initialData, isOpen]);

  const [errors, setErrors] = useState<Partial<Record<keyof ChallengeFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChallengeFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.targetValue <= 0) {
      newErrors.targetValue = 'Target value must be greater than 0';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        targetValue: 0,
        unit: 'reps',
        deadline: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ChallengeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Challenge' : 'Create New Challenge'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 500 Pushups Challenge"
              className={`w-full px-4 py-3 bg-white/5 border ${
                errors.title ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your challenge..."
              rows={3}
              className={`w-full px-4 py-3 bg-white/5 border ${
                errors.description ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Target Value & Unit Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Target Value */}
            <div>
              <label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-2">
                Target Value
              </label>
              <input
                type="number"
                id="targetValue"
                name="targetValue"
                value={formData.targetValue || ''}
                onChange={handleChange}
                placeholder="500"
                min="1"
                className={`w-full px-4 py-3 bg-white/5 border ${
                  errors.targetValue ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.targetValue && (
                <p className="mt-1 text-sm text-red-400">{errors.targetValue}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-2">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="reps" className="bg-gray-800">Reps</option>
                <option value="km" className="bg-gray-800">Kilometers</option>
                <option value="miles" className="bg-gray-800">Miles</option>
                <option value="minutes" className="bg-gray-800">Minutes</option>
                <option value="hours" className="bg-gray-800">Hours</option>
                <option value="calories" className="bg-gray-800">Calories</option>
                <option value="kg" className="bg-gray-800">Kilograms</option>
                <option value="lbs" className="bg-gray-800">Pounds</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 bg-white/5 border ${
                errors.deadline ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-400">{errors.deadline}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (isEditing ? 'Updating Challenge...' : 'Creating Challenge...') : (isEditing ? 'Update Challenge' : 'Create Challenge')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;
