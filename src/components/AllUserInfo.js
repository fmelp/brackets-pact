import React from "react";
import AuthContext from "../contexts/AuthContext";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Pact from "pact-lang-api";

const API_HOST = "http://localhost:9001";

class AllUserInfo extends React.Component {

  state = {
    usersData: [],
    balances: [],
    userNames: []
  }

  getInfo = async (keyset) => {
    // console.log(this.state.usersData);
    // this.state.allUsers.map((val, i) => {
    //
    // })
    this.state.usersData.map((val, i) => {
      this.getUserInfo(keyset, val);
      this.getBalance(keyset, val);
    })

    console.log(this.state);
  }

  getAllUsers = (keyset) => {
    let data = []
    console.log('getting all users list')
    // console.log(this.state.allUsers);
    const cmdObj = {
      pactCode:`(brackets.get-all-users)`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        // console.log(res.data);
        this.setState({ usersData: res.data }, () => this.getInfo(keyset));
      })
  }

  getUserInfo = (keyset, userPub) => {
    console.log('getting user data');
    const cmdObj = {
      pactCode: `(brackets.get-user-info ${JSON.stringify(userPub)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        // if (res.status === "failure") {
        //   alert("This keyset is not registered a user. Please use form below to register")
        // } else {
        //   this.setState({ userData: res.data });
        // }
        // console.log(res.data);
        if (res.data) {
          let data = res.data.slice();
          data[5] = data[5]["int"];
          console.log(data[0]);
          // return data[0]
          this.setState({ userNames: [...this.state.userNames, data[0]] }, () => console.log(this.state))
        }

      })
  }

  getBalance = (keyset, userPub) => {
    let balance = 0;
    console.log('checking if user has a coin account')
    const cmdObj = {
      pactCode: `(coin.account-balance ${JSON.stringify(userPub)})`,
      keyPairs: keyset
    }
    Pact.fetch.local(cmdObj, API_HOST)
      .then(res => {
        // console.log(res.data);
        this.setState({ balances: [...this.state.balances, res.data] }, () => console.log(this.state));
      })
  }

  render() {
    return (
      <AuthContext.Consumer>
        {({ keyset }) => {
          // this.getInfo(keyset);
          return (
            <div>
            <div style={{position: "absolute", top: 10, left: 10}}>
              <img src={require('../images/kadena.png')} />
            </div>
            <div style={{marginBottom: 30}}></div>
            <div className="subTitle">All Users</div>
            <Button variant="contained"
              className="custom-button"
              color="primary"
              //if is admin or is in tournament dont show the button
              // disabled={this.disabledButton(keyset, bracketData)}
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => {
                this.getAllUsers(keyset);
              }}
            >
              Update List
            </Button>
            <div style={{marginBottom: 30}}></div>
            <div className = "login-container">

                  <Grid container direction='column' alignItems='center'>


                      <table style={{ border: '1px solid'}}>
                      <tr style={{color:"#9F76CB"}}><th style={{ border: '1px solid'}}>username</th><th style={{ border: '1px solid'}}>balance</th></tr>
                      {this.state.userNames.map((val, i) => {
                        return (
                          <tr style={{color:"#9F76CB"}}><td style={{ border: '1px solid'}}>{val}</td><td style={{ border: '1px solid'}}>{this.state.balances[i]}</td></tr>
                        )
                      })}
                      </table>

                </Grid>

              </div>
            </div>
          );
        }}
      </AuthContext.Consumer>
    );
  }

}

export default AllUserInfo;
