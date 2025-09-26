
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, AppSettings } from './types';
import Navigation from './components/Navigation';
import Settings from './components/Settings';
import UploadView from './components/UploadView';
import LibraryViewer from './components/LibraryViewer';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [forceSettingsView, setForceSettingsView] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        if (!parsedSettings.apiKey) {
            setCurrentView('settings');
            setForceSettingsView(true);
        }
      } else {
        setSettings({});
        setCurrentView('settings');
        setForceSettingsView(true);
      }
    } catch (e) {
      console.error("Could not parse settings from localStorage", e);
      setSettings({});
      setCurrentView('settings');
      setForceSettingsView(true);
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    
    if (forceSettingsView && newSettings.apiKey) {
        setForceSettingsView(false);
        setCurrentView('upload');
    } else if (currentView === 'settings') {
        setCurrentView('upload');
    }
  };

  const renderCurrentView = () => {
    if (!settings) return null;

    if (forceSettingsView && currentView !== 'settings') {
        return <Settings initialSettings={settings} onSave={handleSaveSettings} />;
    }

    switch (currentView) {
      case 'settings':
        return <Settings initialSettings={settings} onSave={handleSaveSettings} />;
      case 'upload':
        if (!settings.apiKey) {
            return (
                 <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Configuration Needed</h2>
                    <p className="text-gray-400">Please go to the "Settings" page to enter your Google Gemini API Key.</p>
                </div>
            );
        }
        return <UploadView settings={settings} />;
      case 'library':
        return <LibraryViewer settings={settings} />;
      default:
        return null;
    }
  };
  
  if (settings === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner message="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Navigation 
          currentView={currentView}
          onNavigate={(view) => {
              if (!forceSettingsView) {
                  setCurrentView(view)
              }
          }}
          isLibraryEnabled={!!(settings.supabaseUrl && settings.supabaseKey)}
        />
        <main className={`bg-gray-800/50 rounded-xl shadow-2xl p-6 md:p-10 border border-gray-700 mt-8`}>
          {renderCurrentView()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
