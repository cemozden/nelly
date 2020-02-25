import React, { useState, useEffect } from 'react';
import './css/main.css';
import './css/react-contextmenu.css';
import './css/modal.css';
import Sidebar from "./components/Sidebar";
import { ConfigManager } from './config/ConfigManager';
import JSONConfigManager from './config/JSONConfigManager';
import FeedSummaryTable from './components/FeedSummaryTable';
import { FeedScheduler } from './scheduler/FeedScheduler';
import CronFeedScheduler from './scheduler/CronFeedScheduler';

interface AppProps {

}

const configManager : ConfigManager = new JSONConfigManager((window as any).CONFIG_DIR);
const className = 'wrapper';
const languageTag = configManager.getSettingsManager().getSettings().language;
const systemLanguage = configManager.getLanguageManager().loadLanguage(languageTag);

const feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();
const cronFeedScheduler : FeedScheduler = new CronFeedScheduler();

feedConfigs.forEach(fc => {
  try {
    cronFeedScheduler.addFeedToSchedule(fc);
  }
  catch (err) {
      const options = {
        type: 'error',
        buttons: ['Ok'],
        title: 'Nelly | ' + systemLanguage.error,
        message: err.message
    };
    (window as any).electron.dialog.showMessageBox(null, options);
  }
});

export const ApplicationContext = React.createContext({language : systemLanguage, configManager : configManager});

const App : React.FC<AppProps> = props => {
    const [language] = useState(systemLanguage);

    useEffect(() => {
      document.title = language.windowTitle;
    });
    
    return (
      <ApplicationContext.Provider value={{language, configManager}}>
        <div className={className}>
          <Sidebar />
          <FeedSummaryTable feedItems={[]} />
        </div>
      </ApplicationContext.Provider>
    );

}

export default App;