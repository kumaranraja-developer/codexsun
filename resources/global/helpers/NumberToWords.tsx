function NumberToWords(value: any): string {
  const number = Number(value);

  if (
    Number.isNaN(number) ||
    !Number.isSafeInteger(number) ||
    number < 0
  ) {
    return "Invalid amount";
  }

  if (number === 0) return "zero";

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine", "ten", "eleven", "twelve", "thirteen",
    "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
  ];

  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
  ];

  const scales = ["", "thousand", "million", "billion", "trillion"];

  function chunkToWords(num: number): string {
    let words = "";

    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + " hundred";
      num %= 100;
      if (num > 0) words += " ";
    }

    if (num >= 20) {
      words += tens[Math.floor(num / 10)];
      num %= 10;
      if (num > 0) words += "-" + ones[num];
    } else if (num > 0) {
      words += ones[num];
    }

    return words;
  }

  let wordArray: string[] = [];
  let tempNum = number;
  let scaleIndex = 0;

  while (tempNum > 0) {
    const chunk = tempNum % 1000;
    if (chunk > 0) {
      let chunkWords = chunkToWords(chunk);
      if (scales[scaleIndex]) {
        chunkWords += " " + scales[scaleIndex];
      }
      wordArray.unshift(chunkWords);
    }
    tempNum = Math.floor(tempNum / 1000);
    scaleIndex++;
  }

  return wordArray.join(" ").trim();
}

export default NumberToWords;
