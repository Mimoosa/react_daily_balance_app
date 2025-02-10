import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themes } from '../contexts/themeConfig';
import authService from '../services/authService';

const LoginPage = () => {
    const theme = themes.light;
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await (isLogin
                ? authService.login(formData)
                : authService.register(formData)
            );

            if (data.data && data.data.token && data.data.username) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('username', data.data.username);
                setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');

                // Delay navigation
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={`h-full ${theme.backgroundWhite} flex items-center justify-center px-4`}>
            <div className={`max-w-md w-full ${theme.backgroundWhite} p-8 rounded-lg shadow-lg`}>
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`px-4 py-2 rounded-t-lg ${isLogin ? `${theme.backgroundViolet} ${theme.textWhite}` : 'text-gray-600'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`px-4 py-2 rounded-t-lg ${!isLogin ? `${theme.backgroundViolet} ${theme.textWhite}` : 'text-gray-600'
                            }`}
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
    );
};

export default LoginPage;


