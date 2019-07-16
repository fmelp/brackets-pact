import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactBBContext from "../contexts/PactBBContext";
import Chip from '@material-ui/core/Chip';

class TeamViewBB extends React.Component {


  isTeamAvailable = (selectedTeamsPlayersLists, teamName) => {
    // if (selectedTeamsPlayersLists[1][selectedTeamsPlayersLists[0].indexOf(this.props.label)] === 'unassigned') {
    //   return true;
    //
    // } return false;
    return true;
  }


  //[bracket], [[bracket], [bracket]...]
  getWinner = (finalBracket, playerBrackets, players) => {
    //placeholder array to put players scores in
    let playerPoints = Array(playerBrackets.length).fill(0);
    //loop through every player's bracket
    playerBrackets.forEach((playerBracket, resultIndex) => {
      for (let roundIndex = 0; roundIndex < playerBracket.length; roundIndex++) {
        //scoring power of two for every round
        //means they will get 1 point at round 0 even though its obvious
        const points = 2 ** roundIndex;
        for (let teamIndex = 0; teamIndex < playerBracket[roundIndex].length; teamIndex++) {
          // check first game in tuple
          if (finalBracket[roundIndex][teamIndex][0] === playerBracket[roundIndex][teamIndex][0]) {
            playerPoints[resultIndex] = playerPoints[resultIndex] + points
          }
          // check second game in tuple
          if (finalBracket[roundIndex][teamIndex][1] === playerBracket[roundIndex][teamIndex][1]) {
            playerPoints[resultIndex] = playerPoints[resultIndex] + points
          }
        }
      }
    })
    //this means that if scores are tied first to enter wins...
    const highestScorerIndex = playerPoints.indexOf(Math.max(...playerPoints))
    //return the "winner's" key
    return players[highestScorerIndex];
  }


  updateBracketArray = (currentBracket, roundIndex, pairingIndex, teamName) => {
    //we deal with the case of picking tourment winner in onClick()
    const nextRound = roundIndex + 1;
    //subtract one if its odd
    pairingIndex = (pairingIndex % 2 !== 0) ? (pairingIndex - 1) : pairingIndex;
    const teamPairIndex = Math.floor((pairingIndex + 1) / 2);
    //needs to be 0 or 1 -> gonna make the first team through 0.
    const teamIndexInPair = (currentBracket[nextRound][teamPairIndex][0] === 'winner') ? 0 : 1;
    currentBracket[nextRound][teamPairIndex][teamIndexInPair] = teamName;
    return currentBracket;
  }

  showTeam = (keyset) => {
    return (
      <PactBBContext.Consumer>
        {({ getTeamPlayerLists,
          enterBracket,
          selectedBracketName,
          advanceBracket,
          finishBracket,
          setUserSelectedBracket,
          bracketData,
          userSelectedBracket
        }) => {
          return (
            <div>
              <Chip
                key={(Math.random() * 10)}
                size='medium'
                label={this.props.label}
                onClick={() => {
                    //is player and is in tournament
                    //  do not let them modify
                    //is player and is not in tournament
                    //  let them modify with setUserSelectedBracket local calls
                    if (bracketData[5] !== keyset.publicKey && !bracketData[0].includes(keyset.publicKey)){
                      console.log('player in bb')
                      let currentBracket = userSelectedBracket.slice();
                      if (currentBracket[this.props.indexes[0] + 1] === "winner") {
                        //pick winner here
                        currentBracket[currentBracket.length-1] = this.props.label;
                        console.log(currentBracket);
                        setUserSelectedBracket(currentBracket);
                      //is advancing team from any round
                      } else {
                        console.log(currentBracket);
                        let updatedBracket = this.updateBracketArray(currentBracket, this.props.indexes[0], this.props.indexes[1], this.props.label);
                        console.log(updatedBracket);
                        setUserSelectedBracket(updatedBracket);
                      }
                    }

                    //if is admin
                    if (bracketData[5] === keyset.publicKey){
                      alert(`press OK to advance ${this.props.label} to next round`);
                      let currentBracket = bracketData[1].slice();
                      //picking final winner
                      if (currentBracket[this.props.indexes[0] + 1] === "winner") {
                        //pick winner here and reload the page
                        currentBracket[currentBracket.length-1] = this.props.label;
                        console.log(currentBracket);
                        // finishBracket = (keyset, bracketName, winner, bracket)
                        //note this winner is the winner from the players, not the team that won!
                        const winner = this.getWinner(bracketData[1].slice(), bracketData[2].slice(), bracketData[0].slice());
                        finishBracket(keyset, selectedBracketName, winner, currentBracket);
                        console.log(bracketData);
                        alert(`you picked the winning team as: ${this.props.label}`);
                      //is advancing team from any round
                      } else {
                        console.log(this.props.indexes);
                        console.log(currentBracket);
                        let updatedBracket = this.updateBracketArray(currentBracket, this.props.indexes[0], this.props.indexes[1], this.props.label);
                        console.log(updatedBracket);
                        // advanceBracket = (keyset, bracketName, bracket)
                        advanceBracket(keyset, selectedBracketName, updatedBracket);
                        alert(`you advanced team ${this.props.label} to round ${this.props.indexes[0] + 1}`);
                      }
                      window.location.reload();
                    }

                }}
                color={this.isTeamAvailable() ? 'primary' : 'secondary'}
              />
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
            this.showTeam(keyset)
          }
        </AuthContext.Consumer>
      </div>
    );
  }

}

export default TeamViewBB;
