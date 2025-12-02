/**
 * useFormInput Hook
 * Manages form input state
 */

import { useState, useCallback } from 'react';

export const useFormInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  const bind = {
    value,
    onChange: (e) => setValue(e.target.value),
  };

  return [value, bind, reset, setValue];
};
