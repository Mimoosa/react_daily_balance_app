import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFire, faChartLine, faLightbulb, faExclamationCircle, faTrophy, faCalendarWeek, faRefresh} from '@fortawesome/free-solid-svg-icons';
import { dashboardService, userService } from '../services/api';
import { useScreenContext } from '../contexts/ScreenContext'

/**
 * Dashboard Page Component
 * 
 * Displays the user's wellbeing dashboard with:
 * - Total wellbeing scores by category
 * - Personalized wellbeing recommendations
 * - Daily streak counter
 * - Weekly points tracking
 */
const DashboardPage = () => {
  const { theme, isDark } = useTheme();
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isLargeScreen } = useScreenContext();
  const [totalScores, setTotalScores] = useState({
    Physical: 0,
    Psychological: 0,
    Social: 0,
    Cognitive: 0
  });
  const [weeklyScores, setWeeklyScores] = useState({
    Physical: 100,
    Psychological: 100,
    Social: 100,
    Cognitive: 100
  });
  const [weekInfo, setWeekInfo] = useState({
    weekStartDate: null,
    weekEndDate: null
  });
  const [streak, setStreak] = useState({
    currentStreak: 0,
    bestStreak: 0,
    lastEntryDate: null
  });
  
  // Define maximum possible points per category
  const MAX_POINTS_PER_CATEGORY = 1000;
  const MAX_WEEKLY_POINTS = 200; // Maximum weekly points to display in chart

  // Animation states
  const [cardsVisible, setCardsVisible] = useState(false);

  /**
   * Fetches personalized recommendations based on user's scores
   * @param {Object} scores - User's scores by category
   */
  const fetchRecommendation = async (scores) => {
    try {
        const data = await dashboardService.recommendation(scores);
        setRecommendation(data);
    } catch (error) {
        console.error("Failed to fetch recommendation:", error);
        setError('Failed to fetch recommendation');
    } finally {
        setLoading(false); 
    }
  };

  useEffect(() => {
    /**
     * Fetches user data on component mount
     */
    const fetchData = async () => {
      try {
          setLoading(true);
          console.log("[DEBUG] DashboardPage - Fetching user data");
          
          // Fetch total accumulated points, weekly points, and streak in parallel
          const [totalPointsData, weeklyPointsData, streakData] = await Promise.all([
            userService.getTotalPoints(),
            dashboardService.getWeeklyPoints(),
            userService.getStreak()
          ]);
          
          console.log("[DEBUG] DashboardPage - Data received:", {
            points: totalPointsData,
            weeklyPoints: weeklyPointsData,
            streak: streakData
          });
          
          // Process total points
          if (totalPointsData && totalPointsData.points) {
              console.log("[DEBUG] DashboardPage - Setting points:", totalPointsData.points);
              
              // Make sure we have all required categories with at least 0 values
              const validPoints = {
                Physical: totalPointsData.points.Physical || 0,
                Psychological: totalPointsData.points.Psychological || 0,
                Social: totalPointsData.points.Social || 0,
                Cognitive: totalPointsData.points.Cognitive || 0,
                ...totalPointsData.points // Add any additional categories
              };
              
              setTotalScores(validPoints);
              // Use total points for recommendation
              fetchRecommendation(validPoints);
          } else {
              console.log("[DEBUG] DashboardPage - No points found in response or invalid structure");
              setError("Could not retrieve user points");
              setLoading(false);
          }
          
          // Process weekly points
          if (weeklyPointsData && weeklyPointsData.weeklyPoints) {
              console.log("[DEBUG] DashboardPage - Setting weekly points:", weeklyPointsData.weeklyPoints);
              
              // Make sure we have all required categories with at least 0 values
              const validWeeklyPoints = {
                Physical: weeklyPointsData.weeklyPoints.Physical || 100,
                Psychological: weeklyPointsData.weeklyPoints.Psychological || 100,
                Social: weeklyPointsData.weeklyPoints.Social || 100,
                Cognitive: weeklyPointsData.weeklyPoints.Cognitive || 100
              };
              
              setWeeklyScores(validWeeklyPoints);
              
              // Set week info
              if (weeklyPointsData.weekStartDate && weeklyPointsData.weekEndDate) {
                setWeekInfo({
                  weekStartDate: new Date(weeklyPointsData.weekStartDate),
                  weekEndDate: new Date(weeklyPointsData.weekEndDate)
                });
              }
          }
          
          // Update streak information
          if (streakData) {
            setStreak({
              currentStreak: streakData.currentStreak || 0,
              bestStreak: streakData.bestStreak || 0,
              lastEntryDate: streakData.lastEntryDate
            });
          }
          
          setLoading(false);
      } catch (error) {
          console.error("[ERROR] DashboardPage - Failed to fetch data:", error);
          setError('Failed to fetch data: ' + error.message);
          setLoading(false);
      }
    };

    fetchData();

    // Trigger card animations with slight delay after component mounts
    setTimeout(() => {
      setCardsVisible(true);
    }, 300);
  }, []);

  const totalMax = Math.max(...Object.values(totalScores), 1); // Ensure non-zero for division
  const weeklyMax = Math.max(...Object.values(weeklyScores), 1); // Ensure non-zero for division
  
  // Format dates for display
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return(
      <div className={`flex flex-col ${theme.backgroundWhite}`} style={isLargeScreen ? { height: `calc(100vh - 64px)`} : {}}>
        <div className={`py-8 px-6 ${isDark ? 'bg-violet-950/30' : 'bg-violet-50/70'} mb-6
                       transition-all duration-700 animate-fadeDown`}>
          <h1 className={`text-3xl lg:text-4xl font-bold text-center ${theme.textViolet} flex items-center justify-center gap-3`}>
            <FontAwesomeIcon icon={faChartLine} className={`${theme.textViolet} animate-pulse`} />
            Your Dashboard
          </h1>
        </div>
      
        <div className="flex flex-col items-center lg:items-stretch lg:flex-row lg:justify-center gap-6 px-4">
          <div className={`w-full lg:w-2/5 max-w-xl transition-all duration-500 transform
                         ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
                <FontAwesomeIcon icon={faChartLine} className={`${theme.textViolet}`} />
                Total Wellbeing Scores
              </h2>
              <div className={`${theme.backgroundCard} pt-6 pb-4 px-6 rounded-xl shadow-lg ${theme.cardShadow} 
                             transition-all duration-500 hover:shadow-xl`}>
                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-4`}></div>
                        <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-2`}></div>
                        <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'}`}></div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center py-8">
                      <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-3xl mb-3" />
                      <p className={`${theme.alert} text-center`}>{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
                      >
                        Reload Page
                      </button>
                    </div>
                  ) : (
                    <BarCharts data={totalScores} maxValue={totalMax} maxPossibleValue={MAX_POINTS_PER_CATEGORY} />
                  )}
              </div>
              
              {/* Weekly Points Card */}
              <div className="mt-6">
                <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
                  <FontAwesomeIcon icon={faCalendarWeek} className={`${theme.textViolet}`} />
                  Weekly Points
                  {weekInfo.weekStartDate && (
                    <span className={`text-sm ${theme.textSecondary}`}>
                      ({formatDate(weekInfo.weekStartDate)} - {formatDate(weekInfo.weekEndDate)})
                    </span>
                  )}
                </h2>
                <div className={`${theme.backgroundCard} pt-6 pb-4 px-6 rounded-xl shadow-lg ${theme.cardShadow} 
                               transition-all duration-500 hover:shadow-xl`}>
                    {loading ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-4`}></div>
                          <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-2`}></div>
                          <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'}`}></div>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center py-8">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-3xl mb-3" />
                        <p className={`${theme.alert} text-center`}>{error}</p>
                      </div>
                    ) : (
                      <>
                        <BarCharts data={weeklyScores} maxValue={weeklyMax} maxPossibleValue={MAX_WEEKLY_POINTS} />
                        <div className="mt-2 text-center">
                          <p className={`text-xs ${theme.textSecondary} italic flex items-center justify-center gap-1`}>
                            <FontAwesomeIcon icon={faRefresh} className="text-xs" />
                            Points reset to 100 every Sunday
                          </p>
                        </div>
                      </>
                    )}
                </div>
              </div>
          </div>
          
          <div className={`w-full lg:w-2/5 max-w-xl transition-all duration-500 transform
                         ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '200ms' }}>
              <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
                <FontAwesomeIcon icon={faLightbulb} className={`${theme.textViolet}`} />
                Wellbeing Recommendations
              </h2>
              <div 
                className={`${theme.backgroundCard} p-6 rounded-xl shadow-lg ${theme.cardShadow}
                          transition-all duration-500 hover:shadow-xl`} 
                style={{ minHeight: '225px', maxHeight: '275px', overflowY: 'auto' }}
              >
              {loading ? ( 
                <div className="flex justify-center items-center h-full">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-4`}></div>
                    <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'} mb-2`}></div>
                    <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-violet-200'}`}></div>
                  </div>
                </div>
              ) : error ? ( 
                <p className={`${theme.alert} flex items-center gap-2`}>
                  <FontAwesomeIcon icon="exclamation-circle" />
                  {error}
                </p>
              ) : (
                <>
                  <p className={`${theme.textSecondary} font-medium`}>
                    The way to improve your <span className={`${theme.textViolet} font-bold`}>{recommendation.category}</span> field is as follows:
                  </p>
                  <div className="mt-4 flex items-start">
                    <div className={`${theme.backgroundViolet} p-3 rounded-full mr-4 flex-shrink-0`}>
                      <FontAwesomeIcon icon={faLightbulb} className={`${theme.textWhite}`} />
                    </div>
                    <p className={`${theme.textSecondary} leading-relaxed`}>{recommendation.advice}</p>
                  </div>
                </>
              )}
              </div>
              <div className={`flex justify-center items-center lg:justify-start mb-10 lg:mb-0 
                              transform transition-all duration-700 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{ transitionDelay: '400ms' }}>
              <div className="mt-6 w-full lg:w-1/2 flex items-center bg-gradient-to-r from-amber-300 to-orange-500 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="bg-white/90 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faFire} className="text-orange-500 text-xl animate-flame" />
                </div>
                <div>
                  <p className="text-sm pr-2 font-medium text-white">Daily Streak</p>
                  <p className="text-xl lg:text-2xl font-bold text-white animate-number">{streak.currentStreak} days</p>
                </div>
                {streak.bestStreak > 0 && streak.bestStreak > streak.currentStreak && (
                  <div className="flex flex-col items-center animate-bounce-soft">
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-300 text-lg" />
                    <p className="text-xs text-white">Best: {streak.bestStreak}</p>
                  </div>
                )}
              </div>
              </div>
          </div>
        </div>
        
        {/* Add the keyframes for new animations */}
        <style jsx>{`
          @keyframes fadeDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeDown {
            animation: fadeDown 0.8s ease-out forwards;
          }
          
          @keyframes flame {
            0% { transform: scale(0.9); opacity: 0.9; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.9; }
          }
          .animate-flame {
            animation: flame 1.5s infinite;
          }
          
          @keyframes number {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .animate-number {
            animation: number 2s ease-in-out 1;
          }
          
          @keyframes bounce-soft {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-soft {
            animation: bounce-soft 2s infinite;
          }
        `}</style>
      </div>
  );
};

export default DashboardPage;
