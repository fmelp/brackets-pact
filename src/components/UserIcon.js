import React from "react";
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AuthContext from "../contexts/AuthContext";

class UserIcon extends React.Component {
  render() {
    return (
      <div style={{position: "absolute", top: 10, right: 10}}>
      <AuthContext.Consumer>
        {({ keyset, getUserInfo, userData }) => {
          let userName = "please log in"
          if (userData[0]) {
            userName = userData[0]
          }
          return (
            <Chip
              avatar={<Avatar>UN</Avatar>}
              label={userName}
              clickable
              color="primary"
            />
          );
        }}
      </AuthContext.Consumer>
      </div>
    );
  }
}

export default UserIcon;
