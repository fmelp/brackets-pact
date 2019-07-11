import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactEBContext from "../contexts/PactEBContext";
import Chip from '@material-ui/core/Chip';

class TeamViewEB extends React.Component {

  isTeamAvailable = (selectedTeamsPlayersLists, teamName) => {
    // if (selectedTeamsPlayersLists[1][selectedTeamsPlayersLists[0].indexOf(this.props.label)] === 'unassigned') {
    //   return true;
    //
    // }
    return true;
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
      <PactEBContext.Consumer>
        {({ getTeamPlayerLists,
          enterBracket,
          selectedBracketName,
          selectedTeamsPlayersLists,
          bracketData,
          advanceBracket,
          finishBracket
        }) => {
          return (
            <div>
              <Chip
                key={(Math.random() * 10)}
                size='medium'
                style={{height: 30, width:100}}
                label={this.props.label}
                onClick={() => {
                  //if is admin
                  if (bracketData[4] === keyset.publicKey){
                    alert(`press OK to advance ${this.props.label} to next round`);
                    let currentBracket = bracketData[1].slice();
                    //picking final winner
                    if (currentBracket[this.props.indexes[0] + 1] === "winner") {
                      //pick winner here and reload the page
                      currentBracket[currentBracket.length-1] = this.props.label;
                      console.log(currentBracket);
                      // finishBracket = (keyset, bracketName, winner, bracket)
                      finishBracket(keyset, selectedBracketName, this.props.label, currentBracket);
                      alert(`you picked the winner as: ${this.props.label}`);
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
                color={this.isTeamAvailable(selectedTeamsPlayersLists, this.props.label) ? 'primary' : 'secondary'}
              />
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
            this.showTeam(keyset)
          }
        </AuthContext.Consumer>
      </div>
    );
  }

}

export default TeamViewEB;
