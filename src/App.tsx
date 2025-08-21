import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
// aws-config is loaded in index.tsx
import './App.css';

// Import AuzLand components
import Header from './auzland/Header';
import Footer from './auzland/Footer';
import HomePage from './auzland/HomePage';
import PropertiesPage from './auzland/PropertiesPage';
import AboutPage from './auzland/AboutPage';
import ContactPage from './auzland/ContactPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="employee-portal">
        <Login />
      </div>
    );
  }

  // Both user types now use the same Dashboard component
  // The Dashboard automatically shows/hides features based on user groups
  return (
    <div className="employee-portal">
      <Dashboard />
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/properties" replace />;
  }

  return <>{children}</>;
};

// Public customer-facing routes component
const PublicRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={
      <div className="App">
        <Header />
        <main>
          <HomePage />
        </main>
        <Footer />
      </div>
    } />
    
    <Route path="/buy" element={
      <div className="App">
        <Header />
        <main>
          <PropertiesPage />
        </main>
        <Footer />
      </div>
    } />
    
    <Route path="/sell" element={
      <div className="App">
        <Header />
        <main>
          <PropertiesPage />
        </main>
        <Footer />
      </div>
    } />
    
    <Route path="/blogs" element={
      <div className="App">
        <Header />
        <main>
          <PropertiesPage />
        </main>
        <Footer />
      </div>
    } />
    
    <Route path="/about" element={
      <div className="App">
        <Header />
        <main>
          <AboutPage />
        </main>
        <Footer />
      </div>
    } />
    
    <Route path="/contact" element={
      <div className="App">
        <Header />
        <main>
          <ContactPage />
        </main>
        <Footer />
      </div>
    } />
    
    {/* Redirect unknown routes to home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// Employee portal routes component (wrapped with AuthProvider)
const EmployeePortal: React.FC = () => (
  <AuthProvider>
    <Routes>
      {/* Owner/Employee Portal - ONLY at /properties */}
      <Route index element={<AppContent />} />
      
      {/* Redirect any other /properties/* routes to /properties */}
      <Route path="*" element={<Navigate to="/properties" replace />} />
    </Routes>
  </AuthProvider>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Employee portal routes - WITH authentication (must come first) */}
        <Route path="/properties/*" element={<EmployeePortal />} />
        
        {/* Public customer-facing routes - NO authentication */}
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </Router>
  );
};

export default App;
