import React from "react";
import MpsPlayer from "./components/mpsPlayer";
import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <p>
            This is a basic audio player. the goal was to make a player wich is
            consistant across all browsers for use with text heavy content. It
            has basic playback and a playback speed seting with a focus on
            accessibility compliance.
          </p>
          <MpsPlayer></MpsPlayer> 
        </header>
      </div>
    );
  }
}

export default App;
