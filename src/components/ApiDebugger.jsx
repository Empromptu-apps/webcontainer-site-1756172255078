import React, { useState } from 'react';

const ApiDebugger = ({ apiCalls, onDeleteObjects, createdObjects }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Toggle Button */}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-brand-main hover:bg-brand-green1 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
          aria-label="Toggle API debugger"
        >
          ð API Debug ({apiCalls.length})
        </button>
        
        <button
          onClick={onDeleteObjects}
          disabled={createdObjects.length === 0}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg disabled:cursor-not-allowed"
          aria-label="Delete all created objects"
        >
          ðï¸ Delete Objects ({createdObjects.length})
        </button>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-brand-secondary/30 dark:border-gray-700 w-96 max-h-96 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-brand-secondary/20 dark:border-gray-700 gradient-brand text-white">
            <h3 className="font-semibold">API Call History</h3>
            <p className="text-xs text-white/80">Last 10 API calls</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {apiCalls.length === 0 ? (
              <div className="p-4 text-center text-brand-brown dark:text-gray-400">
                No API calls yet
              </div>
            ) : (
              <div className="divide-y divide-brand-secondary/20 dark:divide-gray-700">
                {apiCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-3 hover:bg-brand-secondary/10 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${call.success ? 'bg-brand-accent' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-brand-main dark:text-gray-100">
                          {call.method} {call.endpoint}
                        </span>
                      </div>
                      <span className="text-xs text-brand-secondary dark:text-gray-400">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {selectedCall?.id === call.id && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <h4 className="text-xs font-semibold text-brand-main dark:text-gray-300">Request:</h4>
                          <pre className="text-xs bg-brand-secondary/10 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                            {formatJson(call.data)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-brand-main dark:text-gray-300">Response:</h4>
                          <pre className="text-xs bg-brand-secondary/10 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                            {formatJson(call.response)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
