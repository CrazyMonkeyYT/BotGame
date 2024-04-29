/*
    app.js
    Thomas M IV Williamson
    
    description:
    simple game uses react 
    The objective of the game is for the robot to reach as many target squares as possible within the 60
    second time limit.
    contole the robot with the arrow keys UP LEFT and RIGHT  

    2024-04-28
*/


import './styles.css';
import React, { useEffect, useState, KeyboardEvent } from "react";
import Countdown from 'react-countdown';
import $ from "jquery";
import bot from './bot.png';
import goal from './goal.png';
import ScoreBoard from './ScoreBoard.json';

//used to shut down movement and timer
var botdead= false;


// loads leaderboard from json file
function LoadScoreBoard(){
  const scoreBoard = useState(ScoreBoard);
  const[ output, setOutput] = useState([]);
  const [one, setOne] = useState(0);

  var nextOutput = [];
  // loads each entry onto its own line
  var i = 0;
  while(scoreBoard[0][i]){
    var lineString = (i+1) +": "+ scoreBoard[0][i][0]+' score of: '+ scoreBoard[0][i][1];
    nextOutput.push(<div key={i}>{lineString}</div>);
    i++;
  }

  //prevents recursive loading
  if(one === 0){
    // console.log('hi');
    setOutput(nextOutput);
    setOne(1);
  }
  return (<div>{output}</div>);
}

//sends score and input username to server.php
function SetScoreBoard({score}){
  const [name, setName] = useState("");
    const [result, setResult] = useState("");
 
    const handleChange = (e) => {
        setName(e.target.value);
    };
 
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = $(e.target);
        $.ajax({
            type: "POST",
            url: form.attr("action"),
            data: form.serialize(),
            success(data) {
                setResult(data);
            },
        });
    };
 
    return (
        <div>
            <form
                action="http://localhost:8000/PHP/server.php"
                method="post"
                onSubmit={(event) => handleSubmit(event)}>
                you compleated with a score of:
                <input type="number" name="score" value={score}  readOnly/> <br/> 
                Enter name for scoreboard: 
                <input type="text" name="name"/> 
                <input type="submit" value="Submit"/>
            </form>
            <h1>{result}</h1>
        </div>
    );
}

//create random number from 0 to max 
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Squares on grid
function Square({value}){
  return(
    <span className="square">
      {value}
    </span>
    );
}

// counter
function Time({score}){
  // sets start time
  const [time, setTime] = useState(60);
  useEffect(() => {
    let timer = setInterval(() => {
      setTime((time) => {
        if (time <= 0) {
          clearInterval(timer);
          return time = 0;
        } else return time - 1;
      });
    }, 1000);
  }, []);
  if (time == 0 || botdead) {
    if (time != 0){
      setTime(0);
    }
    if(!botdead){
      botdead = true;
    }
    return (<div><SetScoreBoard score={score}/><h1>GAME OVER</h1></div>
              );
  }
  else{  return (
      <span>
          Time left: {time}
      </span>
    );
}
}

// score
function Score({displayScore}){
  return(<span className={"score"}>Score:{displayScore} </span>);
}

//sets new location for the goal
function moveGoal(setGoalLocation, botLocation, squares, setSquares){
  var nextGoalLocation = [getRandomInt(5),getRandomInt(5)];
  const nextSquares = squares.slice();
  while (nextGoalLocation === botLocation){
    nextGoalLocation = [getRandomInt(5),getRandomInt(5)];
  }
  nextSquares[nextGoalLocation[0]][nextGoalLocation[1]] = <img className="goal" src={goal} alt="goal"/>
  setGoalLocation(nextGoalLocation);
  setSquares(nextSquares);
}

// main component 
export default function Board(){
  const [key, setKey] = useState("");
  const directions = ["botNorth","botEast","botSouth","botWest"]; 
  const [location, setLocation] = useState(Array(2).fill(2));// location of bot
  const [direction,setDirection] = useState(0);//direction of bot
  const [goalLocation, setGoalLocation] = useState([0,2]);//location of goal

  // board defalt
  const [squares, setSquares] = useState([[null,null,<img className="goal" src={goal} alt="goal"/>,null,null],[null,null,null,null,null],[null,null,<img className="botNorth" src={bot} alt="bot"/>,null,null],[null,null,null,null,null],[null,null,null,null,null]]);
  const [score, setScore] = useState(0);

// uppdate score
 function scoreIncrese(increse){
    var nextScore = score;
    nextScore += increse;
    setScore(nextScore);
  }


// bot movement on keypress 
  useEffect(()=> {
    const handleKeyDown = (e) =>{
      if (!botdead){
      e = e || window.event;
      const nextSquares = squares.slice();
      var nextDirection = direction;
      var nextLocation = location.slice();
      if (e.keyCode == '38') {
        // up arrow

        if (direction === 0){//north
          nextLocation[0] = nextLocation[0] -1;
        } 
        if (direction === 1){//east
          nextLocation[1] = nextLocation[1] +1;

        } 
        if (direction === 2){//south
          nextLocation[0] = nextLocation[0]+1;
        } 
        if (direction === 3){//west
          nextLocation[1] = nextLocation[1]-1;
        } 
      }

      else if (e.keyCode == '37') {
         // left arrow turns left
         nextDirection--;
         if (nextDirection < 0) {
          nextDirection = 3;
         }

      }
      else if (e.keyCode == '39') {
         // right arrow turns right
         nextDirection++;
         if (nextDirection > 3) {
          nextDirection = 0;
         }
      }
      //prevents repeat rendering 
      if (location[0] != nextLocation[0] || location[1] != nextLocation[1]){
        nextSquares[location[0]][location[1]] = null;
        setLocation(nextLocation);
      }
      //detects edge of board and kills bot if over edge
      if( nextLocation[0]> 4 || nextLocation[0] < 0 || nextLocation[1] > 4 || nextLocation[1]< 0){
        botdead=true;
      }else{
        setDirection(nextDirection);
        nextSquares[nextLocation[0]][nextLocation[1]] = <img className={directions[nextDirection]} src={bot} alt="bot"/>;

        setSquares(nextSquares);

        //checks if goal is reached
        if(nextLocation[0] == goalLocation[0] && nextLocation[1] == goalLocation[1]){

          scoreIncrese(1);
          moveGoal(setGoalLocation, nextLocation, squares, setSquares);
        }
      }
    }};
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {document.removeEventListener('keydown', handleKeyDown, true);document.removeEventListener('keydown', handleKeyDown);};


});
   
    //builds display
  return (
<>
<div className="head">
      <Score displayScore={score}/>
      <span className={"time"}id="time"><Time score={score}/></span>
<br/>
  <div className="center"> 
    </div>
    <div className="game-board">
    <div className="board-row">
      <Square value={squares[0][0]}/>
      <Square value={squares[0][1]}/>
      <Square value={squares[0][2]}/>
      <Square value={squares[0][3]}/>
      <Square value={squares[0][4]}/>
    </div> 
    <div className="board-row">
      <Square value={squares[1][0]}/>
      <Square value={squares[1][1]}/>
      <Square value={squares[1][2]}/>
      <Square value={squares[1][3]}/>
      <Square value={squares[1][4]}/>
    </div>
    <div className="board-row">
      <Square value={squares[2][0]}/>
      <Square value={squares[2][1]}/>
      <Square value={squares[2][2]}/>
      <Square value={squares[2][3]}/>
      <Square value={squares[2][4]}/>
    </div>
    <div className="board-row">
      <Square value={squares[3][0]}/>
      <Square value={squares[3][1]}/>
      <Square value={squares[3][2]}/>
      <Square value={squares[3][3]}/>
      <Square value={squares[3][4]}/>
    </div>
    <div className="board-row">
      <Square value={squares[4][0]}/>
      <Square value={squares[4][1]}/>
      <Square value={squares[4][2]}/>
      <Square value={squares[4][3]}/>
      <Square value={squares[4][4]}/>
    </div>
  </div>
  </div>
  <LoadScoreBoard/>


</>
  );
}
