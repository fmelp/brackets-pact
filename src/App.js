import React from 'react';
import './App.css';
import './main.css';
import UserIcon from './components/UserIcon';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';



class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className = "background">
        <UserIcon history={this.props.history}/>

          <div className="welcome-style">Welcome to Kadena's Blockchain Brackets!</div>
          <Button variant="contained"
            color="primary"
            style={{ margin: 10, color: "white" }}
            onClick={() => window.location.reload()}
            className="custom-button"
            variant="contained"
          >
            <Link to="/login" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
              Login or Sign-Up
            </Link>
          </Button>
          <Grid container direction='column' alignItems='center'>
            <div className="menu-color">
              Bet on Tournament
            </div>
            <Grid container direction='row' justify='center'>
              <Button variant="contained"
                color="primary"
                style={{ margin: 20 }}
                onClick={() => window.location.reload()}
                className="custom-button"
                variant="contained"
              >
                <Link to="/createbb" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
                  Administer New Betting Tournament
                </Link>
              </Button>


              <Button variant="contained"
                color="primary"
                style={{ margin: 20 }}
                onClick={() => window.location.reload()}
                className="custom-button"
                variant="contained"
              >
                <Link to="/viewbb" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
                  View or Join Existing Tournaments
                </Link>
              </Button>
            </Grid>
            <div className="menu-color">
              Participate in Tournament
            </div>
            <Grid container direction='row' justify='center'>
              <Button variant="contained"
                color="primary"
                style={{ margin: 20 }}
                onClick={() => window.location.reload()}
                className="custom-button"
                variant="contained"
              >
                <Link to="/createeb" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
                  Administer New Empty Tournament
                </Link>
              </Button>

              <Button variant="contained"
                color="primary"
                style={{ margin: 20 }}
                onClick={() => window.location.reload()}
                className="custom-button"
                variant="contained"
              >
                <Link to="/vieweb" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
                  View or Join Existing Tournaments
                </Link>
              </Button>
            </Grid>
            <div className="menu-color">
              View All Players
            </div>
            <Button variant="contained"
              color="primary"
              style={{ margin: 20 }}
              onClick={() => window.location.reload()}
              className="custom-button"
              variant="contained"
            >
              <Link to="/allusers" style={{ textDecoration: 'none', color: "rgba(225,225,225)" }}>
                View All Players of Tournaments
              </Link>
            </Button>
          </Grid>


        </div>
          <div style={{position: "absolute", top: 10, left: 10}}>
            <img src={require('./images/kadena.png')} />
          </div>
      </div>
    );
  }
}

export default App;
