import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '@fortawesome/free-solid-svg-icons';
import { ActicityReportService } from '../services/api';


/**
 * Transforms activities into a structured format for rendering.
 * 
 * @param {Array} activities - Array of activity objects.
 * @returns {Array} Transformed array of activities with categorized points.
 */
const transformActivities = (activities) => {
  const transformed = {};

  activities.forEach((activity) => {
    if (!transformed[activity.text]) {
      transformed[activity.text] = { text: activity.text, categories: [] };
    }
    transformed[activity.text].categories.push({ category: activity.category, points: activity.points });
  });

  return Object.values(transformed);
};

/**
 * DailyActivityReport Component
 * Displays the daily activity report including a summary and total points.
 * 
 * @component
 */
const DailyActivityReport = () => {
  const { theme } = useTheme();
  const [journal, setJournal] = useState(JSON.parse(localStorage.getItem("journal")) || false);
  const [activities, setActivities] = useState(JSON.parse(localStorage.getItem("activities") || "[]"));
  const [error, setError] = useState('');
  const [totalPoints, setTotalPoints] = useState({});
  const [loading, setLoading] = useState(true);

  const labelIcons = {
    Physical: faDumbbell,
    Psychological: faHeart,
    Social: faUsers,
    Cognitive: faBrain
  };

  /**
   * Fetches the journal entry for today.
   * Updates the local storage and state with the fetched data.
   */
  const fetchJournal = async () => {
    try {
      const data = await ActicityReportService.getTodaysEntry();
      if (JSON.stringify(data.content) !== JSON.stringify(journal)) {
        setJournal(data.content);
        fetchActivities(data.content);
      }
      localStorage.setItem("journal", JSON.stringify(data.content));
    } catch (error) {
      setError('Failed to fetch journal entries');
      setLoading(false);
      console.log(error);
    }
  };

  const fetchActivities = async (journal) => {
    try {
      console.log(journal)
      const data = await ActicityReportService.getActivities(journal);
      localStorage.setItem("activities", JSON.stringify(data)); 
      setActivities(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch activities');
      console.log(error);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
        /**
       * Calculates total points for each category based on activities.
       * 
       * @param {Array} activities - Array of activity objects.
       * @returns {Object} Total points for each category.
       */
      const calculateTotalPoints = (activities) => {
        const initialPoints = {
          Physical: 0,
          Psychological: 0,
          Social: 0,
          Cognitive: 0,
        };
        return activities.reduce((acc, activity) => {
          acc[activity.category] = (acc[activity.category] || 0) + activity.points;
          return acc;
        }, initialPoints);
      };
      /**
       * Normalizes points to ensure no category exceeds 100 points.
       * 
       * @param {Object} points - Object containing points for each category.
       * @returns {Object} Normalized points for each category.
       */
      const normalizePoints = (points) => {
        Object.keys(points).forEach((key) => {
          if (points[key] > 100) {
            points[key] = 100;
          }
        });
        return points;
      };

      const points = calculateTotalPoints(activities);
      const normalizedPoints = normalizePoints(points);
      setTotalPoints(normalizedPoints);

      // Save points to the database
      ActicityReportService.savePoints(points).catch(error => {
        console.error('Failed to save points:', error);
      });

      setLoading(false);
    }
  }, [activities]);

  const transformedActivities = useMemo(() => transformActivities(activities), [activities]);

  return (
    <div className={`min-h-screen flex flex-col ${theme.backgroundWhite}`}>
      <h2 className={`text-4xl font-bold text-center py-6 ${theme.textViolet}`}>Daily Activity Report</h2>

      <div className="flex flex-col items-center">
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div>
            <h3 className={`text-xl text-center font-semibold mb-3 lg:mt-2 ${theme.textViolet}`}>Daily Summary</h3>
            <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg ${theme.cardShadow} w-80 lg:w-100`} style={{ height: '300px', overflowY: 'auto' }}>
              {loading ? (
                <p className={theme.textSecondary}>Fetching data... Please wait.</p>
              ) : error ? (
                <p className={theme.alert}>{error}</p>
              ) : (
                <ul>
                  {transformedActivities.map((activity, index) => (
                    <li key={index} className="mb-2">
                      <p className={theme.textSecondary}>{activity.text}</p>
                      {activity.categories.map((category, catIndex) => (
                        <p key={catIndex} className={category.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <FontAwesomeIcon 
                            icon={labelIcons[category.category]} 
                            size="lg" 
                            className={`${theme.textViolet} mr-2`} 
                          />
                          {category.category}: {category.points} points
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className={`text-xl text-center font-semibold mb-3 lg:mt-2 ${theme.textViolet}`}>Total Points</h3>
            <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg ${theme.cardShadow} w-80 lg:w-100`} style={{ height: '300px'}}>
              {loading ? (
                <p className={theme.textSecondary}>Fetching data... Please wait.</p>
              ) : error ? (
                <p className={theme.alert}>{error}</p>
              ) : (
                <ul>
                  {Object.entries(totalPoints).map(([category, points], index) => (
                    <li key={index} className="mb-2">
                      <p className={points >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <FontAwesomeIcon 
                          icon={labelIcons[category]} 
                          size="lg" 
                          className={`${theme.textViolet} mr-2`}
                        />
                        {category}: {points} points
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivityReport;
