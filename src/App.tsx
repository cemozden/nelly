import React from 'react';
import './css/main.css';
import SideBar from "./components/Sidebar";

interface ApplicationState {
  language : string/*ApplicationLanguage*/
}


const className = 'wrapper';

class App extends React.Component<any, ApplicationState> {

  constructor(props : any) {
    super(props);
    this.state = {
      language : 'en'      
    };
  }

  render() {
    return (
      <div className={className}>
        <SideBar />
      </div>
    );
  }

}
export default App;