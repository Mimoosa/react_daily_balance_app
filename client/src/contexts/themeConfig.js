/*
Change colors to match our design

--
#B1A3FF - bar chart color 1
#818DED - bar chart color 2
#6D65CC - bar chart color 3
#494393 - bar chart color 4
#F3F3F3 - card background
*/

/*
Assign colors to variables
*/
export const themes = {
    light: {
        textWhite: 'text-white', // Main text color
        textViolet: 'text-violet', // Secondary text color
        alert: 'text-red-600', // Alerts and errors
        highlight: 'text-blue-600', // Links and highlights
        backgroundViolet: 'bg-violet-950', // Background color
        backgroundActive: 'bg-violet-700', // Secondary background (e.g., cards)
        backgroundCard: 'bg-[#F3F3F3]',
        backgroundWhite: 'bg-white', // Secondary background (e.g., cards)
        border: 'border-gray-300', // Borders
        barChart1: 'bg-[#B1A3FF]',
        barChart2: 'bg-[#818DED]',
        barChart3: 'bg-[#6D65CC]',
        barChart4: 'bg-[#494393]',
        textSecondary: 'text-gray-600', // Secondary text color
        backgroundHover: 'hover:bg-violet-900', // Hover state
        inputBackground: 'bg-white', // Form input background
        cardShadow: 'shadow-gray-200/50', // Custom shadow
        divider: 'border-gray-200', // Divider color
    },
    dark: {
        textWhite: 'text-gray-100', // Slightly off-white for better contrast
        textViolet: 'text-violet-300', // Lighter violet for better visibility on dark
        alert: 'text-red-400', // Brighter red for dark mode
        highlight: 'text-violet-400', // Violet highlight instead of blue
        backgroundViolet: 'bg-violet-900', // Slightly lighter violet for better contrast
        backgroundActive: 'bg-violet-600', // Brighter active state
        backgroundCard: 'bg-gray-800', // Dark card background
        backgroundWhite: 'bg-gray-900', // Dark background instead of white
        border: 'border-gray-700', // Darker borders
        barChart1: 'bg-[#C4B9FF]', // Brighter chart colors for dark mode
        barChart2: 'bg-[#9AA3FF]',
        barChart3: 'bg-[#8680E6]',
        barChart4: 'bg-[#6A64CC]',
        textSecondary: 'text-violet-400', // Secondary text color
        backgroundHover: 'hover:bg-violet-800', // Hover state
        inputBackground: 'bg-gray-700', // Form input background
        cardShadow: 'shadow-violet-900/20', // Custom shadow with violet tint
        divider: 'border-gray-700', // Divider color
    },
};

