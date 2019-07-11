import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactEBContext from "../contexts/PactEBContext";
import Grid from '@material-ui/core/Grid';
import TeamViewEB from './TeamViewEB';

class TournamentViewEB extends React.Component {

  showTournament = (keyset) => {
    return (
      <PactEBContext.Consumer>
        {({
          bracketData
        }) => {
          return (
            <div>
            <Grid container direction='row' alignItems='center' justify='space-between' style={{margin: 20}}>
              {bracketData[1].map((brackets, index) => {
                //last bracket is not a list of pairings but a regular string
                //  will be either "winner" or "name_of_winning_team"
                if (typeof brackets === 'string') {
                  return (
                    <div style={{margin: 10}}>
                      <TeamViewEB
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
                            <TeamViewEB
                              key={(Math.random() * 10)}
                              label={bracket[0]}
                              indexes={[index, i]}
                            />
                            <TeamViewEB
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
      </PactEBContext.Consumer>
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

export default TournamentViewEB;
