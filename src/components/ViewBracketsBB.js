import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactBBContext from "../contexts/PactBBContext";
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TournamentViewBB from "./TournamentViewBB";
import UserIcon from './UserIcon';

class ViewBracketsBB extends React.Component {


  state = {
    selectedBracket: "",
    disabledButton: true
  }

  componentDidMount() {
    if (this.state.selectedBracket !== "") {
      window.location.reload()
    }
  }

  showPlayerBracket = (keyset, bracketData, setUserSelectedBracket, userSelectedBracket) => {
    console.log('step1');
    let components = [];
    //is not admin and tournament is in initiated stage
    if (bracketData[5] !== keyset.publicKey) {
      components.push(
        <p>Your Bracket Picks:</p>
      );
      //is player but has not enetered tournament
      console.log(bracketData[0])
      if (!bracketData[0].includes(keyset.publicKey) && bracketData[3] === 'initiated') {
        console.log('step2');
        //show initial bracket Status
        //let them modify it
        //  pass a copy of the bracket array with initial status

        //had to do this if otherwise the set state in the Context went into infinite loop
        if (userSelectedBracket.length === 0){
          const bracketCopy = bracketData[1].slice()
          setUserSelectedBracket(bracketCopy)
        }
        components.push(<TournamentViewBB bracketToShow={userSelectedBracket}/>);
      }
      //is player and has entered tournament
      if (bracketData[0].includes(keyset.publicKey)) {
        console.log('step3');
        //show their bracket
        //do not let them modify
        //get the index of player's bracket
        console.log('here');
        const bracketIndex = bracketData[0].indexOf(keyset.publicKey);
        console.log(bracketIndex);
        console.log(bracketData[2]);
        const playerBracket = bracketData[2][bracketIndex];
        console.log(playerBracket);

        components.push(<TournamentViewBB bracketToShow={playerBracket}/>);
      }
    }
    return components;
  }

  disabledButton = (bracketData, keyset) => {
    if (bracketData[5] === keyset.publicKey) {
      return true;
    }
    if (!bracketData[0].includes(keyset.publicKey)) {
      console.log('true');
      return true;
    }
    return false;
  }

  showSignUp = (keyset, bracketData, userSelectedBracket, enterTournament) => {
    let components = [];
    //anyone can sign up as long as the tournament hasnt started yet
    if (bracketData[3] === 'initiated' && !bracketData[0].includes(keyset.publicKey) && keyset.publicKey !== bracketData[5]) {
      components.push(<p>Tournament still open for sign-ups!</p>);
      components.push(<p>To participate use the bracket below to simulate your choices</p>);
      components.push(<p>Click on a team to advance it to next round</p>);
      components.push(<p>Click Sign-Up when your bracket is complete</p>);
      components.push(<p>NOTE: once you submit you will not be able to change your picks</p>);
      //sign in button
      components.push(
        <Button variant="contained"
          color="primary"
          //if is admin or is in tournament dont show the button
          // disabled={this.disabledButton(keyset, bracketData)}
          style={{ marginBottom: 10, marginTop: 10 }}
          onClick={() => {
            //implement entering the tournament
            // enterTournament = (keyset, bracketName, playerBracket)
            alert("press ok to enter the tournament with the selected bracket format");
            enterTournament(keyset, this.state.selectedBracket, userSelectedBracket);
            this.props.history.push('/');

          }}
        >
          Sign Up!
        </Button>
      );
    }
    //tell users when they cant sign up
    if ((bracketData[3] === 'in-progress' || bracketData[3] === 'complete') && !bracketData[0].includes(keyset.publicKey)) {
      components.push(<p>Sorry, it is too late to join this tournament</p>)
    }
    //if user is already in the tournamet
    if (bracketData[0].includes(keyset.publicKey)){
      components.push(<p>You're in this to win this!</p>)
    }

    return components;
  }

  showAdminButtons = (keyset, bracketData) => {
    let components = []
    if (keyset.publicKey === bracketData[5]){
      components.push(<p>Current number of players signed up: {bracketData[0].length}</p>);
      components.push(<p>You are the Admin of this bracket (and cannot play with this account)</p>);
      components.push(<p>Click on the teams below to advance them to next round</p>);
      components.push(<p>NOTE: When you advance the tournament no one else will be able to sign up</p>);
      if (bracketData[3] === 'complete') {
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
    }
    return components
  }

  showRealTimeTournament = (keyset, bracketData) => {
    if (bracketData[3] === 'initiated' && keyset.publicKey !== bracketData[5]) {
      return (<p>Tournament has not started yet</p>);
    } else {
      return (<TournamentViewBB bracketToShow={bracketData[1]}/>);
    }
  }

  showDropdown = (keyset) => {
    return (
      <PactBBContext.Consumer>
        {({ bracketNames,
          bracketData,
          getBracketNames,
          getBracketData,
          setSelectedBracketName,
          setUserSelectedBracket,
          userSelectedBracket,
          enterTournament,
          selectedBracketName
        }) => {
          // getBracketNames(keyset);
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
              <p>Status: {bracketData[3]}</p>
              <p>Price to Enter: ${bracketData[4]}</p>

              {this.showSignUp(keyset, bracketData, userSelectedBracket, enterTournament)}
              {this.showPlayerBracket(keyset, bracketData, setUserSelectedBracket, userSelectedBracket)}
              {this.showAdminButtons(keyset, bracketData)}
              <p>Real-Time Tournament Status:</p>
              {this.showRealTimeTournament(keyset, bracketData)}

            </Grid>
            </div>
          )
        }}
      </PactBBContext.Consumer>
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

export default ViewBracketsBB;



// console.log(bracketData[1]);
// bracketData[1].map((brackets, i) => {
//   if (i !== 0){
//     //last round is the winner
//     if (i === (bracketData[1].length - 1)) {
//       components.push(<p>Winner pick:</p>);
//     } else {
//       components.push(<p>Round {i + 1} picks:</p>);
//     }
//     //make sure its not the last element in the array
//     if (typeof brackets !== 'string') {
//       components.push(
//         <Select
//           style={{ marginBottom: 10 }}
//           native
//           value={this.state.numTeams}
//           onChange={(e) => {
//             this.renderTextInputs(this.state.numTeams);
//             this.setState({
//               numTeams: parseInt(e.target.value),
//               teamList: Array(e.target.value).fill(""),
//               buttonDisabled: true
//             })}
//           }
//         >
//         </Select>
//       )
//       brackets.map((bracket, j) => {
//         components.push(
//           // <Select
//           //   style={{ marginBottom: 10 }}
//           //   native
//           //   value={this.state.numTeams}
//           //   onChange={(e) => {
//           //     this.renderTextInputs(this.state.numTeams);
//           //     this.setState({
//           //       numTeams: parseInt(e.target.value),
//           //       teamList: Array(e.target.value).fill(""),
//           //       buttonDisabled: true
//           //     })}
//           //   }
//           // >
//           //   <option value={0}>PLEASE SELECT NUMBER OF TEAMS</option>
//           //   <option value={2}>Two</option>
//           //   <option value={4}>Four</option>
//           //   <option value={8}>Eight</option>
//           //   <option value={16}>Sixteen</option>
//           //   <option value={32}>Thirty-Two</option>
//           // </Select>
//         );
//       });
//     }
//   }
// });
