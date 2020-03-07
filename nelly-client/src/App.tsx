import React from 'react';
import './css/main.css';
import './css/react-contextmenu.css';
import './css/modal.css';
import Sidebar from "./components/Sidebar";
import FeedSummaryTable from './components/FeedSummaryTable';

interface AppProps {

}

const className = 'wrapper';

const App : React.FC<AppProps> = props => {

  document.title = 'Nelly RSS Feeder';
  
  return (
      <div className={className}>
        <Sidebar />
        <FeedSummaryTable />
      </div>
  );

}

export default App;