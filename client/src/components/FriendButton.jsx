import React, { useState } from 'react';
import { IoAccessibilityOutline, IoPersonCircleOutline } from 'react-icons/io5';

export default function FriendButton() {
  const data = [
    { id: 1, image: '', username: 'johndoe1' },
    { id: 2, image: '', username: 'johndoe2' },
    { id: 3, image: '', username: 'johndoe3' },
    { id: 4, image: '', username: 'johndoe4' },
    { id: 5, image: '', username: 'johndoe5' },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const toggleFriendsList = () => {
    setIsOpen(!isOpen);
  };

  const renderProfileImage = (imageUrl) => {
    if (imageUrl) {
      return <img style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} src={imageUrl} alt="Profile" />;
    } else {
      return <IoPersonCircleOutline size={40} color="#ccc" />;
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <div style={{ width: isOpen ? 250 : 70, height: isOpen ? 'auto' : 70, transition: 'all 0.3s ease-in-out' }}>
        {isOpen && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 10, border: '2px solid black' }}>
            {data.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                {renderProfileImage(item.image)}
                <span style={{ color: 'black', fontSize: 14 }}>{item.username}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={toggleFriendsList}
          style={{
            backgroundColor: '#ffffff',
            width: 50,
            height: 50,
            borderRadius: 25,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            border: '2px solid black',
          }}
          aria-label="Toggle friends list"
        >
          <IoAccessibilityOutline size={24} color="#000" />
        </button>
      </div>
    </div>
  );
}