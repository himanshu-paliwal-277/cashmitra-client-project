export const formatIndianNumber = (value: number | string) => {
  if (value === null || value === undefined || value === '') return '';

  const number = Number(value);

  if (isNaN(number)) return '';

  return number.toLocaleString('en-IN');
};
