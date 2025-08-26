import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';
import CreateHabitForm from './CreateHabitForm';
import ApiDebugger from './ApiDebugger';

const TinyHabitsApp = () => {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [userTimezone, setUserTimezone] = useState('');
  const [apiCalls, setApiCalls] = useState([]);
  const [createdObjects, setCreatedObjects] = useState([]);

  // Auto-detect timezone on component mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(detectedTimezone);
  }, []);

  // Initialize database when user logs in
  useEffect(() => {
    if (user) {
      initializeDatabase();
      loadUserHabits();
    }
  }, [user]);

  const logApiCall = (endpoint, method, data, response) => {
    const call = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      data,
      response,
      success: response && !response.error
    };
    setApiCalls(prev => [call, ...prev.slice(0, 9)]); // Keep last 10 calls
  };

  const initializeDatabase = async () => {
    try {
      // Create users table
      const usersTableQuery = `CREATE TABLE IF NOT EXISTS newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) NOT NULL,
        user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('client', 'coach')),
        timezone VARCHAR(50) NOT NULL,
        coach_id INTEGER REFERENCES newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      const usersResponse = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query: usersTableQuery })
      });

      const usersData = await usersResponse.json();
      logApiCall('/templates/call_postgres', 'POST', { query: usersTableQuery }, usersData);

      // Create habits table
      const habitsTableQuery = `CREATE TABLE IF NOT EXISTS newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits_users(id),
        anchor_moment TEXT NOT NULL,
        new_habit TEXT NOT NULL,
        celebration TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

      const habitsResponse = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query: habitsTableQuery })
      });

      const habitsData = await habitsResponse.json();
      logApiCall('/templates/call_postgres', 'POST', { query: habitsTableQuery }, habitsData);

      // Create tracking table
      const trackingTableQuery = `CREATE TABLE IF NOT EXISTS newschema_1a83b94541c44604b24a023ad43210e9.habit_tracking (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits(id),
        tracking_date DATE NOT NULL,
        completed BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, tracking_date)
      )`;

      const trackingResponse = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query: trackingTableQuery })
      });

      const trackingData = await trackingResponse.json();
      logApiCall('/templates/call_postgres', 'POST', { query: trackingTableQuery }, trackingData);

    } catch (error) {
      console.error('Database initialization error:', error);
      logApiCall('/templates/call_postgres', 'POST', 'Database Init', { error: error.message });
    }
  };

  const handleLogin = async (email, username, userType, timezone, coachLink = '') => {
    try {
      // Check if user exists
      const checkUserQuery = `SELECT * FROM newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits_users WHERE email = '${email}'`;
      
      const checkUser = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query: checkUserQuery })
      });
      
      const userData = await checkUser.json();
      logApiCall('/templates/call_postgres', 'POST', { query: checkUserQuery }, userData);
      
      if (userData.data && userData.data.length > 0) {
        // User exists, log them in
        setUser(userData.data[0]);
        setCurrentView('dashboard');
      } else {
        // Create new user
        let coachId = null;
        if (userType === 'client' && coachLink) {
          // Extract coach ID from affiliate link (simplified)
          const coachIdMatch = coachLink.match(/coach\/(\d+)/);
          if (coachIdMatch) {
            coachId = parseInt(coachIdMatch[1]);
          }
        }

        const createUserQuery = `INSERT INTO newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits_users 
                (email, username, user_type, timezone, coach_id) 
                VALUES ('${email}', '${username}', '${userType}', '${timezone}', ${coachId || 'NULL'}) 
                RETURNING *`;

        const createUser = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
            'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
            'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
          },
          body: JSON.stringify({ query: createUserQuery })
        });
        
        const newUserData = await createUser.json();
        logApiCall('/templates/call_postgres', 'POST', { query: createUserQuery }, newUserData);
        
        if (newUserData.data && newUserData.data.length > 0) {
          setUser(newUserData.data[0]);
          setCurrentView('dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      logApiCall('handleLogin', 'ERROR', { email, username, userType }, { error: error.message });
    }
  };

  const loadUserHabits = async () => {
    if (!user) return;
    
    try {
      const query = `SELECT h.*, 
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'date', ht.tracking_date,
              'completed', ht.completed
            ) ORDER BY ht.tracking_date
          ) FILTER (WHERE ht.tracking_date IS NOT NULL), 
          '[]'
        ) as tracking_data
        FROM newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits h
        LEFT JOIN newschema_1a83b94541c44604b24a023ad43210e9.habit_tracking ht ON h.id = ht.habit_id
        WHERE h.user_id = ${user.id} AND h.is_active = true 
        GROUP BY h.id
        ORDER BY h.created_at DESC`;

      const response = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      logApiCall('/templates/call_postgres', 'POST', { query }, data);
      
      if (data.data) {
        setHabits(data.data);
      }
    } catch (error) {
      console.error('Load habits error:', error);
      logApiCall('loadUserHabits', 'ERROR', { user_id: user.id }, { error: error.message });
    }
  };

  const saveValidatedHabit = async (anchorMoment, newHabit, celebration = '') => {
    try {
      const query = selectedHabit 
        ? `UPDATE newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits 
           SET anchor_moment = '${anchorMoment.replace(/'/g, "''")}', 
               new_habit = '${newHabit.replace(/'/g, "''")}', 
               celebration = '${celebration.replace(/'/g, "''")}', 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = ${selectedHabit.id} RETURNING *`
        : `INSERT INTO newschema_1a83b94541c44604b24a023ad43210e9.tiny_habits 
           (user_id, anchor_moment, new_habit, celebration) 
           VALUES (${user.id}, '${anchorMoment.replace(/'/g, "''")}', '${newHabit.replace(/'/g, "''")}', '${celebration.replace(/'/g, "''")}') RETURNING *`;

      const response = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      logApiCall('/templates/call_postgres', 'POST', { query }, data);

      if (data.success) {
        await loadUserHabits();
        setCurrentView('dashboard');
        setSelectedHabit(null);
        
        // Ask if they want to create another habit (if they have less than 3)
        if (habits.length < 2) { // Will be 3 after this one is added
          setTimeout(() => {
            if (window.confirm('Great! Would you like to create another Tiny Habit? (You can have up to 3 active habits)')) {
              setCurrentView('create-habit');
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Save habit error:', error);
      logApiCall('saveValidatedHabit', 'ERROR', { anchorMoment, newHabit, celebration }, { error: error.message });
    }
  };

  const trackHabit = async (habitId, date, completed) => {
    try {
      const query = `INSERT INTO newschema_1a83b94541c44604b24a023ad43210e9.habit_tracking 
              (habit_id, tracking_date, completed) 
              VALUES (${habitId}, '${date}', ${completed}) 
              ON CONFLICT (habit_id, tracking_date) 
              DO UPDATE SET completed = ${completed}, created_at = CURRENT_TIMESTAMP`;

      const response = await fetch('https://builder.empromptu.ai/api_tools/templates/call_postgres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      logApiCall('/templates/call_postgres', 'POST', { query }, data);

      if (data.success) {
        loadUserHabits(); // Refresh to show updated tracking
      }
    } catch (error) {
      console.error('Track habit error:', error);
      logApiCall('trackHabit', 'ERROR', { habitId, date, completed }, { error: error.message });
    }
  };

  const deleteAllObjects = async () => {
    if (createdObjects.length === 0) {
      alert('No objects to delete');
      return;
    }

    for (const objectName of createdObjects) {
      try {
        const response = await fetch(`https://builder.empromptu.ai/api_tools/objects/${objectName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
            'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
            'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
          }
        });
        
        const data = await response.json();
        logApiCall(`/objects/${objectName}`, 'DELETE', {}, data);
      } catch (error) {
        logApiCall(`/objects/${objectName}`, 'DELETE', {}, { error: error.message });
      }
    }
    
    setCreatedObjects([]);
    alert('All objects deleted');
  };

  // Main App Render
  if (!user) {
    return (
      <div>
        <LoginForm 
          onLogin={handleLogin} 
          userTimezone={userTimezone}
          setUserTimezone={setUserTimezone}
        />
        <ApiDebugger 
          apiCalls={apiCalls}
          onDeleteObjects={deleteAllObjects}
          createdObjects={createdObjects}
        />
      </div>
    );
  }

  if (currentView === 'create-habit') {
    return (
      <div>
        <CreateHabitForm
          user={user}
          selectedHabit={selectedHabit}
          habits={habits}
          onSave={saveValidatedHabit}
          onBack={() => {
            setCurrentView('dashboard');
            setSelectedHabit(null);
          }}
          logApiCall={logApiCall}
          createdObjects={createdObjects}
          setCreatedObjects={setCreatedObjects}
        />
        <ApiDebugger 
          apiCalls={apiCalls}
          onDeleteObjects={deleteAllObjects}
          createdObjects={createdObjects}
        />
      </div>
    );
  }

  return (
    <div>
      <Dashboard
        user={user}
        habits={habits}
        onCreateHabit={() => setCurrentView('create-habit')}
        onEditHabit={(habit) => {
          setSelectedHabit(habit);
          setCurrentView('create-habit');
        }}
        onTrackHabit={trackHabit}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />
      <ApiDebugger 
        apiCalls={apiCalls}
        onDeleteObjects={deleteAllObjects}
        createdObjects={createdObjects}
      />
    </div>
  );
};

export default TinyHabitsApp;
