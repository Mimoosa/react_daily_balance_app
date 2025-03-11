import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faFire, faTrophy, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import BarCharts from '../BarCharts';
import { friendsService } from '../../services/api';

const FriendDashboard = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendData, setFriendData] = useState(null);

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        setLoading(true);
        const data = await friendsService.getFriendDashboard(friendId);
        console.log('Friend dashboard data:', data);
        setFriendData(data);
      } catch (err) {
        console.error('Error fetching friend data:', err);
        setError('Could not load friend\'s dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-violet-600 hover:text-violet-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Go Back
        </button>
      </div>
    );
  }

  const streakData = friendData?.streak || {
    currentStreak: 0,
    bestStreak: 0
  };

  return (
    <div className={`flex flex-col ${theme.backgroundWhite} min-h-[calc(100vh-64px)]`}>
      <div className={`py-8 px-6 ${isDark ? 'bg-violet-950/30' : 'bg-violet-50/70'}`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-violet-600 hover:text-violet-700 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <h1 className={`text-3xl lg:text-4xl font-bold text-center ${theme.textViolet}`}>
            {friendData.username}'s Dashboard
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
            <FontAwesomeIcon icon={faChartLine} />
            Wellbeing Scores
          </h2>
          <div className={`${theme.backgroundCard} pt-6 pb-4 px-6 rounded-xl shadow-lg ${theme.cardShadow}`}>
            <BarCharts data={friendData.points} maxValue={Math.max(...Object.values(friendData.points))} />
          </div>

          <div className="flex justify-center mt-6">
            <div className="w-full lg:w-1/2 flex items-center bg-gradient-to-r from-amber-300 to-orange-500 p-4 rounded-xl shadow-md">
              <div className="bg-white/90 p-3 rounded-full mr-4">
                <FontAwesomeIcon icon={faFire} className="text-orange-500 text-xl" />
              </div>
              <div>
                <p className="text-sm pr-2 font-medium text-white">Daily Streak</p>
                <p className="text-xl lg:text-2xl font-bold text-white">
                  {streakData.currentStreak} days
                </p>
              </div>
              {streakData.bestStreak > 0 && streakData.bestStreak > streakData.currentStreak && (
                <div className="flex flex-col items-center ml-auto">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-300 text-lg" />
                  <p className="text-xs text-white">Best: {streakData.bestStreak}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendDashboard; 