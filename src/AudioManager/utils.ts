/**
 * Returns the average value in the range `[start, end)` for the provided byte array.
 * 
 * @param array - byte array
 * @param start - start index for range (inclusive)
 * @param end - end index for range (non-inclusive)
 * @returns average value in range [start, end)
 */
export const calculateAverage = (array: Uint8Array, start: number, end: number): number => {
    let sum = 0;
    for (let i = start; i <= end; ++i) {
        sum += array[i]
    }
    return sum / (end - start + 1)
}

/**
 * Returns value normalized in range 0-1.
 * 
 * @param value - value to normalize
 * @param range - maximum value for a value (the divisor during normalization)
 */
export const normalizeValue = (value: number, range: number) => {
    return value / range
}