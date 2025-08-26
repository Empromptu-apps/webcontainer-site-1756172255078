import React from 'react';

const Dashboard = ({ user, habits, onCreateHabit, onEditHabit, onTrackHabit, onThemeToggle, isDark }) => {
  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const getTrackingState = (habit, dateStr) => {
    if (!habit.tracking_data) return null;
    const tracking = habit.tracking_data.find(t => t.date === dateStr);
    return tracking ? tracking.completed : null;
  };

  const handleTrackingClick = (habit, dateStr) => {
    const canTrack = dateStr === today || dateStr === yesterday;
    if (!canTrack) return;

    const currentState = getTrackingState(habit, dateStr);
    // Cycle through states: null -> true -> false -> null
    const newState = currentState === null ? true : currentState === true ? false : null;
    onTrackHabit(habit.id, dateStr, newState);
  };

  const calculateMetrics = (habit) => {
    if (!habit.tracking_data || habit.tracking_data.length === 0) {
      return { weeklyPercentage: 0, currentStreak: 0 };
    }

    // Calculate weekly percentage (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const weeklyTracking = habit.tracking_data.filter(t => t.date >= weekStartStr);
    const completedDays = weeklyTracking.filter(t => t.completed === true).length;
    const weeklyPercentage = weeklyTracking.length > 0 ? Math.round((completedDays / weeklyTracking.length) * 100) : 0;

    // Calculate current streak
    let currentStreak = 0;
    const sortedTracking = [...habit.tracking_data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const track of sortedTracking) {
      if (track.completed === true) {
        currentStreak++;
      } else if (track.completed === false) {
        break;
      }
    }

    return { weeklyPercentage, currentStreak };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-brand-secondary/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-brand-main dark:text-gray-100">My Tiny Habits</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onThemeToggle}
                className="p-2 text-brand-brown hover:text-brand-main dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-brand-brown dark:text-gray-400">Welcome, {user?.username}</span>
              <button
                onClick={onCreateHabit}
                disabled={habits.length >= 3}
                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                aria-label="Create new habit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Habit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0V7a4 4 0 118 0v4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-main mb-2">No habits yet</h3>
            <p className="text-brand-brown mb-8 max-w-md mx-auto">
              Create your first Tiny Habit to start building lasting change in your life. Remember, tiny is mighty!
            </p>
            <button
              onClick={onCreateHabit}
              className="btn-primary px-8 py-3 text-lg font-semibold"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => {
              const metrics = calculateMetrics(habit);
              
              return (
                <div key={habit.id} className="card-luxury p-6 border-l-4 border-brand-main">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-main dark:text-gray-100 mb-2">
                        After I <span className="text-brand-green2">{habit.anchor_moment}</span>, 
                        I will <span className="text-brand-accent font-bold">{habit.new_habit}</span>
                        {habit.celebration && (
                          <span> and celebrate by <span className="text-brand-green3">{habit.celebration}</span></span>
                        )}
                      </h3>
                    </div>
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="text-brand-secondary hover:text-brand-main p-2 rounded-lg hover:bg-brand-secondary/10"
                      aria-label="Edit habit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Weekly Tracking Grid */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-brand-brown mb-3">This Week</h4>
                    <div className="grid grid-cols-7 gap-3">
                      {weekDates.map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
                        const canTrack = dateStr === today || dateStr === yesterday;
                        const trackingState = getTrackingState(habit, dateStr);
                        
                        return (
                          <div key={dateStr} className="text-center">
                            <div className="text-xs text-brand-brown mb-1 font-medium">{dayName}</div>
                            <div className="text-xs text-brand-secondary mb-2">{date.getDate()}</div>
                            <button
                              onClick={() => handleTrackingClick(habit, dateStr)}
                              disabled={!canTrack}
                              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                                canTrack 
                                  ? 'cursor-pointer hover:border-brand-main hover:scale-105' 
                                  : 'cursor-not-allowed opacity-50'
                              } ${
                                trackingState === true 
                                  ? 'bg-brand-accent border-brand-accent text-white' 
                                  : trackingState === false 
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'border-brand-secondary hover:bg-brand-secondary/10'
                              }`}
                              aria-label={`Track habit for ${dayName} ${date.getDate()}`}
                            >
                              {trackingState === true && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {trackingState === false && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simple Metrics */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-brand-main rounded-full"></div>
                      <span className="text-brand-brown">
                        <span className="font-semibold text-brand-main">This Week:</span> {metrics.weeklyPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-brand-accent rounded-full"></div>
                      <span className="text-brand-brown">
                        <span className="font-semibold text-brand-main">Current Streak:</span> {metrics.currentStreak} days
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
