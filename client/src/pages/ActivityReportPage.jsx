import React from "react";
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';
import { ActicityReportService } from '../services/api';
import { useState, useEffect } from 'react';

/* const activities = [
  { text: "Went to the gym for 1 hour", category: "Physical", points: 20 },
  { text: "Studied for 3 hours", category: "Cognitive", points: 30 },
  { text: "Spent 2 hours chatting with a friend at a cafe", category: "Social", points: 20 },
  { text: "Stayed up 2 hours late", category: "Cognitive", points: -20 },
  { text: "Stayed up 2 hours late", category: "Physical", points: -20 },
]; */




const DailyActivityReport = () => {
  const theme = themes.light;
  const [journal, setJournal] = useState("");
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [totalPoints, setTotalPoints] = useState({});
  const [loading, setLoading] = useState(true);
 
  
    const labelIcons = {
          Physical: faDumbbell,
          Psychological: faHeart,
          Social: faUsers,
          Cognitive: faBrain
      }
  

  const fetchJournal = async () => {
    try {
        const data = await ActicityReportService.getTodaysEntry();
        
        setJournal(data);
    } catch (error) {
        setError('Failed to fetch journal entries');
    }
  };

  const fetchActivities = async (journal) => {
    try {
        const data = await ActicityReportService.getActivities(journal);
        setActivities(data);
    } catch (error) {
        setError('Failed to fetch activities');
    }
  };

  useEffect(() => {
      fetchJournal();
  }, []);

  useEffect(() => {
    if(journal){
      fetchActivities(journal);
    };
  }, [journal]);

  useEffect(() => {
    if (activities.length > 0) {  
      const calculateTotalPoints = (activities) => {
        return activities.reduce((acc, activity) => {
          acc[activity.category] = (acc[activity.category] || 0) + activity.points;
          return acc;
        }, {});
      };
      setTotalPoints(calculateTotalPoints(activities));
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
                    <p className="text-black ">{activity.text}</p>
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
                  <p className={`${points >= 0 ? 'text-green-600' : 'text-red-600'}`}> <FontAwesomeIcon icon={labelIcons[category]} size="lg" className="text-black mr-2"/>{category}: {points} points</p>
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
