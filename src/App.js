import React from 'react';
import './App.css';
import CreateBracket from './components/CreateBracket';
import ViewBrackets from './components/ViewBrackets';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to Kadena's Blockchain Brackets!
        </p>
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
        >
          <Link to="/createbb">Create Your Own Tournament BB</Link>
        </Button>

        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
        >
          <Link to="/viewbb">View or Join Existing Tournaments BB</Link>
        </Button>

        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
        >
          <Link to="/createeb">Create Your Own Tournament EB</Link>
        </Button>

        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
        >
          <Link to="/vieweb">View or Join Existing Tournaments EB</Link>
        </Button>

      </header>
    </div>
  );
}

export default App;
