import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFire, faChartLine, faLightbulb} from '@fortawesome/free-solid-svg-icons';
import { dashboardService, userService } from '../services/api';

/**
 * Dashboard Page Component
 * 
 * Displays the user's wellbeing dashboard with:
 * - Total wellbeing scores by category
 * - Personalized wellbeing recommendations
 * - Daily streak counter
 * 
 * OPTIMIZATION: This component now fetches only the user's total points
 * instead of weekly points, reducing unnecessary API calls and using
 * the total points for both display and recommendation generation.
 */
const DashboardPage = () => {
  const { theme, isDark } = useTheme();
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalScores, setTotalScores] = useState({
    Physical: 0,
    Psychological: 0,
    Social: 0,
    Cognitive: 0
  });
  
  // Define maximum possible points per category
  const MAX_POINTS_PER_CATEGORY = 1000;

  /**
   * Fetches personalized recommendations based on user's scores
   * @param {Object} scores - User's scores by category
   */
  const fetchRecommendation = async (scores) => {
    try {
        const data = await dashboardService.recommendation(scores);
        setRecommendation(data);
    } catch (error) {
        setError('Failed to fetch recommendation');
    } finally {
        setLoading(false); 
    }
  };

  useEffect(() => {
    /**
     * Fetches user data on component mount
     * 
     * OPTIMIZATION: Only fetches total points and uses them for recommendations,
     * eliminating the need for a separate weekly points API call
     */
    const fetchData = async () => {
      try {
          // Fetch total accumulated points
          const totalPointsData = await userService.getTotalPoints();
          if (totalPointsData && totalPointsData.points) {
              setTotalScores(totalPointsData.points);
              // Use total points for recommendation
              fetchRecommendation(totalPointsData.points);
          }
      } catch (error) {
          setError('Failed to fetch data');
      } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dailyStreak = 5;
  const totalMax = Math.max(...Object.values(totalScores), 1); // Ensure non-zero for division
  
  return(
      <div className={`min-h-screen flex flex-col ${theme.backgroundWhite}`}>
        <div className={`py-8 px-6 ${isDark ? 'bg-violet-950/30' : 'bg-violet-50/70'} mb-6`}>
          <h1 className={`text-4xl font-bold text-center ${theme.textViolet} flex items-center justify-center gap-3`}>
            <FontAwesomeIcon icon={faChartLine} className={`${theme.textViolet}`} />
            Your Dashboard
          </h1>
        </div>
      
        <div className="flex flex-col items-center lg:items-stretch lg:flex-row lg:justify-center gap-6 px-4">
          <div className="w-full lg:w-2/5 max-w-xl">
              <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
                <FontAwesomeIcon icon={faChartLine} className={`${theme.textViolet}`} />
                Total Wellbeing Scores
              </h2>
              <div className={`${theme.backgroundCard} pt-6 pb-4 px-6 rounded-xl shadow-lg ${theme.cardShadow} transition-all duration-300 hover:shadow-xl`}>
                  <BarCharts data={totalScores} maxValue={totalMax} maxPossibleValue={MAX_POINTS_PER_CATEGORY} />
              </div>
          </div>
          
          <div className="w-full lg:w-2/5 max-w-xl">
              <h2 className={`text-center text-xl font-semibold ${theme.textViolet} mb-4 flex items-center justify-center gap-2`}>
                <FontAwesomeIcon icon={faLightbulb} className={`${theme.textViolet}`} />
                Wellbeing Recommendations
              </h2>
              <div 
                className={`${theme.backgroundCard} p-6 rounded-xl shadow-lg ${theme.cardShadow} transition-all duration-300 hover:shadow-xl`} 
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
              
              <div className="mt-6 flex items-center bg-gradient-to-r from-amber-300 to-orange-500 p-4 rounded-xl shadow-md">
                <div className="bg-white/90 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faFire} className="text-orange-500 text-xl" beat />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Daily Streak</p>
                  <p className="text-2xl font-bold text-white">{dailyStreak} days</p>
                </div>
              </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;
