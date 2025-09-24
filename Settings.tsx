
import React, { useState } from 'react';
import { AppSettings } from '../types';
import ActionButton from './ActionButton';

interface SettingsProps {
  initialSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ initialSettings, onSave }) => {
  const [apiKey, setApiKey] = useState(initialSettings.apiKey || '');
  const [supabaseUrl, setSupabaseUrl] = useState(initialSettings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(initialSettings.supabaseKey || '');

  const isInitialSetup = !initialSettings.apiKey;

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave({
        apiKey: apiKey.trim(),
        supabaseUrl: supabaseUrl.trim() || undefined,
        supabaseKey: supabaseKey.trim() || undefined
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                Configuration
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                {isInitialSetup ? 'Welcome! Please enter your API keys to get started.' : 'Update your configuration settings.'}
            </p>
        </header>

        <div className="space-y-6">
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                    Google Gemini API Key <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Gemini API Key"
                    required
                />
                 <p className="mt-2 text-xs text-gray-500">Required for book identification.</p>
            </div>
            
            <div className="border-t border-gray-700 my-6"></div>

            <div>
                <h2 className="text-lg font-semibold text-gray-200">Supabase (Optional)</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Provide these details if you want to upload your book library to a Supabase Storage bucket.
                </p>
            </div>

            <div>
                <label htmlFor="supabaseUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Supabase Project URL
                </label>
                <input
                    type="url"
                    id="supabaseUrl"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-project-ref.supabase.co"
                />
            </div>
            
            <div>
                <label htmlFor="supabaseKey" className="block text-sm font-medium text-gray-300 mb-2">
                    Supabase Anon Key
                </label>
                <input
                    type="password"
                    id="supabaseKey"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Supabase anon key"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <ActionButton 
                    onClick={handleSave} 
                    text={isInitialSetup ? "Save and Continue" : "Save Settings"} 
                    primary={true} 
                    disabled={!apiKey.trim()} 
                />
            </div>
        </div>
    </div>
  );
};

export default Settings;
