import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class PactBBStore extends React.Component {

  state = {
    //res => [players, bracket, players-bets, status, entry-fee, admin]
    bracketData: [[], [], [], "", "", ""],
    bracketNames: [],
    selectedBracketName: "",
    userSelectedBracket: []
  };

  setUserSelectedBracket = (bracket) => {
    this.setState({ userSelectedBracket: bracket });
  }

  setSelectedBracketName = (name) => {
    this.setState({ selectedBracketName: name })
  }

  //anyone can call this
  getBracketNames = (keyset) => {
    console.log("getting bb bracket names");
    const cmdObj = {
      pactCode: `(brackets.get-brackets-bb)`,
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
  getBracketData = (keyset, bracketName) => {
    console.log('getting bb bracket data')
    const cmdObj = {
      pactCode: `(brackets.get-bb-info ${JSON.stringify(bracketName)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ bracketData: res.data });
      })
  }

  initBracket = (keyset, bracketName, bracket, entryFee) => {
    console.log(`init-ing bb bracket ${bracketName}`);
    const cmdObj = {
      pactCode: `(brackets.init-bracket-betting ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(entryFee)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  enterTournament = (keyset, bracketName, playerBracket) => {
    console.log('entering bb bracket');
    console.log(`(brackets.enter-tournament-bb ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(playerBracket)})`);
    // console.log(`(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`)
    //(enter-bracket-w-team "test" "player-key" "gators" 0)
    const cmd = {
      //pactCode: `(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`,
      //pactCode: `(bracket.i-do-not-exist)`,
      //(defun enter-bracket-w-team (bracket-name:string player-key:string team-name:string team-index:integer)
      pactCode: `(brackets.enter-tournament-bb ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(playerBracket)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmd, API_HOST);
  }



  //can only be called by the bracket admin keyset
  advanceBracket = (keyset, bracketName, bracket) => {
    console.log('advancing bracket bb');
    console.log(`(brackets.advance-bracket-bb ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`);
    const cmdObj = {
      pactCode: `(brackets.advance-bracket-bb ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  finishBracket = (keyset, bracketName, winner, bracket) => {
    console.log('finishing bracket bb');
    console.log(`(brackets.finish-bracket-bb ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`)
    const cmdObj = {
      pactCode: `(brackets.finish-bracket-bb ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`,
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
          getBracketData: this.getBracketData,
          enterTournament: this.enterTournament,
          advanceBracket: this.advanceBracket,
          finishBracket: this.finishBracket,
          setUserSelectedBracket: this.setUserSelectedBracket
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;