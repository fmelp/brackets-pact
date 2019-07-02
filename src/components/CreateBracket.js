import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class CreateBracket extends React.Component {

  state = {
    numTeams: 0,
    teamList: [],
    buttonDisabled: true,
    bracketName: ""
  };

  onChangeTeamValue = (index, value) => {
    let teamList = this.state.teamList;
    teamList[index] = value;
    this.setState({ teamList }, this.checkInputValidity());
  }


  renderTextInputs = (numInputs) => {
    let textComponents = [];
    for (let i = 0; i < numInputs; i++) {
      textComponents.push(
        <div key={i}>
          <TextField
            key={i}
            placeholder="team"
            id="standard-name"
            label={`Team Seed ${i+1}`}
            onChange={(e) => this.onChangeTeamValue(i, e.target.value)}
            margin="normal"
          />
        </div>
      )
    }
    return textComponents;
  }

  checkInputValidity = () => {
    this.setState({ buttonDisabled: true })
    let teams = this.state.teamList;
    let teamsSet = new Set(teams);
      //has no duplicates and is right length
      if ((teams.length === teamsSet.size) && (teams.length === this.state.numTeams))  {
          this.setState({ buttonDisabled: false })
    }

  }



  render() {
    return (
      <div>
        <Grid container direction='column'>
        <text>Please make sure: </text>
        <text>1. Team names are distinct and in order of their seed</text>
        <text>2. Bracket name is not already taken</text>
        <div style={{ marginBottom: 10 }}>
          <TextField
            id="standard-name"
            label={"Bracket Name"}
            onChange={(e) => this.setState({ bracketName: e.target.value})}
            margin="normal"
          />
        </div>
        <Select
          style={{ marginBottom: 10 }}
          native
          value={this.state.numTeams}
          onChange={(e) => {
            this.renderTextInputs(this.state.numTeams)
            this.setState({
              numTeams: parseInt(e.target.value),
              teamList: Array(e.target.value).fill("")
            })}
          }
        >
          <option value={0}>PLEASE SELECT NUMBER OF TEAMS</option>
          <option value={2}>Two</option>
          <option value={4}>Four</option>
          <option value={8}>Eight</option>
          <option value={16}>Sixteen</option>
          <option value={32}>Thirty-Two</option>
        </Select>
          {this.renderTextInputs(this.state.numTeams)}
          <Button variant="contained"
            disabled={this.state.buttonDisabled}
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => console.log('clicked')}>
            Create Bracket!
          </Button>
        </Grid>
      </div>
    );
  }
}

export default CreateBracket;
