export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK'
  }).format(amount);
};
