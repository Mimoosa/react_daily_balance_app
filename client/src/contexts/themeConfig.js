
/*
Change colors to match our design

#66b343 - green bg
#4c8b2f - hover green bg
#ffffff - text
#0d557e - blue
#0b3c58 - hover blue
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
    },
    dark: {
        primary: 'text-white', // Main text color
        secondary: 'text-[#0d557e]', // Secondary text color
        alert: 'text-red-400', // Alerts and errors
        highlight: 'text-blue-400', // Links and highlights
        background: 'bg-gray-900', // Background color
        background2: 'bg-[#0d557e]', // Secondary background (e.g., cards)
        border: 'border-gray-600', // Borders
    },
};

