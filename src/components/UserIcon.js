import React from "react";
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AuthContext from "../contexts/AuthContext";
import { AccountCircle } from '@material-ui/icons';

class UserIcon extends React.Component {
  render() {
    return (
      <div style={{position: "absolute", top: 10, right: 10}}>
      <AuthContext.Consumer>
        {({ keyset, getUserInfo, userData }) => {
          let userName = "please log in"
          if (userData) {
            userName = userData[0]
          }
          return (
            <Chip
              avatar={<AccountCircle />}
              label={userName}
              clickable
              color="default"
              onClick={() => {
                if (userData) {
                  this.props.history.push('/userinfo');
                  window.location.reload();
                } else {
                  this.props.history.push('/login');
                  window.location.reload();
                }

              }}
            />
          );
        }}
      </AuthContext.Consumer>
      </div>
    );
  }
}

export default UserIcon;
