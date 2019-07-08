import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Grid from '@material-ui/core/Grid';
import TeamView from './TeamView';

class TournamentView extends React.Component {

  showTournament = (keyset) => {
    return (
      <PactContext.Consumer>
        {({
          selectedTeamsPlayersLists
        }) => {
          return (
            <div>
            <Grid container direction='row' alignItems='center' justify='space-between' style={{margin: 20}}>
              {selectedTeamsPlayersLists[2].map((brackets, index) => {
                //last bracket is not a list of pairings but a regular string
                //  will be either "winner" or "name_of_winning_team"
                if (typeof brackets === 'string') {
                  return (
                    <div style={{margin: 10}}>
                      <TeamView
                        key={(Math.random() * 10)}
                        label={brackets}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div>
                      {brackets.map((bracket, i) => {
                        return (
                          <Grid container direction='column' justify='space-between' style={{margin: 10, marginRight: 10 }}>
                            <TeamView
                              key={(Math.random() * 10)}
                              label={bracket[0]}
                              indexes={[index, i]}
                            />
                            <TeamView
                              key={(Math.random() * 10)}
                              label={bracket[1]}
                              indexes={[index, i]}
                            />
                          </Grid>
                      )})}
                    </div>
                  );
                }
              })}
            </Grid>
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
            this.showTournament(keyset)
          }
        </AuthContext.Consumer>
      </div>
    )
  }

}

export default TournamentView;
