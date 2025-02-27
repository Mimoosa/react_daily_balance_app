import React, { useState, useEffect } from "react";
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';
import { ActicityReportService } from '../services/api';

const DailyActivityReport = () => {
  const theme = themes.light;
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

  const fetchJournal = async () => {
    try {
      const data = await ActicityReportService.getTodaysEntry();
      if (JSON.stringify(data.content) !== JSON.stringify(journal)) {
        setJournal(data.content);
        fetchActivities(data.content);
      }
      localStorage.setItem("journal", JSON.stringify(data.content));

   /*    // If points already exist, use them instead of generating new ones
      if (data.points) {
        console.log("yes")
        setTotalPoints(data.points);
        setLoading(false);
      } else {
        // Only fetch activities if points don't exist
        fetchActivities(data.content);
      } */
    } catch (error) {
      setError('Failed to fetch journal entries');
      setLoading(false);
      console.log(error);
    }
  };

  const fetchActivities = async (journal) => {
    try {
      const data = await ActicityReportService.getActivities(journal);
      localStorage.setItem("activities", JSON.stringify(data)); 
      setActivities(data)
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
      const points = calculateTotalPoints(activities);
      setTotalPoints(points);

      // Save points to the database
      ActicityReportService.savePoints(points).catch(error => {
        console.error('Failed to save points:', error);
      });

      setLoading(false);
    }
  }, [activities]);

  return (
    <div className="h-full">
      <div className="flex flex-col items-center mt-6">
        <h2 className="text-4xl font-bold">Daily Activity Report</h2>

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div>
            <h3 className="text-xl text-center font-semibold mb-3 lg:mt-2">Daily Summary</h3>
            <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg w-80`} style={{ height: '300px', overflowY: 'auto' }}>
              {loading ? (
                <p className="text-black">Fetching data... Please wait.</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ul>
                  {activities.map((activity, index) => (
                    <li key={index} className="mb-2">
                      <p className="text-black">{activity.text}</p>
                      <p className={`${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <FontAwesomeIcon icon={labelIcons[activity.category]} size="lg" className="text-black mr-2" />
                        {activity.category}: {activity.points} points
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl text-center font-semibold mb-3 lg:mt-2">Total Points</h3>
            <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg w-80`} style={{ height: '300px'}}>
              {loading ? (
                <p className="text-black">Fetching data... Please wait.</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ul>
                  {Object.entries(totalPoints).map(([category, points], index) => (
                    <li key={index} className="mb-2">
                      <p className={`${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <FontAwesomeIcon icon={labelIcons[category]} size="lg" className="text-black mr-2"/>
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
