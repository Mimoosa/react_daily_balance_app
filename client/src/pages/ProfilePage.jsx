import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useScreenContext } from '../contexts/ScreenContext';
import { faEdit, faUser, faCalendarAlt, faTrophy, faKey, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfilePage = () => {
    const { theme } = useTheme();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();
    const { isLargeScreen } = useScreenContext();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const data = await userService.getUserData();
            setUserData(data);
            setEditForm({
                username: data.username,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('Failed to fetch user data');
            console.error('Error fetching user data:', err);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate passwords match if changing password
            if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
                setError('New passwords do not match');
                return;
            }

            await userService.updateProfile(editForm);
            await fetchUserData();
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await userService.deleteAccount();
                localStorage.removeItem('token');
                navigate('/login');
            } catch (err) {
                setError('Failed to delete account');
            }
        }
    };

    if (!userData) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    return (
        <div className={`${theme.backgroundViolet} ${theme.primary}`} 
            style={isLargeScreen ? { height: `calc(100vh - 64px)` } : {}}>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className={`${theme.textWhite} text-3xl font-bold mb-8`}>
                    <FontAwesomeIcon icon={faUser} className="mr-3" />
                    Profile
                </h1>

                {error && (
                    <div className={`${theme.alert} p-4 rounded-lg mb-6`}>
                        {error}
                    </div>
                )}

                <div className={`${theme.backgroundCard} rounded-xl p-6 mb-8 ${theme.cardShadow} shadow-lg`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-semibold ${theme.textViolet}`}>Account Information</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg ${theme.backgroundViolet} ${theme.textWhite} flex items-center`}
                        >
                            <FontAwesomeIcon icon={isEditing ? faTimes : faEdit} className="mr-2" />
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className={`block mb-2 ${theme.textSecondary}`}>
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className={`font-medium mb-4 ${theme.textViolet} flex items-center`}>
                                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                                    Change Password
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block mb-2 ${theme.textSecondary}`}>Current Password</label>
                                        <input
                                            type="password"
                                            value={editForm.currentPassword}
                                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block mb-2 ${theme.textSecondary}`}>New Password</label>
                                        <input
                                            type="password"
                                            value={editForm.newPassword}
                                            onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                            minLength={7}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block mb-2 ${theme.textSecondary}`}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={editForm.confirmPassword}
                                            onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                            minLength={7}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className={`${theme.backgroundViolet} ${theme.textWhite} px-6 py-2 rounded-lg flex items-center`}
                                >
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className={`block mb-2 ${theme.textSecondary} flex items-center`}>
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    Username
                                </label>
                                <p className={`${theme.textPrimary} font-medium`}>{userData.username}</p>
                            </div>
                            <div>
                                <label className={`block mb-2 ${theme.textSecondary} flex items-center`}>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                    Account Created
                                </label>
                                <p className={`${theme.textPrimary} font-medium`}>
                                    {new Date(userData.created).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className={`block mb-2 ${theme.textSecondary} flex items-center`}>
                                    <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                                    Best Streak
                                </label>
                                <p className={`${theme.textPrimary} font-medium`}>
                                    {userData.streak?.bestStreak || 0} days
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`${theme.backgroundCard} rounded-xl p-6 ${theme.cardShadow} shadow-lg`}>
                    <h3 className={`text-xl font-semibold mb-4 ${theme.textViolet}`}>Account Management</h3>
                    <div className={`border-t ${theme.divider} pt-4`}>
                        <button
                            onClick={handleDeleteAccount}
                            className={`${theme.alert} border border-current px-6 py-3 rounded-lg 
                                      transition-all duration-200 hover:bg-red-500/10 flex items-center`}
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
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
