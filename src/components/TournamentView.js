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
                if (brackets === "winner") {
                  return (
                    <div style={{margin: 10}}>
                      <TeamView
                        key={index}
                        label="winner"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div>
                      {brackets.map((bracket, index) => (
                          <Grid container direction='column' justify='space-between' style={{margin: 10, marginRight: 10 }}>
                            <TeamView
                              key={index}
                              label={bracket[0]}
                            />
                            <TeamView
                              key={(index + 1000)}
                              label={bracket[1]}
                            />
                          </Grid>
                      ))}
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
