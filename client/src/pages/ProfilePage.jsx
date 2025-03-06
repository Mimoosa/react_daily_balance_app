import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useScreenContext } from '../contexts/ScreenContext'; 

const ProfilePage = () => {
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isLargeScreen } = useScreenContext();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await userService.getTotalPoints();
                setUser(response);
            } catch (err) {
                setError('Failed to fetch user data');
                console.error('Error fetching user data:', err);
            }
        };

        fetchUser();
    }, []);

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await userService.deleteAccount();
                localStorage.removeItem('token');
                navigate('/login');
            } catch (err) {
                setError('Failed to delete account');
                console.error('Error deleting account:', err);
            }
        }
    };

    if (error) {
        return (
            <div className={`min-h-screen p-6 ${theme.backgroundViolet} ${theme.textWhite}`}>
                <p className={`${theme.alert} p-4 rounded-lg ${theme.backgroundCard}`}>{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen p-6 ${theme.backgroundViolet} ${theme.textWhite} flex items-center justify-center`}>
                <p className={`${theme.textSecondary}`}>Loading...</p>
            </div>
        );
    }

    return (
        <div className={`${theme.backgroundViolet} ${theme.primary}`} style={isLargeScreen ? { height: `calc(100vh - 64px)`} : {}}>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className={`${theme.textWhite} text-3xl font-bold mb-8`}>Profile</h1>
                
                <div className={`${theme.backgroundCard} rounded-xl p-6 mb-8 ${theme.cardShadow} shadow-lg`}>
                    <h3 className={`text-xl font-semibold mb-6 ${theme.textViolet}`}>Profile Information</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className={`font-medium mb-4 ${theme.textSecondary}`}>Points by category:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(user.points || {}).map(([category, points], index) => (
                                    <div 
                                        key={category} 
                                        className={`p-4 rounded-lg ${
                                            index % 4 === 0 ? theme.barChart1 :
                                            index % 4 === 1 ? theme.barChart2 :
                                            index % 4 === 2 ? theme.barChart3 :
                                            theme.barChart4
                                        } ${theme.textWhite}`}
                                    >
                                        <p className="font-medium">{category}</p>
                                        <p className="text-2xl font-bold">{points}</p>
                                        <p className="text-sm opacity-80">points</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${theme.backgroundCard} rounded-xl p-6 ${theme.cardShadow} shadow-lg`}>
                    <h3 className={`text-xl font-semibold mb-4 ${theme.textViolet}`}>Account Management</h3>
                    <div className={`border-t ${theme.divider} pt-4`}>
                        <button 
                            onClick={handleDeleteAccount}
                            className={`${theme.alert} border border-current px-6 py-3 rounded-lg 
                                      transition-all duration-200 hover:bg-red-500/10`}
                        >
                            Permanently Delete Account
                        </button>
                        <p className={`mt-2 text-sm ${theme.textSecondary}`}>
                            This action cannot be undone. All your data will be permanently deleted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
