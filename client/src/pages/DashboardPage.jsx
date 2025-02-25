import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFire} from '../contexts/icons'
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
  const theme = themes.light; 
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
      <div className="h-full">
      <h1 className="text-4xl font-bold mb-6 text-center mt-6">Your Dashboard</h1>
      
      <div className="flex flex-col items-center h-full lg:items-start lg:flex-row lg:justify-center">
        <div className="w-[90%] h-full lg:w-2/5 mt-4 lg:mt-0">
            <h2 className="text-center text-xl font-semibold">Total Wellbeing Scores</h2>
            <div className={`${theme.backgroundCard} pt-6 pb-2 px-4 rounded-md mt-4 flex flex-col justify-center shadow-lg`}>
                <BarCharts data={totalScores} maxValue={totalMax} maxPossibleValue={MAX_POINTS_PER_CATEGORY} />
            </div>
        </div>
        
        <div className="w-[90%] h-full lg:w-2/5 mt-4 lg:mt-0 lg:ml-4">
            <h2 className="text-center text-xl font-semibold">Wellbeing Recommendations</h2>
            <div className={`${theme.backgroundCard} h-1/2 p-6 rounded-md mt-4 shadow-lg`} style={{ height: '225px', overflowY: 'auto' }}>
            {loading ? ( 
              <p className="text-black">Fetching recommendation... Please wait.</p>
            ) : error ? ( 
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <p className="text-black">The way to improve your <strong>{recommendation.category}</strong> field is as follows:</p>
                <p className="text-black">{recommendation.advice}</p>
                <p className="text-black">Let's strive for a balanced and fulfilling life together with Daily Balance!</p>  
              </>
            )}
            </div>
        </div>
      </div>
      
      <div className="w-[90%] mx-auto mt-4 lg:w-4/5">
          <h2 className="text-center text-xl font-semibold">Daily Streak</h2>
          <div className={`${theme.backgroundCard} h-1/2 text-xl p-4 font-bold rounded-md mt-4 shadow-lg`}>
              <p className="text-black text-center">{dailyStreak} Days<FontAwesomeIcon icon={faFire} size="xl" className="ml-2 text-red-500" /></p>
          </div>
      </div>
      </div>
  );
};

export default DashboardPage;
