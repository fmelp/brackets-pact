import React from 'react';
import './App.css';
import { AuthStore } from "./contexts/AuthContext";
import { PactStore } from "./contexts/PactContext";
import CreateBracket from './components/CreateBracket';
import ViewBrackets from './components/ViewBrackets';

function App() {
  return (
    <div className="App">
    <AuthStore>
    <PactStore>
      <header className="App-header">
        <p>
          Welcome to Kadena's Blockchain Brackets!
        </p>

        <p>CREATE</p>
        <CreateBracket/>
        <p>VIEW</p>
        <ViewBrackets/>
      </header>

    </PactStore>
    </AuthStore>
    </div>
  );
}

export default App;
