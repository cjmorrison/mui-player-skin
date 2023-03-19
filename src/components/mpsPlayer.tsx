import React from "react";
import "./mpsPlayer.scss";
import Fab from "@mui/material/Fab";
import Slider from "@mui/material/Slider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SpeedIcon from "@mui/icons-material/Speed";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import PauseIcon from "@mui/icons-material/Pause";

interface PropType {
  src: string;
}
interface StateType {
  audioPlaying: boolean;
  audioPos: number;
  volume: number;
  speedMenuOpen: boolean;
  volMenuOpen: boolean;
  speedMenuAnchorEl: null | HTMLElement;
}

class MpsPlayer extends React.Component<PropType, StateType> {
  ref: any = null;
  posTimer: NodeJS.Timer | null = null;
  state = {
    audioPlaying: false,
    audioPos: 0,
    volume: 100,
    speedMenuOpen: false,
    volMenuOpen: false,
    speedMenuAnchorEl: null,
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    console.log("MpsPlayer ready");
    this.posTimer = setInterval(this.posCheck, 10);
  };

  posCheck = () => {
    if (!this.ref || !this.ref.current) {
      return;
    }
    if (this.ref.current.ended) {
      return this.setState({
        audioPos: 0,
        audioPlaying: false,
      });
    }

    if (this.ref.current.currentTime != this.state.audioPos) {
      this.setState({
        audioPos: this.ref.current.currentTime,
      });
    }
  };

  openSpeedMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({
      speedMenuOpen: true,
      speedMenuAnchorEl: event.currentTarget,
    });
  };

  closeSpeedMenu = () => {
    this.setState({
      speedMenuOpen: false,
      speedMenuAnchorEl: null,
    });
  };

  toggleVolumeDisplay = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({
      volMenuOpen: !this.state.volMenuOpen,
    });
  };

  setVolume = (event: Event, newValue: number | number[]) => {
    this.setState({
      volume: Number(newValue),
    }, () => {
      if (!this.ref || !this.ref.current) {
        return;
      } 

      this.ref.current.volume = this.state.volume / 100
    });
  };

  togglePlayAudio = () => {
    if (this.state.audioPlaying) {
      this.setState(
        {
          audioPlaying: false,
        },
        () => {
          this.ref.current.pause();
        }
      );
    } else {
      this.setState(
        {
          audioPlaying: true,
        },
        () => {
          this.ref.current.play();
        }
      );
    }
  };

  setAudioPos = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      this.setState(
        {
          audioPos: newValue,
        },
        () => {
          this.ref.current.currentTime = this.state.audioPos;
        }
      );
    }
  };

  setAudioPBS = (setTo:number) => {
    if (!this.ref || !this.ref.current) {
      return;
    } 

    this.ref.current.playbackRate  = setTo
    this.closeSpeedMenu()
  }

  render() {
    const displayPlayFab = () => {
      if (this.state.audioPlaying) {
        return (
          <Fab
            className="mps_fab"
            color="primary"
            aria-label="stop audio"
            onClick={this.togglePlayAudio}
            sx={{ mr: 1 }}
          >
            <PauseIcon></PauseIcon>
          </Fab>
        );
      }

      return (
        <Fab
          className="mps_fab"
          color="primary"
          aria-label="play audio"
          onClick={this.togglePlayAudio}
          sx={{ mr: 1 }}
        >
          <PlayArrowIcon></PlayArrowIcon>
        </Fab>
      );
    };

    const displayVolume = () => {
      if (this.state.volMenuOpen) {
        return (
          <Box id="mps_volume">
            <Stack
              spacing={2}
              direction="row"
              sx={{ mb: 1 }}
              alignItems="center"
            >
              <VolumeDownIcon />
              <Slider
                aria-label="Volume"
                value={this.state.volume}
                onChange={this.setVolume}
              />
              <VolumeUpIcon />
            </Stack>
          </Box>
        );
      } else {
        return "";
      }
    };

    return (
      <Box className="mps_container">
        {displayPlayFab()}
        <Slider
          id="mps_audioPos"
          className="mps_slider"
          aria-label="Audio posistion"
          defaultValue={0}
          value={this.state.audioPos}
          onChange={this.setAudioPos}
          //   color="secondary"
        />

        <Fab
          color="primary"
          className="mps_fab"
          aria-label="open volume"
          aria-controls={this.state.volMenuOpen ? "volume-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={this.state.volMenuOpen ? "true" : undefined}
          onClick={this.toggleVolumeDisplay}
          sx={{ mr: 1 }}
        >
          <VolumeUpIcon></VolumeUpIcon>
        </Fab>

        <Fab
          color="primary"
          className="mps_fab"
          aria-label="adjust playback speed"
          aria-controls={this.state.speedMenuOpen ? "playbackSpeed" : undefined}
          aria-haspopup="true"
          aria-expanded={this.state.speedMenuOpen ? "true" : undefined}
          onClick={this.openSpeedMenu}
          sx={{ mr: 1 }}
        >
          <SpeedIcon></SpeedIcon>
        </Fab>

        <Menu
          id="playbackSpeed-menu"
          anchorEl={this.state.speedMenuAnchorEl}
          open={this.state.speedMenuOpen}
          onClose={this.closeSpeedMenu}
          MenuListProps={{
            "aria-labelledby": "playbackSpeed-button",
          }}
      
        >
          <MenuItem onClick={()=>{this.setAudioPBS(0.25)}}>0.25</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(0.50)}}>0.50</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(0.75)}}>0.75</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(1)}}>Normal</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(1.25)}}>1.25</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(1.50)}}>1.50</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(1.75)}}>1.75</MenuItem>
          <MenuItem onClick={()=>{this.setAudioPBS(2)}}>x2</MenuItem>
        </Menu>

        {displayVolume()}
        <audio
          ref={this.ref}
          className="mps_audTag"
          src={this.props.src}
        ></audio>
      </Box>
    );
  }
}

export default MpsPlayer;