import { useState } from 'react';

export function useFormData(initialData) {
  const [formData, setFormData] = useState(initialData);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialData);
  };

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm
  };
}
