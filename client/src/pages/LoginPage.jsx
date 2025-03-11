import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { themes } from '../contexts/themeConfig';
import { authService } from '../services/api';
import bgImage from '../images/bg_image.jpg';
import { useScreenContext } from '../contexts/ScreenContext'; 
/**
 * LoginPage Component
 * Handles both user login and registration functionality
 * Features:
 * - Toggle between login and register forms
 * - Form validation
 * - Success/error notifications
 * - Delayed navigation after successful auth
 */
const LoginPage = () => {
    // Initialize state and hooks
    const theme = themes.light;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { isLargeScreen, navbarHeight } = useScreenContext();

    // Add effect to update isLogin when URL parameters change
    useEffect(() => {
        setIsLogin(searchParams.get('mode') !== 'register');
    }, [searchParams]);

    /**
     * Handles form input changes and clears any existing errors
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    /**
     * Handles form submission for both login and registration
     * On success: Shows notification and redirects after delay
     * On error: Displays error message
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data before submission
            if (!formData.username || !formData.password) {
                setError('Username and password are required');
                return;
            }
            
            console.log(`Attempting to ${isLogin ? 'login' : 'register'} with username: ${formData.username}`);
            
            const response = await (isLogin
                ? authService.login(formData)
                : authService.register(formData)
            );

            console.log('Auth response:', response);

            if (response && response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username || response.data.id);
                setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');

                setTimeout(() => {
                  isLogin 
                  ? navigate('/dashboard')
                  :navigate('/instruction');
                }, 1500);
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Auth error:', err);
            // Extract error message from various possible error formats
            let errorMsg = 'Authentication failed';
            
            if (err.response && err.response.data) {
                errorMsg = err.response.data.error || err.response.data.message || errorMsg;
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            setError(errorMsg);
        }
    };

    return (
        <div className="relative flex items-center justify-center px-4" style={isLargeScreen ? { height: `calc(100vh - 56px)`} : {height: `calc(100vh - ${navbarHeight}px )`}}>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})`, filter: 'blur(4px)' }}></div>
          <div className={`absolute inset-0 opacity-50`}></div>
          <div className="relative z-10 flex items-center justify-center w-full">
            <div className={`max-w-md w-full ${theme.backgroundCard} p-8 rounded-lg shadow-lg`}>
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 rounded-t-lg ${isLogin ? `${theme.backgroundViolet} ${theme.textWhite}` : 'text-gray-600'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded-t-lg ${!isLogin ? `${theme.backgroundViolet} ${theme.textWhite}` : 'text-gray-600'}`}
                >
                  Register
                </button>
              </div>
    
              <h2 className={`text-3xl font-bold text-center mb-8 text-gray-800`}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
    
              {success && (
                <div className="text-center mb-4 p-2 rounded bg-green-50 text-green-700">
                  {success}
                </div>
              )}
    
              {error && (
                <div className={`${theme.alert} text-center mb-4 p-2 rounded bg-red-50`}>
                  {error}
                </div>
              )}
    
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                    minLength={6}
                  />
                </div>
    
                <div>
                  <label
                    htmlFor="password"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                    minLength={7}
                  />
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 7 characters with 1 uppercase letter and 1 number
                    </p>
                  )}
                </div>
    
                <button
                  type="submit"
                  className={`w-full py-2 px-4 ${theme.backgroundViolet} hover:bg-violet-900  ${theme.textWhite} rounded-md transition duration-200 font-medium`}
                >
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
};

export default LoginPage;


