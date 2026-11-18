import { Transform } from 'class-transformer';


export const ToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    
    if (typeof value === 'string') {
      const lowerVal = value.toLowerCase().trim();
      if (lowerVal === 'false' || lowerVal === '0' || lowerVal === 'no' || lowerVal === 'off') {
        return false; 
      }
      if (lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes' || lowerVal === 'on') {
        return true;
      }
    }
    
    if (typeof value === 'number') {
      return value !== 0;
    }

    return value;
  });