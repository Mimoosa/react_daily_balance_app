import { useTheme } from "../contexts/ThemeContext"; 

const JournalPage = () => {
    const { theme } = useTheme(); 

    return (
        <div className={`h-screen w-full ${theme.background} flex flex-col`}>
            <div className="flex flex-col items-center justify-center flex-grow">
                <h2 className="text-4xl font-bold text-black dark:text-white mb-6">Daily Journal</h2>
                <div className="bg-white border border-black p-6 rounded-xl shadow-lg w-[500px]">
                    <textarea
                        className="w-full h-32 p-3 border border-black rounded-lg focus:outline-none bg-white text-black"
                        placeholder="How was your day? Share your activities and experiences..."
                    />
                    <button className="mt-4 bg-violet-700 text-white py-2 px-4 rounded-lg w-full hover:bg-violet-900">
                        Analyze My Day
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalPage;
