import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faBook, faChartSimple, faUser, faUsers, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../contexts/ThemeContext";

const InstructionPage = () => {
    const [animate, setAnimate] = useState(false);
    const { theme, isDark } = useTheme();
    // useEffect hook to trigger the animation on component mount.
    useEffect(() => {
        setAnimate(true);
    }, []);
    // CSS keyframes for a smooth scaling animation.
    const scaleInOut = `
        @keyframes scale-in-out {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
        .animate-scale {
            animation: scale-in-out 2s ease-in-out infinite;
        }
    `;
    
    return (
        <div className={`min-h-screen flex items-center justify-center ${theme.backgroundWhite} p-6`}>
            <div className={`${theme.backgroundCard} rounded-xl shadow-2xl p-8 max-w-3xl w-full`}>
                <h1 className={`text-4xl lg:text-5xl font-extrabold text-center ${theme.textViolet} mb-8 transform transition-all duration-1500 ease-in-out`} style={{ transform: animate ? 'scale(1)' : 'scale(1.2)' }}>
                    <span className="block lg:inline">Welcome to</span> <span className={isDark ? 'text-violet-500' : 'text-violet-950'}>Daily Balance</span>!
                </h1>
                <p className={`text-lg lg:text-xl text-center ${theme.textViolet} mb-10`}>
                    We’re thrilled to have you with us! Here's a quick guide to get you started.
                </p>
    
                <div className="space-y-10">
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={faBook} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            Daily Journal
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Share your thoughts in your daily journal.</li>
                            <li>Look back at your past entries anytime on the Journal page.</li>
                            <li>Get  AI feedback on your day.</li>
                            <li>Edit your entry whenever you like.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={faCalendarDay} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            Daily Activity Report
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Check your scores for physical, mental, social, and creative areas.</li>
                            <li>See your total points for the day.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={faChartSimple} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            Dashboard
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Track your total points for the week.</li>
                            <li>Get tips to boost the area that needs the most improvement.</li>
                            <li>Keep up with your daily journaling streak.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={faUsers} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            Friends
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Find friends by username and send friend requests.</li>
                            <li>Check out your friends' dashboards and see how they're doing.</li>
                            <li>Accept or manage friend requests as needed.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={faUser} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            Profile
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Update your profile info.</li>
                            <li>Delete your account if you need to.</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className={`flex items-center text-2xl lg:text-3xl font-semibold ${theme.textViolet} mb-4`}>
                            <FontAwesomeIcon icon={isDark ? faSun : faMoon} className={`mr-3 text-2xl lg:text-3xl ${isDark ? 'text-violet-500' : 'text-violet-950'}`} />
                            <span className="block lg:inline">Dark Mode <br className="lg:hidden" />/ Light Mode</span>
                        </h2>
                        <ul className={`list-disc ml-8 ${theme.textViolet} space-y-2`}>
                            <li>Press the moon or sun icon in the navbar to toggle between dark and light modes.</li>
                        </ul>
                    </div>

                </div>
                
                <>
                <style>
                    {scaleInOut}
                </style>
                <div className="text-center mt-10">
                    <Link
                        to="/journal"
                        className={`inline-block ${isDark ? 'bg-violet-500' : 'bg-violet-950'} text-white font-bold py-3 px-8 rounded-md shadow-md animate-scale`}
                    >
                        Get Started!
                    </Link>
                </div>
                </>
            </div>
        </div>
    );
};

export default InstructionPage;
