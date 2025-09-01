import numberToWords from "number-to-words";

function SafeToWords(value: any): string {
  const number = Number(value);
  if (
    Number.isNaN(number) ||
    !Number.isSafeInteger(number) ||
    number < 0
  ) {
    return "Invalid amount";
  }

  return numberToWords.toWords(number);
}

export default SafeToWords;