import React, { useState, useEffect } from 'react';
import TinyHabitsApp from './components/TinyHabitsApp';
import ChatWidget from './components/ChatWidget';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <TinyHabitsApp />
        <ChatWidget />
      </div>
    </ThemeProvider>
  );
}

export default App;
