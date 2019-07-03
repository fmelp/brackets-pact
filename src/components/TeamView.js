import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Chip from '@material-ui/core/Chip';

class TeamView extends React.Component {

// enterBracket = (keyset, bracketName, teamName, teamIndex)
  showTeam = (keyset) => {
    return (
      <PactContext.Consumer>
        {({ getTeamPlayerLists, enterBracket, selectedBracketName, selectedTeamsPlayersLists }) => {
          return (
            <div>
              <Chip
                size='medium'
                label={this.props.label}
                onClick={() => {
                  //THIS CALL IS NOT WORKING!!!!!!!!
                  //enter bracket IS NOT WORKING!!
                  // enterBracket(keyset, "cockend", this.props.label, selectedTeamsPlayersLists[0].indexOf(this.props.label));
                  enterBracket(keyset, selectedBracketName, this.props.label, selectedTeamsPlayersLists[0].indexOf(this.props.label));
                  //refetch updated lists
                  getTeamPlayerLists(keyset, selectedBracketName);
                }}
                color='primary'
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
