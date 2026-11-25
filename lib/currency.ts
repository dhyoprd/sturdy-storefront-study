const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export function currencySymbol(currency: string) {
  return currencySymbols[currency] ?? currency;
}
