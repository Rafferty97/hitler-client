import * as React from "react"
import { render } from "react-dom"
import { PlayerApp } from "./playerapp"
import { BoardApp } from "./boardapp"
import { getQueryVariable } from "./util"

export function App() {
  const [state, setState] = React.useState(
    (() => {
      const state = getQueryVariable("m")
      if (state == "p") return "player"
      if (state == "b") return "board"
      return ""
    })()
  )

  if (state == "player") {
    return <PlayerApp />
  }

  if (state == "board") {
    return <BoardApp />
  }

  const setMode = (mode) => {
    setState(mode)
    window.history.pushState("", "", "?m=" + mode.substr(0, 1))
  }

  return (
    <>
      <h1 className="game-title">SecretHitler.live</h1>
      <div className="game-buttons">
        <button onClick={() => setMode("board")}>Board Screen</button>
        <button onClick={() => setMode("player")}>Player</button>
      </div>
      <div className="about">
        <h2>What is this?</h2>
        <p>
          This is an online version of the popular board game "Secret Hitler",
          in which the game board is shown on a laptop/TV screen (or screens)
          and each player interacts with the game using their own device such as
          a smart phone or tablet.
        </p>
        <h2>Quick start</h2>
        <ul>
          <li>
            On a shared screen such as a TV or laptop, click "BOARD SCREEN",
            then "CREATE NEW GAME"
          </li>
          <li>
            Each player, on their own device, clicks "PLAYER" then enters the
            room code and their name. Alternatively they can scan the QR code on
            the board screen.
          </li>
          <li>Once all players have joined, simply click "START GAME".</li>
        </ul>
        <h2>Game Rules</h2>
        <p>
          The game has the exact same rules as the original board game which can
          be found at its{" "}
          <a href="https://secrethitler.com" target="_blank">
            official website
          </a>
          .
        </p>
        <p>
          Players are prompted to perform certain actions on their devices and
          all game logic is performed on the server, so gameplay should be
          straightforward and easy.
        </p>
        <h2>Important notes</h2>
        <ul>
          <li>
            After each card is revealed, whether Liberal or Fascist, the game
            will wait until all players have clicked the "NEXT" button. This is
            to allow players to interrogate each other following a legislative
            session.
          </li>
          <li>
            When the president and chancellor are selecting policy cards, the UI
            requires the player to select the card they wish to discard. This is
            important to remember when playing as the chancellor, who only has
            two cards. The UI gives the player the chance to confirm their
            selection before comitting.
          </li>
          <li>
            Be sure to pay attention to the players list on the right. It
            reveals who voted "JA!" and "NEIN!" in elections, as well as which
            players have been confirmed not to be Hitler after elections and
            executions.
          </li>
        </ul>
      </div>
      <div className="licence">
        <p>
          Secret Hitler is designed by Max Temkin, Mike Boxleiter, Tommy
          Maranges and illustrated by Mackenzie Schubert.
        </p>
        <p>
          This game is attributed as per the{" "}
          <a
            target="_blank"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          >
            Creative Commons Attribution-NonCommercial-ShareAlike 4.0
            International license
          </a>
          .
        </p>
        <p>
          The original game can be found at{" "}
          <a target="_blank" href="https://www.secrethitler.com/">
            secrethitler.com
          </a>
          .
        </p>
      </div>
    </>
  )
}

render(<App />, document.querySelector("#app"))
