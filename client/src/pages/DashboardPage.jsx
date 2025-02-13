import BarCharts from '../components/BarCharts';
import {useState, useEffect} from 'react';
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFire} from '../contexts/icons'


const DashboardPage =()=>{
  const theme = themes.light; 
   /*  
    const [scores, setScores] = useState({});
    const [dailyStreak, setDailyStreak] = useState(0);
    const [recommendation, setRecommendation] = useState("");
    const [maxValue, setMaxValue] = useState(100);

    useEffect(()=>{
        async function fetchScoreData(){
            try{
                const res = await fetch("");
                const data = await res.json();
                setScores(data);
                const max = Math.max(...Object.values(data));
                setMaxValue(max);
            }
            catch(error){
                console.error(error);
            }
        }

    }, []);
    
    useEffect(()=>{
        async function fetchDailyStreakData(){
            try{
                const res = await fetch("");
                const data = await res.json();
                setDailyStreak(data);
            }
            catch(error){
                console.error(error);
            }
        }

    }, []);

    useEffect(()=>{
        async function fetchDailyStreakData(){
            try{
                const res = await fetch("");
                const data = await res.json();
                setDailyStreak(data);
            }
            catch(error){
                console.error(error);
            }
        }

    }, []);
 */
    const dailyStreak = 5;
    
    const scores = {
        Physical: 120,
        Psychological: 90,
        Social: 50,
        Cognitive: 110
    }

    const recommendation = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto in voluptatibus ipsam enim harum, voluptatem asperiores ratione provident eius non sunt nisi, iure recusandae obcaecati, numquam quidem illum ipsum perferendis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, nesciunt id a doloremque illo dolore mollitia iure, error corrupti reprehenderit, sequi eligendi eius debitis inventore excepturi illum. Vitae, aut nostrum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum, deserunt iure commodi aliquam autem pariatur, aliquid deleniti accusamus enim dolor laborum neque voluptate molestiae. Nostrum temporibus incidunt blanditiis totam non!"

    const max = Math.max(...Object.values(scores));
    
    
    return(
        <div className="h-full">
        <h1 className="text-4xl font-bold mb-6 text-center mt-6">Your Dashboard</h1>
        <div className="flex flex-col items-center h-full lg:items-start lg:flex-row lg:justify-center">
        <div className="w-[90%] h-full lg:w-2/5 mt-4 lg:mt-0">
            <h2 className="text-center text-xl font-semibold">Weekly Wellbeing Scores</h2>
        <div className={`${theme.backgroundCard} pt-6 pb-2 px-4 rounded-md mt-4 flex flex-col justify-center shadow-lg`}>
            <BarCharts data={scores} maxValue={max} />
            </div>
        </div>
        <div className="w-[90%] h-full lg:w-2/5 mt-4 lg:mt-0 lg:ml-4 ">
            <h2 className="text-center text-xl font-semibold">Wellbeing Recommendations</h2>
            <div className={`${theme.backgroundCard} h-1/2 p-6 rounded-md mt-4 shadow-lg`} style={{ height: '225px', overflowY: 'auto' }}>
                <p className="text-black">{recommendation}</p>
            </div>
        </div>
        </div>
        <div  className="w-[90%] mx-auto mt-4 lg:w-2/5 ">
            <h2 className="text-center text-xl font-semibold">Daily Streak</h2>
            <div className={`${theme.backgroundCard} h-1/2 text-xl p-4 font-bold rounded-md mt-4 shadow-lg`}>
                <p className="text-black text-center">{dailyStreak} Days<FontAwesomeIcon icon={faFire} size="xl" className="ml-2 text-red-500" /></p>
            </div>
        </div>
        </div>
    );
};

export default DashboardPage;
