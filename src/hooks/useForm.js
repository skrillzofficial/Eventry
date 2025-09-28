import { useState } from 'react';
import { useFormValidation } from './useFormValidation';

export const useForm = (formConfig) => {
  const [formData, setFormData] = useState(formConfig.initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { errors, validateForm, clearError } = useFormValidation(formConfig);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      clearError(name);
    }
  };

  const resetForm = () => {
    setFormData(formConfig.initialData);
  };

  return {
    formData,
    setFormData,
    isLoading,
    setIsLoading,
    errors,
    handleChange,
    validateForm: () => validateForm(formData),
    resetForm
  };
};