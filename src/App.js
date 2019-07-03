import React from 'react';
import './App.css';
import { AuthStore } from "./contexts/AuthContext";
import { PactStore } from "./contexts/PactContext";
// import Button from '@material-ui/core/Button';
import TestingCalls from './components/TestingCalls';
import CreateBracket from './components/CreateBracket';
import ViewBrackets from './components/ViewBrackets';

function App() {
  return (
    <div className="App">
    <AuthStore>
    <PactStore>
      <header className="App-header">
        <TestingCalls/>
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


// <Button variant="contained"
//   color="primary"
//   style={{ marginBottom: 10 }}
//   onClick={() => console.log('clicked')}>
//   Create New Bracket
// </Button>
// <Button variant="contained"
//   color="primary"
//   style={{ marginBottom: 10 }}
//   onClick={() => console.log('clicked')}>
//   View Existing Brackets
// </Button>
// <Button variant="contained"
//   color="primary"
//   style={{ marginBottom: 10 }}
//   onClick={() => console.log('clicked')}>
//   Log-in
// </Button>
// <a
//   className="App-link"
//   href="https://github.com/kadena-io/pact"
//   target="_blank"
//   rel="noopener noreferrer"
// >
//   Learn About Pact
// </a>
// <TestingCalls/>
