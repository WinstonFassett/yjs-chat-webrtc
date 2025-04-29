import React, { useEffect } from 'react';
import { useYjsStore } from './stores/yjsStore';
import { useUserStore } from './stores/userStore';
import { Loader } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea/ChatArea';
import UserSetupModal from './components/Modals/UserSetupModal';
import { initializeDefaultWorkspace } from './utils/defaultSetup';

function App() {
  const { isInitialized, initialize, disconnect } = useYjsStore();
  const { user } = useUserStore();

  // Initialize YJS when user is available
  useEffect(() => {
    if (user) {
      initialize();
    } else {
      // Clean up YJS when user logs out
      disconnect();
    }
  }, [user, initialize, disconnect]);

  // Bootstrap with default data if we're initializing and have a user
  useEffect(() => {
    if (isInitialized && user) {
      initializeDefaultWorkspace();
    }
  }, [isInitialized, user]);

  if (!user) {
    return <UserSetupModal />;
  }

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-800">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-secondary-600 dark:text-secondary-300">
            Initializing workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;