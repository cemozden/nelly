import React from 'react';
import './css/main.css';
import './css/react-contextmenu.css';
import './css/modal.css';
import Sidebar from "./components/Sidebar";
import FeedSummaryTable from './components/FeedSummaryTable';
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

interface AppProps {

}

const className = 'wrapper';

const App : React.FC<AppProps> = props => {

  document.title = 'Nelly RSS Feeder';
  
  return (
    <DndProvider backend={Backend}>
      <div className={className}>
        <Sidebar />
        <FeedSummaryTable />
      </div>
    </DndProvider>
      
  );

}

export default App;