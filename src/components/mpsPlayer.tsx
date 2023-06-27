import React from "react";
import "./mpsPlayer.scss";
import Fab from "@mui/material/Fab";
import Slider from "@mui/material/Slider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SpeedIcon from "@mui/icons-material/Speed";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import PauseIcon from "@mui/icons-material/Pause";
import LyricsIcon from "@mui/icons-material/Lyrics";

interface PropType {
  src?: string;
  useDrawer?: boolean;
}
interface StateType {
  audioPlaying: boolean;
  audioPos: number;
  volume: number;
  drawerStatus: boolean;
  speedMenuOpen: boolean;
  volMenuOpen: boolean;
  speedMenuAnchorEl: null | HTMLElement;
  langData: object;
}

class MpsPlayer extends React.Component<PropType, StateType> {
  ref: any = null;
  posTimer: NodeJS.Timer | null = null;
  usingAudioSrc: string = "";

  supportedLangs: Array<string> = ["en", "fr-ca"];
  defaultLang: string = "en";
  langSelection: string = this.defaultLang;

  state = {
    audioPlaying: false,
    audioPos: 0,
    volume: 100,
    drawerStatus: false,
    speedMenuOpen: false,
    volMenuOpen: false,
    speedMenuAnchorEl: null,
    langData: {},
  };

  theme = createTheme({
    palette: {
      primary: {
        main: "#1b5e20",
        contrastText: "#fff",
      },
      secondary: {
        main: "#2979ff",
        contrastText: "#000",
      },
    },
  });

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    this.getLangData();
    console.log("MpsPlayer ready");
    this.posTimer = setInterval(this.posCheck, 10);

    if ((window as any).mps_srcOverride) {
      this.usingAudioSrc = (window as any).mps_srcOverride as string;
    }
    if ((window as any).parent && (window as any).parent.mps_srcOverride) {
      this.usingAudioSrc = (window as any).parent.mps_srcOverride as string;
    } else if (this.props.src) {
      this.usingAudioSrc = this.props.src;
    } else {
      this.usingAudioSrc = "./sampleAudio.mp3";
    }

    if (this.props.useDrawer) {
      this.setState({
        volMenuOpen: true,
      });
    }
  };

  getLangData = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).mps_langOverride) {
        if (
          this.supportedLangs.indexOf((window as any).mps_langOverride) === -1
        ) {
          this.langSelection = (window as any).mps_srcOverride as string;
        } else {
          console.warn(
            `provided lang overide ${
              (window as any).mps_srcOverride
            } is not availible`
          );
        }
      }

      fetch(`./lang/${this.langSelection}.json`)
        .then((response) => response.json())
        .then((publicLangData: object) => {
          this.setState({ langData: publicLangData }, () => {
            resolve(this.state.langData);
          });
        });
    });
  };

  langKey = (key: string) => {
    return this.state.langData[key] as string;
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

    if (this.ref.current.currentTime !== this.state.audioPos) {
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
    this.setState(
      {
        volume: Number(newValue),
      },
      () => {
        if (!this.ref || !this.ref.current) {
          return;
        }

        this.ref.current.volume = this.state.volume / 100;
      }
    );
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
          audioPos: (newValue / 100) * this.ref.current.duration,
        },
        () => {
          this.ref.current.currentTime = this.state.audioPos;
        }
      );
    }
  };

  setAudioPBS = (setTo: number) => {
    if (!this.ref || !this.ref.current) {
      return;
    }

    this.ref.current.playbackRate = setTo;
    this.closeSpeedMenu();
  };

  toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      this.setState({ drawerStatus: open });
    };

  render() {
    let audioPos = 0;

    if (this.ref && this.ref.current) {
      audioPos = (this.state.audioPos / this.ref.current.duration) * 100;
    }

    let audSliderClass = "mps_slider";
    if (this.props.useDrawer) {
      audSliderClass = "mps_slider useDrawer";
    }

    const buildContainer = () => {
      return (
        <Box className="mps_container">
          {displayPlayFab()}
          <Slider
            id="mps_audioPos"
            className={audSliderClass}
            aria-label={this.langKey("audioPosistion")}
            defaultValue={0}
            value={audioPos}
            onChange={this.setAudioPos}
            //   color="secondary"
          />

          {displayVolumeToggle()}

          <Tooltip title={this.langKey("playbackSpeed")} placement="bottom">
            <Fab
              color="primary"
              className="mps_fab"
              aria-label={this.langKey("playbackSpeed")}
              aria-controls={
                this.state.speedMenuOpen ? "playbackSpeed" : undefined
              }
              aria-haspopup="true"
              aria-expanded={this.state.speedMenuOpen ? "true" : undefined}
              onClick={this.openSpeedMenu}
              sx={{ mr: 1 }}
            >
              <SpeedIcon></SpeedIcon>
            </Fab>
          </Tooltip>

          <Menu
            id="playbackSpeed-menu"
            anchorEl={this.state.speedMenuAnchorEl}
            open={this.state.speedMenuOpen}
            onClose={this.closeSpeedMenu}
            MenuListProps={{
              "aria-labelledby": "playbackSpeed-button",
            }}
          >
            <MenuItem
              onClick={() => {
                this.setAudioPBS(0.25);
              }}
            >
              0.25
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(0.5);
              }}
            >
              0.50
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(0.75);
              }}
            >
              0.75
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(1);
              }}
            >
              Normal
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(1.25);
              }}
            >
              1.25
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(1.5);
              }}
            >
              1.50
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(1.75);
              }}
            >
              1.75
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.setAudioPBS(2);
              }}
            >
              x2
            </MenuItem>
          </Menu>

          {displayVolume()}
        </Box>
      );
    };

    const displayPlayFab = () => {
      if (this.state.audioPlaying) {
        return (
          <Tooltip title={this.langKey("pause")} placement="bottom">
            <Fab
              className="mps_fab"
              color="primary"
              aria-label={this.langKey("pause")}
              onClick={this.togglePlayAudio}
              sx={{ mr: 1 }}
            >
              <PauseIcon></PauseIcon>
            </Fab>
          </Tooltip>
        );
      }

      return (
        <Tooltip title={this.langKey("play")} placement="bottom">
          <Fab
            className="mps_fab"
            color="primary"
            aria-label={this.langKey("play")}
            onClick={this.togglePlayAudio}
            sx={{ mr: 1 }}
          >
            <PlayArrowIcon></PlayArrowIcon>
          </Fab>
        </Tooltip>
      );
    };

    const displayVolumeToggle = () => {
      if (!this.props.useDrawer) {
        return (
          <Tooltip title={this.langKey("volumeSettings")} placement="bottom">
            <Fab
              color="primary"
              className="mps_fab"
              aria-label={this.langKey("volumeSettings")}
              aria-controls={this.state.volMenuOpen ? "volume-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={this.state.volMenuOpen ? "true" : undefined}
              onClick={this.toggleVolumeDisplay}
              sx={{ mr: 1 }}
            >
              <VolumeUpIcon></VolumeUpIcon>
            </Fab>
          </Tooltip>
        );
      } else {
        return "";
      }
    };

    const displayVolume = () => {
      let volSliderClass = "";
      if (this.props.useDrawer) {
        volSliderClass = "useDrawer";
      }

      if (this.state.volMenuOpen) {
        return (
          <Box id="mps_volume" className={volSliderClass}>
            <Stack
              spacing={2}
              direction="row"
              sx={{ mb: 1 }}
              alignItems="center"
            >
              <VolumeDownIcon color="primary" />
              <Slider
                aria-label={this.langKey("volume")}
                value={this.state.volume}
                onChange={this.setVolume}
              />
              <VolumeUpIcon color="primary" />
            </Stack>
          </Box>
        );
      } else {
        return "";
      }
    };

    const buildAudioTag = () => {
      return (
        <audio
          ref={this.ref}
          className="mps_audTag"
          src={this.usingAudioSrc}
        ></audio>
      );
    };

    if (!this.props.useDrawer) {
      return (
        <div>
          {buildContainer()}
          {buildAudioTag()}
        </div>
      );
    } else {
      return (
        <Box>
          <ThemeProvider theme={this.theme}>
            <Tooltip
              title={this.langKey("audioSettings")}
              placement="bottom-end"
            >
              <Fab
                className="mps_fab"
                size="medium"
                color="primary"
                aria-label={this.langKey("audioSettings")}
                onClick={this.toggleDrawer(true)}
                sx={{ mr: 1 }}
              >
                <LyricsIcon></LyricsIcon>
              </Fab>
            </Tooltip>
            <Drawer
              anchor="top"
              open={this.state.drawerStatus}
              onClose={this.toggleDrawer(false)}
            >
              {buildContainer()}
            </Drawer>
            {buildAudioTag()}
          </ThemeProvider>
        </Box>
      );
    }
  }
}

export default MpsPlayer;
