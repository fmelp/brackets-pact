import React from 'react';
import './App.css';
import CreateBracket from './components/CreateBracket';
import ViewBrackets from './components/ViewBrackets';
import UserIcon from './components/UserIcon';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'


class App extends React.Component {
  render() {
    return (
      <div className="App">
        <UserIcon history={this.props.history}/>
        <header className="App-header">
          <p>
            Welcome to Kadena's Blockchain Brackets!
          </p>
          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => window.location.reload()}
          >
            <Link to="/login">Login or Sign-Up</Link>
          </Button>
          <p>
            Traditional Bracket Betting Section:
          </p>
          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => window.location.reload()}
          >
            <Link to="/createbb">Create Your Own Tournament BB</Link>
          </Button>

          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => window.location.reload()}
          >
            <Link to="/viewbb">View or Join Existing Tournaments BB</Link>
          </Button>

          <p>
            Empty Bracket Tournament Section:
          </p>

          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => window.location.reload()}
          >
            <Link to="/createeb">Create Your Own Tournament EB</Link>
          </Button>

          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => window.location.reload()}
          >
            <Link to="/vieweb">View or Join Existing Tournaments EB</Link>
          </Button>

        </header>
      </div>
    );
  }
}

export default App;
