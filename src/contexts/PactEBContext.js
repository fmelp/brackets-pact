import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class PactEBStore extends React.Component {

  state = {
    //res => [players, bracket, status, entry-fee, admin, usernames, winner]
    bracketData: [[], [], "", "", "", {}, ""],
    bracketNames: [],
    selectedBracketName: ""
  };

  setSelectedBracketName = (name) => {
    this.setState({ selectedBracketName: name })
  }

  //anyone can call this
  getBracketNames = (keyset) => {
    console.log("getting eb bracket names");
    const cmdObj = {
      pactCode: `(brackets.get-brackets-eb)`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        this.setState({ bracketNames: res.data });
      })
  }

  // (defun get-teams-players-seeds (bracket-name:string)
  //anyone can call this
  getBracketData = (keyset, bracketName) => {
    console.log('getting eb bracket data')
    const cmdObj = {
      pactCode: `(brackets.get-eb-info ${JSON.stringify(bracketName)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        let data = res.data;
        let keyUsernameMap = {};
        //make last element a map of key => username for viewing simplicity
        data[5] = data[0].reduce((o, k, i) => ({...o, [k]: data[5][i]}), {});
        data[3] = data[3]["int"];
        this.setState({ bracketData: data });
      })
  }

// (admin-key:string bracket-name:string bracket:list number-players:integer entry-fee:decimal)
  initBracket = (keyset, bracketName, bracket, numberPlayers, entryFee) => {
    //make sure it has 2 decimal places
    entryFee = Math.round(entryFee);
    console.log(`init-ing eb bracket ${bracketName} with ${numberPlayers} players`);
    console.log(`(brackets.init-empty-bracket ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(numberPlayers)} ${JSON.stringify(entryFee)})`)
    const cmdObj = {
      pactCode: `(brackets.init-empty-bracket ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(numberPlayers)} ${JSON.stringify(entryFee)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0)
    }

    Pact.fetch.send(cmdObj, API_HOST);
  }

  enterTournament = (keyset, bracketName, playerIndex) => {
    console.log('entering eb bracket');
    console.log(`(brackets.enter-tournament-eb ${JSON.stringify(bracketName)} ${JSON.stringify(playerIndex)})`)
    // console.log(`(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`)
    //(enter-bracket-w-team "test" "player-key" "gators" 0)
    const cmd = {
      //pactCode: `(brackets.enter-bracket-w-team ${JSON.stringify(bracketName)} ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(teamName)} ${JSON.stringify(teamIndex)}})`,
      //pactCode: `(bracket.i-do-not-exist)`,
      //(defun enter-bracket-w-team (bracket-name:string player-key:string team-name:string team-index:integer)
      pactCode: `(brackets.enter-tournament-eb ${JSON.stringify(bracketName)} ${JSON.stringify(playerIndex)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0),
      envData: { [keyset.publicKey] : [keyset.secretKey] }
    }
    console.log(cmd)
    Pact.fetch.send(cmd, API_HOST);
  }



  //can only be called by the bracket admin keyset
  advanceBracket = (keyset, bracketName, bracket) => {
    console.log('advancing bracket eb');
    console.log(keyset);
    const cmdObj = {
      pactCode: `(brackets.advance-bracket-eb ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0)
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  finishBracket = (keyset, bracketName, winner, bracket) => {
    console.log('finishing bracket eb');
    const cmdObj = {
      pactCode: `(brackets.finish-bracket-eb ${JSON.stringify(bracketName)} ${JSON.stringify(bracket)} ${JSON.stringify(winner)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0)
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  //have admins keyset, also need winner's....
  payWinner = (keyset, bracketName) => {
    console.log('paying winner eb');
    console.log(`(brackets.pay-winner-eb ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)})`)
    const cmd = {
      pactCode: `(brackets.pay-winner-eb ${JSON.stringify(bracketName)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0),
      envData: { [keyset.publicKey] : [keyset.secretKey] }
    }
    Pact.fetch.send(cmd, API_HOST);
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
          enterTournament: this.enterTournament,
          payWinner: this.payWinner
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
