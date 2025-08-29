export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatPhoneNumber = (number) => {
  if (!number) return "";
  return number.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};
