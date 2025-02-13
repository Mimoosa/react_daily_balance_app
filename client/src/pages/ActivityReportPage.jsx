import React from "react";

const activities = [
  { text: "Went to the gym for 1 hour", category: "Physical", points: 20 },
  { text: "Studied for 3 hours", category: "Cognitive", points: 30 },
  { text: "Spent 2 hours chatting with a friend at a cafe", category: "Social", points: 20 },
  { text: "Stayed up 2 hours late", category: "Cognitive", points: -20 },
  { text: "Stayed up 2 hours late", category: "Physical", points: -20 },
];

const totalPoints = activities.reduce((acc, activity) => {
  acc[activity.category] = (acc[activity.category] || 0) + activity.points;
  return acc;
}, {});

const DailyActivityReport = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <div className="flex flex-col items-center mt-8">
        <h2 className="text-2xl font-bold">Daily Activity Report</h2>
        
        <div className="mt-6 flex gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Daily Summary</h3>
            <ul>
              {activities.map((activity, index) => (
                <li key={index} className="mb-2">
                  <p>{activity.text}</p>
                  <p className={`${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.category}: {activity.points} points
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Total Points</h3>
            <ul>
              {Object.entries(totalPoints).map(([category, points], index) => (
                <li key={index} className="mb-2">
                  <p className={`${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>{category}: {points} points</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivityReport;
