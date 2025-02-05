
/*
Change colors to match our design

#66b343 - green bg
#4c8b2f - hover green bg
#ffffff - text
#0d557e - blue
#0b3c58 - hover blue
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
        backgroundActive: 'bg-violet-750', // Secondary background (e.g., cards)
        backgroundWhite: 'bg-white', // Secondary background (e.g., cards)
        border: 'border-gray-300', // Borders
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

