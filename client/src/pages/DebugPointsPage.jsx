import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const DebugPointsPage = () => {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        const data = await userService.getPointsDebug();
        setPointsData(data);
      } catch (err) {
        console.error("Error fetching debug data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading debug data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Points Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Points Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">User.points (Old Structure)</h3>
            {pointsData?.points ? (
              <pre className="bg-white p-3 rounded border overflow-auto max-h-60">
                {JSON.stringify(pointsData.points, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-2">User.totalPoints (New Structure)</h3>
            {pointsData?.totalPoints ? (
              <pre className="bg-white p-3 rounded border overflow-auto max-h-60">
                {JSON.stringify(pointsData.totalPoints, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium mb-2">Full Response</h3>
        <pre className="bg-white p-3 rounded border overflow-auto max-h-80">
          {JSON.stringify(pointsData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPointsPage;
