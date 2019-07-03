import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TournamentView from './TournamentView';

class ViewBrackets extends React.Component {

  state = {
    selectedBracket: ""
  }

  showDropdown = (keyset) => {
    return (
      <PactContext.Consumer>
        {({ bracketNames,
          selectedTeamsPlayersLists,
          getBracketNames,
          getTeamPlayerLists,
          setSelectedBracketName
        }) => {
          // getBracketNames(keyset);
          return (
            <div>
            <Grid container direction='column'>
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
                  getTeamPlayerLists(keyset, e.target.value);
                  setSelectedBracketName(e.target.value);
                }
                }
              >
                <option value={0}>PLEASE SELECT A BRACKET</option>
                {bracketNames.map((name, index) => (
                  <option value={name} key={index}>{name}</option>
                ))}
              </Select>
              <p>Status: {selectedTeamsPlayersLists[3]}</p>
            </Grid>
            <TournamentView/>
            </div>
          )
        }}
      </PactContext.Consumer>
    )
  }

  showOptions = (bracketNames) => {

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

export default ViewBrackets;

// <Grid container direction='column'>
//   <Select
//     style={{ marginBottom: 10 }}
//     native
//     value={this.state.selectedBracket}
//     onChange={(e) => {
//       this.renderTextInputs(this.state.numTeams);
//       this.setState({
//         numTeams: parseInt(e.target.value),
//         teamList: Array(e.target.value).fill(""),
//         buttonDisabled: true
//       })}
//     }
//   >
//     <option value={0}>PLEASE SELECT NUMBER OF TEAMS</option>
//     <option value={2}>Two</option>
//     <option value={4}>Four</option>
//     <option value={8}>Eight</option>
//     <option value={16}>Sixteen</option>
//     <option value={32}>Thirty-Two</option>
//   </Select>
// </Grid>
