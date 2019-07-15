import React from "react";
import AuthContext from "../contexts/AuthContext";
import Grid from '@material-ui/core/Grid';

class ViewUserInfo extends React.Component {

  render() {
    return (
      <AuthContext.Consumer>
        {({ keyset, getUserInfo, userData }) => {
          // let userName = "please log in"
          // if (userData) {
          //   userName = userData[0]
          // }
          console.log(userData);
          return (

            <div>
            <Grid container direction='column' alignItems='center'>
              <p>Your username is: {userData[0]}</p>
              <p>You are a player in the following bracket betting tournaments: </p>
              {userData[1].map((tournament) => <p>{tournament}</p>)}
              <p>You are an admin in the following bracket betting tournaments: </p>
              {userData[2].map((tournament) => <p>{tournament}</p>)}
              <p>You are a player in the following empty bracket tournaments: </p>
              {userData[3].map((tournament) => <p>{tournament}</p>)}
              <p>You are an admin in the following empty betting tournaments: </p>
              {userData[4].map((tournament) => <p>{tournament}</p>)}
            </Grid>
            </div>
          );
        }}
      </AuthContext.Consumer>
    );
  }

}

export default ViewUserInfo;
