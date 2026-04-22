export function getPercentageColor(percentStr: string) {
    const percent = parseFloat(percentStr);
    if (isNaN(percent) || percent === 0) return "text-gray-900 dark:text-zinc-100";
    if (percent < 40) return "text-red-500 dark:text-red-400";
    if (percent < 85) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-500 dark:text-green-400";
}