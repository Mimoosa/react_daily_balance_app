import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { FaBook, FaRegEdit, FaChartBar, FaUsers, FaUserAlt, FaTrashAlt } from 'react-icons/fa';

const InstructionPage = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl w-full">
                <h1 className="text-5xl font-extrabold text-center text-blue-900 mb-8  transform transition-all duration-500 ease-in-out" style={{ transform: animate ? 'scale(1)' : 'scale(0.95)' }}>
                    Welcome to <span className="text-blue-500">Daily Balance</span>!
                </h1>
                <p className="text-xl text-center text-blue-700 mb-10">
                    We’re thrilled to have you with us! Here's a quick guide to get you started.
                </p>
    
                <div className="space-y-10">
                    <div>
                        <h2 className="flex items-center text-3xl font-semibold text-blue-900 mb-4">
                            <FaBook className="mr-3 text-blue-500" />
                            Daily Journal
                        </h2>
                        <ul className="list-disc ml-8 text-blue-700 space-y-2">
                            <li>Share your thoughts in your daily journal.</li>
                            <li>Look back at your past entries anytime on the Journal page.</li>
                            <li>Get  AI feedback on your day.</li>
                            <li>Edit your entry whenever you like.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className="flex items-center text-3xl font-semibold text-blue-900 mb-4">
                            <FaChartBar className="mr-3 text-blue-500" />
                            Daily Activity Page
                        </h2>
                        <ul className="list-disc ml-8 text-blue-700 space-y-2">
                            <li>Check your scores for physical, mental, social, and creative areas.</li>
                            <li>See your total points for the day.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className="flex items-center text-3xl font-semibold text-blue-900 mb-4">
                            <FaChartBar className="mr-3 text-blue-500" />
                            Dashboard
                        </h2>
                        <ul className="list-disc ml-8 text-blue-700 space-y-2">
                            <li>Track your total points for the week.</li>
                            <li>Get tips to boost the area that needs the most improvement.</li>
                            <li>Keep up with your daily journaling streak.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className="flex items-center text-3xl font-semibold text-blue-900 mb-4">
                            <FaUsers className="mr-3 text-blue-500" />
                            Friends
                        </h2>
                        <ul className="list-disc ml-8 text-blue-700 space-y-2">
                            <li>Find friends by username and send friend requests.</li>
                            <li>Check out your friends' dashboards and see how they're doing.</li>
                            <li>Accept or manage friend requests as needed.</li>
                        </ul>
                    </div>
    
                    <div>
                        <h2 className="flex items-center text-3xl font-semibold text-blue-900 mb-4">
                            <FaUserAlt className="mr-3 text-blue-500" />
                            Profile
                        </h2>
                        <ul className="list-disc ml-8 text-blue-700 space-y-2">
                            <li>Update your profile info.</li>
                            <li>Delete your account if you need to.</li>
                        </ul>
                    </div>
                </div>
                
                <>
                <style>
                    {scaleInOut}
                </style>
                <div className="text-center mt-10">
                    <Link
                        to="/home"
                        className="inline-block bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-md animate-scale"
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
