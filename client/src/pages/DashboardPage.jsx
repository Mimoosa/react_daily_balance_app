import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';
import { themes } from '../contexts/themeConfig';


const DashboardPage =()=>{
    const theme = themes.light; 
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
        <div className="">
        <h1 className="text-4xl font-bold mb-6 text-center mt-10">Your Dashboard</h1>
        <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-around">
        <div className="w-[90%] lg:w-2/5 mt-4 lg:mt-0">
            <h2 className="text-center text-xl font-semibold">Weekly Wellbeing Scores</h2>
        <div className={`${theme.backgroundCard} p-6 rounded-md mt-4`}>
            <BarCharts data={scores} maxValue={max} />
            </div>
        </div>
        <div className="w-[90%] lg:w-2/5 mt-8 lg:mt-0 lg:ml-4">
            <h2 className="text-center text-xl font-semibold">Wellbeing Recommendations</h2>
        <div className={`${theme.backgroundCard} p-6 rounded-md mt-4`}>
    
            </div>
        </div>
        </div>
        </div>
    );
};

export default DashboardPage;