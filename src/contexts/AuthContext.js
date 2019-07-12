import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class AuthStore extends React.Component {


  //init with getting last known keys
  state = {
    keyset: {
      publicKey: localStorage.getItem('publicKey'),
      secretKey: localStorage.getItem('secretKey')
    },
    //[username, bb-games, bb-admins, eb-games, eb-admins]
    userData: ["", [], [], [], []]
  }

  componentDidMount() {
    this.getUserInfo(this.state.keyset);
  }

  getUserInfo = (keyset) => {
    console.log('getting user data');
    const cmdObj = {
      pactCode: `(brackets.get-user-info ${JSON.stringify(keyset.publicKey)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ userData: res.data });
      })
  }

  setUserName = (keyset, username) => {
    console.log(`creating new user with username: ${username}`);
    const cmdObj = {
      pactCode: `(brackets.init-user ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(username)})`,
      keyPairs: keyset
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  //can call this function from any component wrapped by this context
  //it will be very useful when actual users need to input their keyset
  onKeysetChange = (publicKey, secretKey) => {
    this.setState({
      keyset: {
        publicKey,
        secretKey
      }
    }, this.setState({
      keyset: {
        publicKey,
        secretKey
      }
    }, console.log(this.state.keyset)));
    //sets these as last know keys for when we refresh the app
    localStorage.setItem('publicKey', publicKey);
    localStorage.setItem('secretKey', secretKey);
  }

  render() {
    console.log('current keyset:', this.state.keyset);
    return(
      <Context.Provider
        value={{
          ...this.state,
          onKeysetChange: this.onKeysetChange,
          setUserName: this.setUserName,
          getUserInfo: this.getUserInfo
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
