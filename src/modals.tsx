import * as React from "react"
import { animated, useSpring } from "react-spring"
import {
  Election,
  PublicPlayer,
  LegislativeSession,
  ExecutiveAction,
  EndGame,
} from "./types"
import { useDelay, useSound } from "./util"
import { VoteResult } from "./vote-result"

const clickSound = new Audio("./sound/click.mp3")

function PlayerName(props: { player: PublicPlayer; show: boolean }) {
  const style = useSpring({
    opacity: props.show ? 1 : 0,
    transform: props.show ? "translate(0px, 0px)" : "translate(0px, 5vw)",
    config: {
      mass: 1,
      tension: 340,
      friction: 22,
    },
  })
  useSound(clickSound, props.show)
  return (
    <animated.div className="player-name" style={style}>
      {props.player.name}
    </animated.div>
  )
}

export function NightRoundModal() {
  return (
    <>
      <h1>Night Round</h1>
      <p>You have now been given your secret role.</p>
    </>
  )
}

interface ElectionModalProps {
  election: Election
  players: PublicPlayer[]
  showResult: boolean
  done: () => any
}

const jaSound = new Audio("./sound/Ja hitler.mp3")
const jaSound2 = new Audio("./sound/ja ja ja ja hitler.mp3")
const neinSound = new Audio("./sound/nein1.mp3")
const neinSound2 = new Audio("./sound/neinneinnein.mp3")
const voteNowSound = new Audio("./sound/cast-vote.mp3")

function getVoteSound(result: boolean): HTMLAudioElement {
  if (Math.random() < 0.2) {
    return result ? jaSound2 : neinSound2
  } else {
    return result ? jaSound : neinSound
  }
}

export function ElectionModal(props: ElectionModalProps) {
  const { election, players, showResult } = props

  const showPresident = useDelay(true, 1000)
  const showChancellor = showPresident && election.chancellorElect != null
  const showVoting =
    useDelay(showChancellor, 1000) && election.voteResult == null

  React.useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(props.done, 4000)
      return () => clearTimeout(timeout)
    }
  }, [showResult])

  useSound(getVoteSound(election.voteResult == true), showResult)
  useSound(voteNowSound, showVoting)

  return (
    <>
      <h1>Election</h1>
      <div className="gov">
        <div>
          <img src="./img/president.png" />
          <PlayerName
            player={players[election.presidentElect]}
            show={showPresident}
          />
        </div>
        <div>
          <img src="./img/chancellor.png" />
          <PlayerName
            player={players[election.chancellorElect ?? 0]}
            show={showChancellor}
          />
        </div>
      </div>
      <div className={`vote-now${showVoting ? "" : " hidden"}`}>Vote now!</div>
      {showResult && (
        <VoteResult result={election.voteResult ? "ja" : "nein"} />
      )}
    </>
  )
}

const vetoCalledSound = new Audio("./sound/veto call.mp3")
const vetoRejectedSound = new Audio("./sound/veto rejected.mp3")
const vetoApprovedSound = new Audio("./sound/veto pass.mp3")

interface LegislativeModalProps {
  state: LegislativeSession
  players: PublicPlayer[]
  done: () => any
}

export function LegislativeModal(props: LegislativeModalProps) {
  const { state, players } = props
  let turnCopy = ""
  switch (state.turn) {
    case "President":
      turnCopy = "The president is discarding a policy."
      break
    case "Chancellor":
      turnCopy = "The chancellor is discarding a policy."
      break
    case "Veto":
      turnCopy = "The chancellor has called for a veto!"
      break
    case "VetoRejected":
      turnCopy =
        "The president has rejected the veto. The chancellor must discard a policy."
      break
    case "VetoApproved":
      turnCopy = "The agenda has been vetoed!"
      break
  }

  useSound(vetoCalledSound, state.turn == "Veto")
  useSound(vetoRejectedSound, state.turn == "VetoRejected")
  useSound(vetoApprovedSound, state.turn == "VetoApproved")

  React.useEffect(() => {
    if (state.turn == "VetoApproved") {
      const timeout = setTimeout(props.done, 3500)
      return () => clearTimeout(timeout)
    }
  }, [state.turn == "VetoApproved"])

  return (
    <>
      <h1>Legislative Session</h1>
      <div className="gov">
        <div>
          <img src="./img/president.png" />
          <PlayerName player={players[state.president]} show={true} />
        </div>
        <div>
          <img src="./img/chancellor.png" />
          <PlayerName player={players[state.chancellor]} show={true} />
        </div>
      </div>
      <p className="turn-copy">{turnCopy}</p>
    </>
  )
}

interface ExecutiveModalProps {
  state: ExecutiveAction
  players: PublicPlayer[]
  done: () => any
}

export function ExecutiveModal(props: ExecutiveModalProps) {
  const { state, players } = props

  let copy
  switch (props.state.action) {
    case "execution":
      copy = "The president must now execute a player."
      break
    case "investigate":
      copy = "The president must now investigate a player's loyalty."
      break
    case "policyPeak":
      copy = "The president must now peek at the top three policy cards."
      break
    case "specialElection":
      copy =
        "A special election has been called. The president must now nominate their successor."
      break
  }

  React.useEffect(() => {
    if (
      state.playerChosen != null &&
      ["specialElection", "execution"].indexOf(props.state.action) != -1
    ) {
      const timeout = setTimeout(props.done, 5000)
      return () => clearTimeout(timeout)
    }
  }, [state.playerChosen])

  return (
    <>
      <h1>Executive Action</h1>
      <p>{copy}</p>
      <div style={{ textAlign: "center" }}>
        <PlayerName
          player={players[state.playerChosen ?? 0]}
          show={state.playerChosen != null}
        />
      </div>
    </>
  )
}

const fascistVictory = new Audio("./sound/fascist victory.mp3")
fascistVictory.volume = 0.8
const liberalVictory = new Audio("./sound/liberal victory.mp3")
const fascistsWin = new Audio("./sound/the fascists win.mp3")
const liberalsWin = new Audio("./sound/liberal win.mp3")
const hitlerChancellor = new Audio("./sound/hitler chancellor.mp3")
const hitlerExecuted = new Audio("./sound/hitler executed.mp3")

interface GameOverModalProps {
  state: EndGame
  players: PublicPlayer[]
}

export function GameOverModal(props: GameOverModalProps) {
  const { state, players } = props

  let copy, sound1, sound2
  switch (state.winner) {
    case "Liberal":
      sound1 = liberalVictory
      switch (state.winType) {
        case "hitler":
          copy = "Hitler has been assassinated"
          sound2 = hitlerExecuted
          break
        case "legislative":
          copy = "The liberals have completed their policy track"
          sound2 = liberalsWin
          break
      }
      break
    case "Fascist":
      sound1 = fascistVictory
      switch (state.winType) {
        case "hitler":
          copy = "Hitler has been elected chancellor"
          sound2 = hitlerChancellor
          break
        case "legislative":
          copy = "The fascists have completed their policy track"
          sound2 = fascistsWin
          break
      }
      break
  }

  useSound(sound1, true)
  useSound(sound2, true)

  return (
    <>
      <h1>Game Over</h1>
      <p className="gameover1">The {state.winner}s win!</p>
      <p className="gameover2">{copy}.</p>
    </>
  )
}
