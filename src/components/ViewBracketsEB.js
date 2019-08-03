import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactEBContext from "../contexts/PactEBContext";
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TournamentViewEB from "./TournamentViewEB";
import UserIcon from './UserIcon';
import Fab from '@material-ui/core/Fab';


class ViewBracketsEB extends React.Component {

  state = {
    selectedBracket: ""
  }

  componentDidMount() {
    if (this.state.selectedBracket !== "") {
      window.location.reload()
    }
  }

  //helper methods
  //function to make the first round draw for the teams.
  makeDraw = (teamList) => {
    console.log(this.makeEmptyArray(teamList));
    let teamsCopy = teamList.slice();
    //shuffle it
    teamsCopy = this.shuffle(teamsCopy);
    //create empty array format for all rounds
    let roundLists = this.makeEmptyArray(teamList);
    let firstRoundDraw = []
    while (teamsCopy.length > 0) {
      let pair = [];
      pair[0] = teamsCopy.shift();
      pair[1] = teamsCopy.pop();
      firstRoundDraw.push(pair);
    }
    roundLists[0] = firstRoundDraw;
    return roundLists;
  }

  shuffle = (array) => {
    let counter = array.length;

  // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }

    return array;
  }

  makeEmptyArray = (teamList) => {
    let numTeams = teamList.length;
    let roundLists = Array((Math.log2(numTeams) + 1)).fill([]);
    let index = 0;
    while (numTeams > 1) {
      roundLists[index] = Array(numTeams / 2).fill(["winner", "winner"]);
      numTeams = numTeams / 2;
      index = index + 1;
    }
    roundLists[(roundLists.length - 1)] = "winner"
    return roundLists;
  }

  showSignUp = (enterTournament, bracketData, keyset, bracketName) => {
    //make sure there is space and that tournament has not started
    if (bracketData[0].includes("unassigned") && bracketData[2] === 'initiated' && !bracketData[0].includes(keyset.publicKey)) {
      const insertIndex = bracketData[0].indexOf("unassigned");
      return (
        <Button variant="contained"
          className="custom-button"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
          onClick={() => {
            // enterTournament = (keyset, bracketName, playerIndex)
            alert(`press OK to join tournament ${bracketName} for $${bracketData[3]}`)
            enterTournament(keyset, bracketName, insertIndex);
            this.props.history.push('/')
          }}
        >
          Sign Up!
        </Button>
      );
    } else {
      if (bracketData[0].length !== 0 && bracketData[2] !== 'initiated'){
        return (
          <div className="status-subtitle"> Tournament is Full!! </div>
        );
      }
      if (bracketData[0].length !== 0 && bracketData[2] === 'initiated'){
        return (
          <div className="status-subtitle"> You Are Signed Up! Now Waiting for Tournament To Start </div>
        );
      }
    }
  }

  showCurrentPlayers = (bracketData) => {
    console.log(bracketData)
    const removeBlanks = bracketData[0].filter(x => x !== 'unassigned');
    let components = []
    components.push(<div className="status-subtitle">current players:</div>)
    removeBlanks.map(player => {
      components.push(<div className="status-subtitle">{bracketData[5][player]}</div>)
    });
    return components
  }

  showAdminButtons = (keyset, bracketData, bracketName, advanceBracket, payWinner) => {
    //is admin and tournament not already initiated
    if (keyset.publicKey === bracketData[4]) {
      let components = [];
      components.push(<div className="status-subtitle"> Admin Functionality: </div>);
      if  (bracketData[2] === 'initiated') {
      components.push(
        <div>
          <Button variant="contained"
            className="custom-button"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => {
              //be careful cause this is theoretically async
              alert('press OK to initiate the tournament with the current participants')
              // (keyset, bracketName, bracket)
              advanceBracket(keyset, bracketName, this.makeDraw(bracketData[0]))
              this.props.history.push('/')
            }}
          >
            Make Draw and Initiate Tournament
          </Button>
        </div>
      );
      console.log(bracketData[1])
    }
    //show pay winner button
    if (bracketData[1][bracketData[1].length - 1] !== "winner" && bracketData[2] !== 'initiated' && bracketData[2] !== 'winner-paid'){
      components.push(
        <Button variant="contained"
          className="custom-button"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
          onClick={() => {
            //add functionality to pay the winner
            //needs to be implemented at contract level first...
            alert(`you just paid the winner`);
            payWinner(keyset, bracketName);
            this.props.history.push('/');
          }}
        >
          Pay Winner
        </Button>
      );
    }
    if (bracketData[2] === 'winner-paid') {
      components.push(<div className="status-subtitle">Tournament is over and winner is paid</div>);
    }
    // else {
    //   components.push(<p>None Available at this stage</p>);
    // }
    return (components);
    }
  }

  isPlayerWinner = (keyset, bracketData) => {
    if (keyset.publicKey === bracketData[1][bracketData[1].length - 1]){
      return (<div className="status-subtitle">You are the winner!</div>);
    }
  }


  showDropdown = (keyset) => {
    return (
      <PactEBContext.Consumer>
        {({ bracketNames,
          bracketData,
          getBracketNames,
          getBracketData,
          setSelectedBracketName,
          selectedBracketName,
          enterTournament,
          advanceBracket,
          payWinner
        }) => {
          return (
            <div>
            <UserIcon history={this.props.history}/>
            <Grid container direction='column' alignItems='center'>
              <div className = "subTitle">Empty Bracket Betting Section</div>
              <Button variant="contained"
                className="custom-button"
                color="primary"
                style={{ marginBottom: 10, marginTop: 10 }}
                onClick={() => {
                  //be careful cause this is theoretically async
                  getBracketNames(keyset);

                }}
              >
                Get All Brackets
              </Button>
              <Select
                style={{ marginBottom: 10 }}
                native
                value={this.state.selectedBracket}
                onChange={(e) => {
                  this.setState({
                    selectedBracket: e.target.value
                  })
                  getBracketData(keyset, e.target.value);
                  setSelectedBracketName(e.target.value);
                }
                }
              >
                <option value={0}>PLEASE SELECT A BRACKET</option>
                {bracketNames.map((name, index) => (
                  <option value={name} key={index}>{name}</option>
                ))}
              </Select>
              <Fab variant="extended" className="fab-button"
                style={bracketData[2]==='initiated' ? {backgroundColor:"#f50056ef"} : {backgroundColor:"green"}} disabled="true">
                Status: {bracketData[2]}
              </Fab>
              <Fab variant="extended"  className="fab-button" style={{backgroundColor:"#f50056ef"}} disabled="true">
                Price to enter: {bracketData[3]} coins
              </Fab>
              <div className="status-subtitle">Max number of Players: {bracketData[0].length}</div>
              {this.showCurrentPlayers(bracketData)}
              {this.showSignUp(enterTournament, bracketData, keyset, selectedBracketName)}
              {this.showAdminButtons(keyset, bracketData, selectedBracketName, advanceBracket, payWinner)}
              {this.isPlayerWinner(keyset, bracketData)}

            </Grid>
              <TournamentViewEB/>
            </div>
          )
        }}
      </PactEBContext.Consumer>
    )
  }

  render() {
    return (
      <div>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <img src={require('../images/kadena.png')} />
        </div>
        <AuthContext.Consumer>
          {({ keyset }) =>
            this.showDropdown(keyset)
          }
        </AuthContext.Consumer>
      </div>
    );
  }
}

export default ViewBracketsEB;
