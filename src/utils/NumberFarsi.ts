const convertToPersianNumber = (number: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  return number
    .toString()
    .split('')
    .map((digit) =>
      /[0-9]/.test(digit) ? persianDigits[parseInt(digit)] : digit
    )
    .join('');
};

const convertToEnglishNumber = (number: string | number): string => {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return number
    .toString()
    .split('')
    .map((digit) =>
      /[۰-۹]/.test(digit) ? englishDigits['۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)] : digit
    )
    .join('');
};

export { convertToPersianNumber, convertToEnglishNumber };
