import React from "react";
import AuthContext from "../contexts/AuthContext";
import Grid from '@material-ui/core/Grid';

class ViewUserInfo extends React.Component {

  render() {
    return (
      <AuthContext.Consumer>
        {({ keyset, getUserInfo, userData, coinAccountBalance, getCoinAccountBalance, getBalance }) => {
          // let userName = "please log in"
          // if (userData) {
          //   userName = userData[0]
          // }
          console.log(userData);
          // getCoinAccountBalance(keyset);
          console.log(coinAccountBalance)
          return (

            <div>
            <div style={{position: "absolute", top: 10, left: 10}}>
              <img src={require('../images/kadena.png')} />
            </div>
            <div style={{marginBottom: 30}}></div>
            <div className="subTitle">User Profile</div>
            <div style={{marginBottom: 30}}></div>
            <Grid container direction='column' alignItems='center'>
              <div className = "login-container">
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Username: <p style={{color:"black", fontWeight:"bold"}}>{userData[0]}</p></div>
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Balance: <p style={{color:"black", fontWeight:"bold"}}>{coinAccountBalance} Kadena coin</p></div>
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Admin in the following empty betting tournaments: </div>
                {userData[4].map((tournament) => <p>{tournament}</p>)}
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Admin in the following bracket betting tournaments: </div>
                {userData[2].map((tournament) => <p>{tournament}</p>)}
              </div>
              <div className="subTitle">Tournament History</div>
              <div style={{marginBottom: 30}}></div>
              <div className="login-container">
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Player in the following bracket betting tournaments: </div>
                {userData[1].map((tournament) => <p>{tournament}</p>)}

                <div className="status-subtitle" style={{color:"#9F76CB"}}>Player in the following empty bracket tournaments: </div>
                {userData[3].map((tournament) => <p>{tournament}</p>)}
                <div className="status-subtitle" style={{color:"#9F76CB"}}>Won the following tournaments: </div>
                {userData[6].map((tournament) => <p>{tournament}</p>)}
              </div>

            </Grid>
            </div>
          );
        }}
      </AuthContext.Consumer>
    );
  }

}

export default ViewUserInfo;
