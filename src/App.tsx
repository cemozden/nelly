import React from 'react';
import './css/main.css';
import './css/react-contextmenu.css';
import Sidebar from "./components/Sidebar";
import { Language } from './config/Language';
import { ConfigManager } from './config/ConfigManager';
import JSONConfigManager from './config/JSONConfigManager';
import FeedSummaryTable from './components/FeedSummaryTable';

interface ApplicationState {
  language : Language
}

const configManager : ConfigManager = new JSONConfigManager((window as any).CONFIG_DIR);
const className = 'wrapper';
const languageTag = configManager.getSettingsManager().getSettings().language;
const systemLanguage = configManager.getLanguageManager().loadLanguage(languageTag);

export const ApplicationContext = React.createContext({language : systemLanguage});

class App extends React.Component<any, ApplicationState> {

  constructor(props : any) {
    super(props);
    this.state = {
      language : systemLanguage
    };

    document.title = systemLanguage.windowTitle;

  }

  render() {
    return (
      <ApplicationContext.Provider value={this.state}>
        <div className={className}>
          <Sidebar feedConfigManager={configManager.getFeedConfigManager()} />
          <FeedSummaryTable feedItems={[]} />
        </div>
      </ApplicationContext.Provider>
      
    );
  }

}


export default App;