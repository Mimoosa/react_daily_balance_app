import { themes } from '../contexts/themeConfig';
import { Link } from 'react-router-dom';
import bgImage from '../images/bg_image.jpg';
import { useScreenContext } from '../contexts/ScreenContext'; 

function HomePage() {
  const theme = themes;
  const { isLargeScreen, navbarHeight } = useScreenContext();
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})`, filter: 'blur(4px)' }}></div>
        <div className={`absolute inset-0 ${theme.dark.background} opacity-50`}></div>
        <div className="relative z-10 flex items-center justify-center" style={isLargeScreen ? { height: `calc(100vh - 64px)`} : {height: `calc(100vh - ${navbarHeight}px )`}}>
          <div className="max-w-4xl px-4 text-center text-white">
            <h2 className="text-3xl font-bold md:text-4xl lg:text-4xl">Daily Balance</h2>
            <p className="mt-4 text-lg mx-auto md:text-xl md:w-7/12 lg:w-7/12">Track and improve your well-being through daily journals with Daily Balance, focusing on physical, cognitive, psychological, and social dimensions.</p>
            <div className="mt-8">
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