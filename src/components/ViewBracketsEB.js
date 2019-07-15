import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactEBContext from "../contexts/PactEBContext";
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TournamentViewEB from "./TournamentViewEB";
import UserIcon from './UserIcon';


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
          <p> Tournament is Full!! </p>
        );
      }
      if (bracketData[0].length !== 0 && bracketData[2] === 'initiated'){
        return (
          <p> You Are Signed Up! Now Waiting for Tournament To Start </p>
        );
      }
    }
  }

  showCurrentPlayers = (bracketData) => {
    const removeBlanks = bracketData[0].filter(x => x !== 'unassigned');
    let components = []
    components.push(<p>current players:</p>)
    removeBlanks.map(player => {
      components.push(<p>{player}</p>)
    });
    return components
  }

  showAdminButtons = (keyset, bracketData, bracketName, advanceBracket) => {
    //is admin and tournament not already initiated
    if (keyset.publicKey === bracketData[4]) {
      let components = [];
      components.push(<p> Admin Functionality: </p>);
      if  (bracketData[2] === 'initiated') {
      components.push(
        <div>
          <Button variant="contained"
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
    if (bracketData[1][bracketData[1].length - 1] !== "winner" && bracketData[2] !== 'initiated'){
      components.push(
        <Button variant="contained"
          color="primary"
          style={{ marginBottom: 10, marginTop: 10 }}
          onClick={() => {
            //add functionality to pay the winner
            //needs to be implemented at contract level first...
            alert(`you just paid the winner`)
          }}
        >
          Pay Winner
        </Button>
      );
    }
    // else {
    //   components.push(<p>None Available at this stage</p>);
    // }
    return (components);
    }
  }

  isPlayerWinner = (keyset, bracketData) => {
    if (keyset.publicKey === bracketData[1][bracketData[1].length - 1]){
      return (<p>You are the winner!</p>);
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
          advanceBracket
        }) => {
          return (
            <div>
            <UserIcon history={this.props.history}/>
            <Grid container direction='column' alignItems='center'>
              <Button variant="contained"
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
              <p>Status: {bracketData[2]}</p>
              <p>Price to Enter: ${bracketData[3]}</p>
              <p>Max number of Players: {bracketData[0].length}</p>
              {this.showCurrentPlayers(bracketData)}
              {this.showSignUp(enterTournament, bracketData, keyset, selectedBracketName)}
              {this.showAdminButtons(keyset, bracketData, selectedBracketName, advanceBracket)}
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
