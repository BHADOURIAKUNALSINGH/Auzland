import React, { useState, useEffect, useRef } from "react";
import "./ProfileDropdown.css"; // Your CSS import is correct

// --- THIS IS THE CRITICAL PART ---
// Define the types for your props

// Customize this User interface based on your user object
interface User {
  email: string;
}

// Define the shape of all props the component receives
interface ProfileDropdownProps {
  user: User | null; // The user can be a User object or null
  hasEditAccess: boolean;
  signOut: () => void; // A function that returns nothing
}
// ---------------------------------

// A placeholder for the profile icon.
const ProfileIcon = ({ user }: { user: User | null }) => {
  // Add type for user prop
  const getInitials = () => {
    const name = user?.email || "U";
    return name[0].toUpperCase();
  };

  // if (user?.avatarUrl) {
  //   return (
  //     <img
  //       src={user.avatarUrl}
  //       alt="Profile"
  //       className="profile-trigger-avatar"
  //     />
  //   );
  // }

  return <div className="profile-trigger-initials">{getInitials()}</div>;
};

// Use 'React.FC<ProfileDropdownProps>' to apply your types
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  hasEditAccess,
  signOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Tell TypeScript this ref will point to a <div> element
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Type the event as a 'MouseEvent'
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click target is a 'Node'
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    // Pass the typed ref to the div
    <div className="profile-container" ref={dropdownRef}>
      <button
        className="profile-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle user menu"
      >
        <ProfileIcon user={user} />
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-header">
            <img
              // Use the actual avatar if available, otherwise a placeholder
              src={ "https://via.placeholder.com/60"}
              alt="Profile"
              className="profile-avatar-large"
            />
          </div>

          <div className="profile-details">
            <div className="user-info">
              <span className="username">
                {/* Check if user exists before accessing properties */}
                Welcome, {user?.email || "Guest"}
              </span>
              <span className="user-role">
                {hasEditAccess ? "Administrator" : "View Access"}
              </span>
            </div>

            <div className="profile-links">
              <a href="/account">My account</a>
              <a href="/subscription">Subscription</a>
            </div>

            <button onClick={signOut} className="signout-button">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
