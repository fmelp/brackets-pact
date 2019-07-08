import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Chip from '@material-ui/core/Chip';

class TeamView extends React.Component {

  isTeamAvailable = (selectedTeamsPlayersLists, teamName) => {
    if (selectedTeamsPlayersLists[1][selectedTeamsPlayersLists[0].indexOf(this.props.label)] === 'unassigned') {
      return true;

    } return false;
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
      <PactContext.Consumer>
        {({ getTeamPlayerLists,
          enterBracket,
          selectedBracketName,
          selectedTeamsPlayersLists,
          advanceBracket,
          finishBracket
        }) => {
          return (
            <div>
              <Chip
                key={(Math.random() * 10)}
                size='medium'
                label={this.props.label}
                onClick={() => {
                  if (this.isTeamAvailable(selectedTeamsPlayersLists, this.props.label)) {
                    enterBracket(keyset, selectedBracketName, this.props.label, selectedTeamsPlayersLists[0].indexOf(this.props.label));
                    alert('you have entered the tournament');
                    //reload the whole page to show new info.
                    window.location.reload();
                  } else {
                    //if admin, let them progress that team
                    //  admin address is selectedTeamsPlayersLists[5]
                    //else tell them they cannot select
                    //make sure it isnt final

                    //is admin
                    if (selectedTeamsPlayersLists[5] === keyset.publicKey) {
                      let currentBracket = selectedTeamsPlayersLists[2].slice();
                      //is picking final winner
                      if (currentBracket[this.props.indexes[0] + 1] === "winner") {
                        //pick winner here and reload the page
                        currentBracket[currentBracket.length-1] = this.props.label;
                        console.log(currentBracket);
                        finishBracket(keyset, selectedBracketName, this.props.label, currentBracket);
                        alert(`you picked the winner as: ${this.props.label}`);
                      //is advancing team from any round
                      } else {
                        console.log(this.props.indexes);
                        console.log(currentBracket);
                        let updatedBracket = this.updateBracketArray(currentBracket, this.props.indexes[0], this.props.indexes[1], this.props.label);
                        console.log(updatedBracket);
                        advanceBracket(keyset, selectedBracketName, updatedBracket);
                        alert(`you advanced team ${this.props.label} to round ${this.props.indexes[0] + 1}`);
                      }
                    //is not an admin and can only pick an available team
                    } else {
                      alert('you cannot select this, please pick a blue icon')
                    }
                  }

                }}
                color={this.isTeamAvailable(selectedTeamsPlayersLists, this.props.label) ? 'primary' : 'secondary'}
              />
            </div>
          )
        }}
      </PactContext.Consumer>
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

export default TeamView;
