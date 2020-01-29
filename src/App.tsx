import React, { useState, useEffect } from 'react';
import './css/main.css';
import './css/react-contextmenu.css';
import './css/modal.css';
import Sidebar from "./components/Sidebar";
import { ConfigManager } from './config/ConfigManager';
import JSONConfigManager from './config/JSONConfigManager';
import FeedSummaryTable from './components/FeedSummaryTable';

interface AppProps {

}

const configManager : ConfigManager = new JSONConfigManager((window as any).CONFIG_DIR);
const className = 'wrapper';
const languageTag = configManager.getSettingsManager().getSettings().language;
const systemLanguage = configManager.getLanguageManager().loadLanguage(languageTag);

export const ApplicationContext = React.createContext({language : systemLanguage});

const App : React.FC<AppProps> = props => {
    const [language, setLanguage] = useState(systemLanguage);

    useEffect(() => {
      document.title = systemLanguage.windowTitle;
    });

    return (
      <ApplicationContext.Provider value={{language}}>
        <div className={className}>
          <Sidebar feedConfigManager={configManager.getFeedConfigManager()} />
          <FeedSummaryTable feedItems={[]} />
        </div>
      </ApplicationContext.Provider>
    );

}

export default App;