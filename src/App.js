import React from 'react';
import './App.css';
import { AuthStore } from "./contexts/AuthContext";
import { PactStore } from "./contexts/PactContext";
import Button from '@material-ui/core/Button';
import TestingCalls from './components/TestingCalls';
import CreateBracket from './components/CreateBracket';

function App() {
  return (
    <div className="App">
    <AuthStore>
    <PactStore>
      <header className="App-header">
        <p>
          Welcome to Kadena's Blockchain Brackets!
        </p>
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10 }}
          onClick={() => console.log('clicked')}>
          Create New Bracket
        </Button>
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10 }}
          onClick={() => console.log('clicked')}>
          Join Existing Bracket
        </Button>
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10 }}
          onClick={() => console.log('clicked')}>
          Check Existing Bracket Status
        </Button>
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10 }}
          onClick={() => console.log('clicked')}>
          Log-in
        </Button>
        <a
          className="App-link"
          href="https://github.com/kadena-io/pact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn About Pact
        </a>
        <TestingCalls/>
        <CreateBracket/>
      </header>
    </PactStore>
    </AuthStore>
    </div>
  );
}

export default App;
