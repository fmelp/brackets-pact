import React from 'react';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

const Context = React.createContext();

export class AuthStore extends React.Component {


  //init with getting last known keys
  state = {
    keyset: {
      publicKey: localStorage.getItem('publicKey'),
      secretKey: localStorage.getItem('secretKey').replace(localStorage.getItem('publicKey'), "")
    },
    //[username, bb-games, bb-admins, eb-games, eb-admins, balace, games-won]
    userData: ["", [], [], [], [], "", []],
    allUsers: [],
    coinAccountBalance: 0
  }

  // if anything goes wrong comment above and uncomment below
  // state = {
  //   keyset: {
  //     publicKey: "8c213f005a559f63b8b6551bd1d24e0bfb21d463f902f5b5e9f393092e35c6d0",
  //     secretKey: "5098d238eafe1229acfc6398d58bba22ec7da21e9242ecd6db0e7fb86a140abe"
  //   },
  //   //[username, bb-games, bb-admins, eb-games, eb-admins]
  //   userData: ["", [], [], [], []],
  //   allUsers: []
  // }

  componentDidMount() {
    this.getUserInfo(this.state.keyset);
    this.getAllUsers(this.state.keyset);
    this.getCoinAccountBalance(this.state.keyset);
    console.log(this.state.userData);
  }

  getUserInfo = (keyset) => {
    console.log('getting user data');
    const cmdObj = {
      pactCode: `(brackets.get-user-info ${JSON.stringify(keyset.publicKey)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        // if (res.status === "failure") {
        //   alert("This keyset is not registered a user. Please use form below to register")
        // } else {
        //   this.setState({ userData: res.data });
        // }
        console.log(res.data);
        if (res.data) {
          let data = res.data.slice();
          data[5] = data[5]["int"];
          this.setState({ userData: data });
        }

      })
  }

  getAllUsers = (keyset) => {
    console.log('getting all users list')
    console.log(this.state.allUsers);
    const cmdObj = {
      pactCode:`(brackets.get-all-users)`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ allUsers: res.data });
      })
    console.log(this.state.allUsers);
  }

  setUserName = (keyset, username) => {
    console.log(`creating new user with username: ${username}`);
    const cmdObj = {
      pactCode: `(brackets.init-user ${JSON.stringify(keyset.publicKey)} ${JSON.stringify(username)})`,
      keyPairs: keyset,
      meta: Pact.lang.mkMeta(keyset.publicKey, "", 0, 0),
      //need to pass the nae of the key instead -> not the public string
      //need to refactor to pass in user's username in function call
      //then username: public_key   in envData
      envData: { [keyset.publicKey] : [keyset.secretKey] }
    }
    Pact.fetch.send(cmdObj, API_HOST);
  }

  getCoinAccountBalance = (keyset) => {
    console.log('checking if user has a coin account')
    const cmdObj = {
      pactCode: `(coin.account-balance ${JSON.stringify(keyset.publicKey)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ coinAccountBalance: res.data });
      })
  }

  getBalance = (keyset) => {
    let balance = 0;
    console.log('checking if user has a coin account')
    const cmdObj = {
      pactCode: `(coin.account-balance ${JSON.stringify(keyset.publicKey)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        console.log(res.data);
        this.setState({ coinAccountBalance: res.data });
      })
    return balance;
  }

  //can call this function from any component wrapped by this context
  //it will be very useful when actual users need to input their keyset
  onKeysetChange = (publicKey, secretKey) => {
    let trucatedSK = secretKey.toString().replace(publicKey, "")
    this.setState({
      keyset: {
        publicKey,
        secretKey: trucatedSK
      }
    }, this.setState({
      keyset: {
        publicKey,
        secretKey: trucatedSK
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
          getUserInfo: this.getUserInfo,
          getAllUsers: this.getAllUsers,
          getCoinAccountBalance: this.getCoinAccountBalance,
          getBalance: this.getBalance
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
