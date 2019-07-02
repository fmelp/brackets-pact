import React from 'react';
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Button from '@material-ui/core/Button';

class TestingCalls extends React.Component {

//(admin-key:string bracket-name:string bracket-type:string bracket:list team-list:list seed-list:list)
//(keyset, bracketName, bracketType, bracket, teamList, seedList)
  showData = (keyset) => {
    return (
      <PactContext.Consumer>
        {({ brackets, bracketNames, initBracket, getBracketNames }) => {
          return (
            <div>
              <Button variant="contained"
                color="primary"
                style={{ marginBottom: 10 }}

                onClick={() => initBracket(keyset, "test2", "single-elimination", [], ["gators", "muppets", "mutants", "scammers"])}>
                create
              </Button>
              <Button variant="contained"
                color="primary"
                style={{ marginBottom: 10 }}
                onClick={() => getBracketNames(keyset) }>
                info
              </Button>
            </div>
          );
        }}
      </PactContext.Consumer>
    );
  }

  render() {
    return (
      <AuthContext.Consumer>
        {({ keyset }) =>
          this.showData(keyset)
        }
      </AuthContext.Consumer>
    );
  }

}

export default TestingCalls;
