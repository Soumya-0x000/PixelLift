/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, 4th, etc.)
 * @param {number} num - The number to convert
 * @returns {string} The formatted ordinal string
 */
export const formatNumberPrefix = num => {
    if (typeof num !== 'number' || isNaN(num)) {
        return num?.toString() || '';
    }

    const absoluteNum = Math.abs(num);
    const lastTwoDigits = absoluteNum % 100;
    const lastDigit = absoluteNum % 10;

    // Handle special cases for 11th, 12th, 13th
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return `${num}th`;
    }

    // Handle regular cases
    switch (lastDigit) {
        case 1:
            return `${num}st`;
        case 2:
            return `${num}nd`;
        case 3:
            return `${num}rd`;
        default:
            return `${num}th`;
    }
};

export default formatNumberPrefix;
