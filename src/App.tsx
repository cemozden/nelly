import React from 'react';
import './css/main.css';
import SideBar from "./components/Sidebar";
import { Language, DEFAULT_ENGLISH_LANGUAGE } from './config/Language';
import { ConfigManager } from './config/ConfigManager';
import JSONConfigManager from './config/JSONConfigManager';

interface ApplicationState {
  language : Language
}

const configManager : ConfigManager = new JSONConfigManager((window as any).CONFIG_DIR);
const className = 'wrapper';

class App extends React.Component<any, ApplicationState> {

  constructor(props : any) {
    super(props);
    this.state = {
      language : DEFAULT_ENGLISH_LANGUAGE      
    };
  }

  render() {
    return (
      <div className={className}>
        <SideBar feedConfigManager={configManager.getFeedConfigManager()} />
      </div>
    );
  }

}
export default App;