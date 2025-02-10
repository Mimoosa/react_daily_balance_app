import { themes } from '../contexts/themeConfig';
import { Link } from 'react-router-dom';
import bgImage from '../images/bg_image.jpg';

function HomePage() {
  const theme = themes;
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})`, filter: 'blur(4px)' }}></div>
        <div className={`absolute inset-0 ${theme.dark.background} opacity-50`}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className={ `text-center ${theme.dark.primary}` }>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-4xl">Daily Balance</h2>
            <p className="mt-4 text-lg mx-auto md:text-xl md:w-7/12 lg:w-7/12 mt-6">Track and improve your well-being through daily journals with Daily Balance, focusing on physical, cognitive, psychological, and social dimensions.</p>
            <div className="mt-10 lg:mt-10">
            <Link to="/login"
              className={`${theme.dark.primary} ${theme.light.backgroundViolet} text-lg hover:bg-violet-900 font-bold py-3 px-8 rounded-md transition duration-200`}>
              Start Your Balanced Life!
            </Link>
            </div>
          </div>
        </div>
      </div>

    );
  }
  
  export default HomePage;