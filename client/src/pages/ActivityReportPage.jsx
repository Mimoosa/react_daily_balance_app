import React from "react";
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';
import { ActivityReportService, userService } from '../services/api';
import { useState, useEffect } from 'react';

const DailyActivityReport = () => {
  const theme = themes.light;
  const [journal, setJournal] = useState("");
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [totalPoints, setTotalPoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [activitiesProcessed, setActivitiesProcessed] = useState(false);
 
  const labelIcons = {
    Physical: faDumbbell,
    Psychological: faHeart,
    Social: faUsers,
    Cognitive: faBrain
  };
  
  const fetchJournal = async () => {
    try {
      const data = await ActivityReportService.getTodaysEntry();
      setJournal(data.content);
      
      // Check if activities are already processed
      if (data.activitiesProcessed && data.points && data.activities?.length > 0) {
        console.log("Activities already processed, using stored data");
        setTotalPoints(data.points);
        setActivities(data.activities);
        setActivitiesProcessed(true);
      } else {
        console.log("Activities not processed yet, will analyze");
        setActivitiesProcessed(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching journal:", error);
      setError('Failed to fetch journal entries. Please create a journal entry first.');
      setLoading(false);
    }
  };

  const generateActivities = async () => {
    if (!journal) {
      setError('No journal content found to analyze');
      return;
    }

    try {
      setLoading(true);
      console.log("Generating activities for journal");
      const data = await ActivityReportService.getActivities(journal);
      console.log("Generated activities:", data);
      setActivities(data);
      
      // Calculate total points
      const calculatedPoints = data.reduce((acc, activity) => {
        if (!acc[activity.category]) acc[activity.category] = 0;
        acc[activity.category] += activity.points;
        return acc;
      }, {});
      
      console.log("Calculated points:", calculatedPoints);
      setTotalPoints(calculatedPoints);
      
      // Save points to database
      await ActivityReportService.savePoints(calculatedPoints, data);
      
      // Update user's total points
      await userService.updatePoints(calculatedPoints);
      
      setActivitiesProcessed(true);
      setLoading(false);
    } catch (error) {
      console.error("Error generating activities:", error);
      setError('Failed to analyze activities: ' + error.message);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJournal();
  }, []);

  // Generate activities when journal is loaded and not already processed
  useEffect(() => {
    if (journal && !activitiesProcessed && !loading) {
      generateActivities();
    }
  }, [journal, activitiesProcessed, loading]);

  // Generate button handler for manual regeneration
  const handleRegenerateClick = async () => {
    if (window.confirm('This will recalculate your points for today. Continue?')) {
      try {
        setLoading(true);
        
        // Reset the processing flag on the server
        // The server now handles reversing the points from the user's total
        await ActivityReportService.resetProcessingFlag();
        
        // Step 3: Clear current state
        setActivitiesProcessed(false);
        setActivities([]);
        setTotalPoints({});
        
        // Step 4: Generate new activities and points
        // The server will add these new points to the user's total
        generateActivities();
      } catch (error) {
        console.error("Error during recalculation:", error);
        setError('Failed to recalculate: ' + error.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col items-center mt-6">
        <h2 className="text-4xl font-bold">Daily Activity Report</h2>
        
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div>
          <h3 className="text-xl text-center font-semibold mb-3 lg:mt-2">Daily Summary</h3>
          <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg w-80`} style={{ height: '300px', overflowY: 'auto' }}>
            {loading ? (
              <p className="text-black">Analyzing your activities... Please wait.</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : activities.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-4">No activities analyzed yet.</p>
                {journal && (
                  <button 
                    className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
                    onClick={generateActivities}
                  >
                    Generate Analysis
                  </button>
                )}
              </div>
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
              <p className="text-black">Calculating points... Please wait.</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : Object.keys(totalPoints).length === 0 ? (
              <p className="text-gray-500">No points calculated yet.</p>
            ) : (
              <>
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
                {activitiesProcessed && (
                  <p className="mt-4 text-sm text-gray-500">
                    These points have been added to your profile.
                  </p>
                )}
                {activitiesProcessed && (
                  <button
                    className="mt-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    onClick={handleRegenerateClick}
                  >
                    Recalculate
                  </button>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivityReport;
