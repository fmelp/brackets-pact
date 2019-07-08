import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class PactStore extends React.Component {

  state = {
    //res => [teams, players, bracket, status, entry-fee, admin]
    selectedTeamsPlayersLists: [[], [], [], "", "", ""],
    bracketNames: [],
    selectedBracketName: ""
  };

  setSelectedBracketName = (name) => {
    this.setState({ selectedBracketName: name })
  }

  //anyone can call this
  getBracketNames = (keyset) => {
    console.log("getting bracket names");
    const cmdObj = {
      pactCode: `(brackets.get-bracket-names)`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ bracketNames: res.data });
      })
  }

  // (defun get-teams-players-seeds (bracket-name:string)
  //anyone can call this
  getTeamPlayerLists = (keyset, bracketName) => {
    console.log('getting team player lists')
    const cmdObj = {
      pactCode: `(brackets.get-teams-players-seeds ${JSON.stringify(bracketName)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ selectedTeamsPlayersLists: res.data });
      })
  }

  //Pact Contract
  //(admin-key:string bracket-name:string bracket-type:string bracket:list team-list:list seed-list:list)
  initBracket = (keyset, bracketName, bracketType, bracket, teamList, entryFee) => {
    console.log(`init-ing bracket ${bracketName} with ${teamList}`);
    // console.log(`(brackets.init-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracketType)} ${JSON.stringify(bracket)} ${JSON.stringify(teamList)} ${JSON.stringify(seedList)})`)
    const cmdObj = {
      pactCode: `(brackets.init-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracketType)} ${JSON.stringify(bracket)} ${JSON.stringify(teamList)} ${JSON.stringify(entryFee)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  // enter-bracket (bracket-name:string player-key:string team-name:string team-index:integer)
  //anyone can call this provided there are brackets available
  //SOMETHING ABOUT THIS CALL NOT WORKING!!
  enterBracketWTeam = (keyset, bracketName, teamName, teamIndex) => {
    console.log('entering bracket');
    // console.log(`(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`)
    //(enter-bracket-w-team "test" "player-key" "gators" 0)
    console.log(`(bracket.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)})`)
    const cmd = {
      //pactCode: `(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`,
      //pactCode: `(bracket.i-do-not-exist)`,
      //(defun enter-bracket-w-team (bracket-name:string player-key:string team-name:string team-index:integer)
      pactCode: `(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmd, API_HOST);
  }



  // advance-bracket (bracket-name:string bracket:list)
  //can only be called by the bracket admin keyset
  advanceBracket = (keyset, bracketName, bracket) => {
    console.log('advancing bracket');
    console.log(keyset);
    const cmdObj = {
      pactCode: `(brackets.advance-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  //(defun finish-bracket (admin-key:string bracket-name:string winner:string final-bracket:list)
  finishBracket = (keyset, bracketName, winner, bracket) => {
    console.log('finishing bracket');
    console.log(`(brackets.finish-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(winner)})`)
    const cmdObj = {
      pactCode: `(brackets.finish-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(winner)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }


  render() {
    return(
      <Context.Provider
        value={{
          ...this.state,
          setSelectedBracketName: this.setSelectedBracketName,
          initBracket: this.initBracket,
          getBracketNames: this.getBracketNames,
          getTeamPlayerLists: this.getTeamPlayerLists,
          enterBracket: this.enterBracketWTeam,
          advanceBracket: this.advanceBracket,
          finishBracket: this.finishBracket
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
