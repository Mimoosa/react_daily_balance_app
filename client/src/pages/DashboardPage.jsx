import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';

const DashboardPage =()=>{
    
    /*  const [scores, setScores] = useState({});
        const [maxValue, setMaxValue] = useState(100);

    useEffect(()=>{
        async function fetchScoreData(){
            try{
                const response = await fetch("");
                setScores(response);
                const max = Math.max(...Object.values(response);
                setMaxValue(max);
            }
            catch(error){
                console.error(error);
            }
        }

    }, []); */
    const scores = {
        Physical: 120,
        Psychological: 90,
        Social: 50,
        Cognitive: 110
    }

    const max = Math.max(...Object.values(scores));
    
    
    return(
        <div>
        <h1>Your Dashboard</h1>
        <div>
            <h2>Weekly Wellbeing Scores</h2>
            <BarCharts data={scores} maxValue={max} />
        </div>
        </div>
    );
};

export default DashboardPage;