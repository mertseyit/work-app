import React from 'react';
import MainNavbar from './components/MainNavbar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainNavbar />
      {children}
    </div>
  );
};

export default MainLayout;
