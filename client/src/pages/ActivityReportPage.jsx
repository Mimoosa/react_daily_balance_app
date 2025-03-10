import React, { useRef, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { faDumbbell, faBrain, faUsers, faHeart, faExclamationTriangle, faSync, faClock } from '../contexts/icons';
import { ActivityReportService, userService } from '../services/api';
import { useState, useEffect, useMemo } from 'react';
import { useScreenContext } from '../contexts/ScreenContext'; 

/**
 * DailyActivityReport Component
 * Displays the daily activity report including a summary and total points.
 * 
 * @component
 */
const DailyActivityReport = () => {
  const { theme, isDark } = useTheme();
  const [journal, setJournal] = useState("");
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [userPoints, setUserPoints] = useState({});
  const [totalPoints, setTotalPoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [activitiesProcessed, setActivitiesProcessed] = useState(false);
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const [calculationTime, setCalculationTime] = useState(null);
  const { isLargeScreen, isExtraLargeScreen } = useScreenContext();

  
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
  // This useMemo hook is used to memoize the result of the transformActivities function,
// ensuring that the transformed activities are only recalculated when the activities array changes.
  const transformedActivities = useMemo(() => transformActivities(activities), [activities]);
  
  const labelIcons = {
    Physical: faDumbbell,
    Psychological: faHeart,
    Social: faUsers,
    Cognitive: faBrain
  };

  
  const handleRegenerateAction = async (showConfirm = true, manualPreviousPoints = null) => {
    if (showConfirm && !window.confirm('This will recalculate your points for today. Continue?')) {
        return;
    }
    
    try {
        setError('');
        setLoading(true);
        setProcessingAttempts(0);
        
        // Use manually provided points or current state
        const currentPoints = manualPreviousPoints || 
          (Object.keys(totalPoints).length > 0 ? { ...totalPoints } : null);
        
        // Reset the processing flag on the server
        const resetResult = await ActivityReportService.resetProcessingFlag();
        
        // Determine which previous points to use
        const previousPoints = currentPoints || resetResult.previousPoints;
        const hadPoints = Boolean(currentPoints) || resetResult.hadPoints;
        const pointsAlreadySubtracted = resetResult.pointsReset;
        
        // Clear current state
        setActivitiesProcessed(false);
        setActivities([]);
        setTotalPoints({});
        
        // Fetch updated user points
        const updatedUserPoints = await userService.getTotalPoints();
        setUserPoints(updatedUserPoints);
        
        // Fetch the journal content
        const journalData = await ActivityReportService.getTodaysEntry();
        setJournal(journalData.content);
        
        // Generate activities
        const activities = await ActivityReportService.getActivities(journalData.content);
        setActivities(activities);
        
        // Calculate points from activities
        const calculatedPoints = activities.reduce((acc, activity) => {
            if (!acc[activity.category]) acc[activity.category] = 0;
            acc[activity.category] += activity.points;
            return acc;
        }, {
            Physical: 0,
            Cognitive: 0,
            Social: 0,
            Psychological: 0
        });
        
        // Save the calculated points with the explicit recalculation flag
        const result = await ActivityReportService.savePoints(
            calculatedPoints, 
            activities, 
            true,  // This is a recalculation
            hadPoints ? previousPoints : null,  // Only pass previous points if we had them
            pointsAlreadySubtracted // Indicate if points were already subtracted
        );
        
        // Update states
        setTotalPoints(result.points);
        setActivities(activities);
        setActivitiesProcessed(true);
        
        // Set calculation time if available
        if (result.calculatedAt) {
          setCalculationTime(new Date(result.calculatedAt));
        }
        
        // Refresh user points
        const finalUserPoints = await userService.getTotalPoints();
        setUserPoints(finalUserPoints);
        
        setLoading(false);
    } catch (error) {
        console.error("Error during recalculation:", error);
        setError('Failed to recalculate: ' + error.message);
        setLoading(false);
    }
};
  
  const generateActivities = useCallback(async (journalContent) => {
    if (processingAttempts > 2) {
      setError('Unable to process activities after multiple attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (!journalContent?.trim()) {
        throw new Error("No journal content to analyze");
      }

      // Step 1: Get activities from the journal using the passed content
      const data = await ActivityReportService.getActivities(journalContent);
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid response from activity analysis");
      }

      if (data.length === 0) {
        setActivities([{
          text: "No activities detected in journal",
          category: "Psychological",
          points: 0
        }]);
        setTotalPoints({ Psychological: 0 });
        setActivitiesProcessed(true);
        setLoading(false);
        return;
      }

      setActivities(data);
      
      // Step 2: Calculate total points
      const calculatedPoints = data.reduce((acc, activity) => {
        if (!acc[activity.category]) acc[activity.category] = 0;
        acc[activity.category] += activity.points;
        return acc;
      }, {});
      
      setTotalPoints(calculatedPoints);
      
      // Step 3: Save points to database (only once)
      // Check if we haven't saved these points before to avoid duplicate processing
      if (!activitiesProcessed) {
        const result = await ActivityReportService.savePoints(calculatedPoints, data);
        
        // Update local state with server response
        setTotalPoints(result.points);
      }
      
      setActivitiesProcessed(true);
      setProcessingAttempts(0); // Reset attempts on success
      setLoading(false);
    } catch (error) {
      console.error("Error generating activities:", error);
      setError(error.message || 'Failed to analyze activities');
      setProcessingAttempts(prev => prev + 1);
      setLoading(false);
    }
  }, [processingAttempts]); // Add dependencies as needed

  const fetchJournal = useCallback(async () => {
    try {
      setError('');
      const searchParams = new URLSearchParams(window.location.search);
      const isEdited = searchParams.get('edited') === 'true';
      
      // Fetch journal data first
      const data = await ActivityReportService.getTodaysEntry();
      
      if (!data?.content) {
        throw new Error("No journal content found");
      }

      // Set journal content first
      setJournal(data.content);
      
      // Save calculation time if available
      if (data.calculatedAt) {
        setCalculationTime(new Date(data.calculatedAt));
      }
      
      const userTotalPoints = await userService.getTotalPoints();
      setUserPoints(userTotalPoints);

      // Check for preserved points from previous calculations
      const preservedPoints = data.points && Object.keys(data.points).length > 0 
          ? { ...data.points } 
          : null;
      
      if (isEdited) {
        // Pass the preserved points directly for editing case
        await handleRegenerateAction(false, preservedPoints);
        return;
      }
      
      if (!data.activitiesProcessed) {
        // Pass the content directly instead of relying on state
        await generateActivities(data.content);
      } else if (data.activities?.length && data.points) {
        setTotalPoints(data.points);
        setActivities(data.activities);
        setActivitiesProcessed(true);
      } else {
        await generateActivities(data.content);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchJournal:", error);
      setError('Failed to fetch journal entries. Please create a journal entry first.');
      setLoading(false);
    }
}, [generateActivities, handleRegenerateAction]);

 

  // Simplify the useEffect
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Only fetch on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchJournal();
    }
    
    // Setup location change listener
    const handleLocationChange = () => {
      if (!isInitialMount.current) {
        fetchJournal();
      }
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Remove or modify the second useEffect that was watching for journal changes
  // since we're now handling activity generation directly in handleRegenerateAction

  // Update the handler to use the extracted function
  const handleRegenerateClick = async () => {
    await handleRegenerateAction(true);
  };

  // Function to format the time nicely
  const formatCalculationTime = (date) => {
    if (!date) return null;
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  

  return (
    <div className={`pb-10 ${theme.backgroundWhite}`} style={isLargeScreen && !error || isExtraLargeScreen ? { height: `calc(100vh - 64px)`} : {}} >
      <div className="flex flex-col items-center">
      <div className={`w-full py-8 px-6 ${isDark ? 'bg-violet-950/30' : 'bg-violet-50/70'} mb-6`}>
            <h1 className={`text-2xl lg:text-4xl font-bold text-center ${theme.textViolet} flex items-center justify-center gap-3`}>
                <FontAwesomeIcon icon={faCalendarDay} className={`${theme.textViolet}`} />
                Daily Activity Report
            </h1>
        </div>
        
        {/* Add calculation time info */}
        {calculationTime && activitiesProcessed && (
          <div className="text-sm text-gray-500 flex items-center mt-2">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            Last calculated: {formatCalculationTime(calculationTime)}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="ml-4 px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
            >
              Reload
            </button>
          </div>
        )}
        
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div>
            <h3 className={`text-xl text-center font-semibold mb-3 lg:mt-2 ${theme.textViolet}`}>Daily Summary</h3>
            <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg w-80`} style={{ height: '300px', overflowY: 'auto' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                  <p className="text-gray-500">Analyzing your activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                  <p className="text-gray-500">Initializing analysis...</p>
                </div>
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
          <div className={`${theme.backgroundCard} p-6 rounded-md shadow-lg w-80`} style={{ height: '300px'}}>
          {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                <p className="text-gray-500">Calculating points...</p>
              </div>
            ) : Object.keys(totalPoints).length === 0 ? (
              <p className="text-gray-500">No points calculated yet.</p>
            ) : (
              <>
                <ul>
                  {Object.entries(totalPoints).map(([category, points], index) => (
                    <li key={index} className="mb-2">
                      <p className={`${points >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                        <FontAwesomeIcon icon={labelIcons[category]} size="lg" className={`${theme.textViolet} text-black mr-2`}/>
                        {category}: {points} points
                      </p>
                    </li>
                  ))}
                </ul>
                
                {activitiesProcessed && (
                  <>
                    {/* Add calculation time under the points display */}
                    {calculationTime && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        Calculated {formatCalculationTime(calculationTime)}
                      </p>
                    )}
                    
                    <p className="mt-2 text-sm text-gray-500">
                      These points have been added to your profile.
                    </p>
                    
                    <button
                      className="mt-4 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                      onClick={handleRegenerateClick}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faSync} className="mr-1" />
                      Recalculate
                    </button>
                  </>
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
