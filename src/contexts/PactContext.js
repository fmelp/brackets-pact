import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class PactStore extends React.Component {

  state = {
    brackets: "hahah",
    bracketNames: "aaa"
  };

  getBracketNames = (keyset) => {
    console.log("getting bracket names");
    const cmdObj = {
      pactCode: `(brackets.get-bracket-names)`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res)
      })
  }

  //Pact Contract
  //(admin-key:string bracket-name:string bracket-type:string bracket:list team-list:list seed-list:list)
  initBracket = (keyset, bracketName, bracketType, bracket, teamList) => {
    console.log(`init-ing bracket ${bracketName}`);
    // console.log(`(brackets.init-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracketType)} ${JSON.stringify(bracket)} ${JSON.stringify(teamList)} ${JSON.stringify(seedList)})`)
    const cmdObj = {
      pactCode: `(brackets.init-bracket ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(bracketName)} ${JSON.stringify(bracketType)} ${JSON.stringify(bracket)} ${JSON.stringify(teamList)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  render() {
    return(
      <Context.Provider
        value={{
          ...this.state,
          initBracket: this.initBracket,
          getBracketNames: this.getBracketNames
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
