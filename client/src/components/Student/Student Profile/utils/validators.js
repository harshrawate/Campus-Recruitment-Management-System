export const validateFileType = (file, allowedTypes, errorMessage) => {
  if (!file) return true;
  return allowedTypes.includes(file.type) || errorMessage;
};

export const validatePhoneNumber = (value) => {
  return /^\d{10}$/.test(value) || "Please enter a valid 10-digit number";
};

export const validateUrl = (value, pattern, message) => {
  return pattern.test(value) || message;
};
