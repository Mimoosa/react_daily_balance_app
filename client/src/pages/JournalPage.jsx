import { useTheme } from "../contexts/ThemeContext";
import { themes } from '../contexts/themeConfig';

const JournalPage = () => {
    const { theme } = useTheme(); 
    const themeLight = themes.light;
    

    return (
        <div className={`h-full w-full ${theme.background} flex flex-col`}>
            <div className="flex flex-col items-center justify-center flex-grow">
                <h2 className="text-4xl font-bold mb-6">Daily Journal</h2>
                <div className="bg-white border border-black p-6 rounded-xl shadow-lg md:w-[500px] lg:w-[500px]">
                    <textarea
                        className="w-full h-32 p-3 border border-black rounded-lg focus:outline-none bg-white text-black"
                        placeholder="How was your day? Share your activities and experiences..."
                    />
                    <button className={`mt-4 ${themeLight.backgroundViolet} text-white py-2 px-4 rounded-lg w-full hover:bg-violet-900 rounded-md transition duration-200`}>
                        Analyze My Day
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalPage;
