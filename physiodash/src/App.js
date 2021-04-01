import React,  { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';

import Webcam from "react-webcam";
import StickyFooter from "./components/StickyFooter"
import DashboardPage from "./components/DashboardPage"
import {BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';

import {
  Paper,
  Button,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

//Camera code: https://codepen.io/mozmorris/pen/yLYKzyp?editors=0010
//something
const WebcamComponent = () => <Webcam />;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
      width: theme.spacing(16),
      height: theme.spacing(16),
      padding: "10px",
    },
  table: {
    minWidth: 650,
    padding: "10px",
  },
  },
}));


function App() {
  const waitTime = 5
  const classes = useStyles();
  const [currentPath, setPath] = useState("/physiodash")
  const [sessionRunning, setSessionRunning] = useState(false)
  const [counter, setCounter] = useState(waitTime)

  const [placeholder, setPlaceholder] = useState("0")

  //Webcam stuff:
  const webcamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);

  const [recordState, setRecordState] = useState('/stop_record')

  const [wallRepCount, setWallRepCount] = useState(0)
  const [lungeCount, setLungeCount] = useState(0)
  const [squatCount, setSquatCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const countDown = () =>{
    let waitMultiplier = 1
    for(let i =waitTime; i>0 ;i--){
      setTimeout(()=>{
        setCounter(i)
      }, 1000*waitMultiplier)
      waitMultiplier+=1
    }
    setTimeout(()=>{
      setCounter(waitTime)
    }, 1000*(waitTime+1))
  }

  const handleStartCaptureClick = React.useCallback(() => {
    countDown();
    setTimeout(()=>{
      // setRecordState('/set_record')
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }, 1000*(waitTime+1))
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    // setRecordState('/stop_record')
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = React.useCallback(async() => {
    if (recordedChunks.length) {
      // console.log(recordedChunks)
      // recordedChunks.forEach((chunk) =>{
      //   if(recordedChunks.indexOf(chunk)%10 ===0){
      //     reducedChunks.push(chunk)
      //     console.log(chunk)
      //   }
      // }) (reduce fps later...can be done thru flask end)

      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      let formData = new FormData()
      formData.append("video", blob)
      fetch('physiodash/upload/', {method:"POST", body:formData}).then((result)=>{
        fetch('physiodash/results/', {method:"GET"}).then((response) => response.json()) //2
        .then((reps) => {
          // console.log(reps.wallPushups); //3
          // return reps.wallPushups
          let wallPushupsCount = reps.wallPushups
          let lungeCount = reps.lunges
          let squatCount = reps.squats
          setWallRepCount(wallPushupsCount)
          setLungeCount(lungeCount)
          setSquatCount(squatCount)
          setIsLoading(false)
          // console.log(wallPushupsCount)
  
        });
      })
      .catch(error =>{
        console.log(error)
      })
      
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // document.body.appendChild(a);
      // a.style = "display: none";
      // a.href = url;
      // a.download = "physiodash_webcam_video.webm";
      // a.click();
      // window.URL.revokeObjectURL(url);
      // console.log(recordedChunks)
      
     

      // const getResults = async () =>{
      //   const res = await results;
      //   return res
      // }
      // getResults()
      // console.log(wallPushupsCount)
      // // const wallPushupsCount = getResults()
      // setWallRepCount(wallPushupsCount)
      // console.log(wallPushupsCount)

      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  useEffect(()=>{
    if(recordState ==='/set_record'){
      fetch('/set_record').then(res => res.json()).then(data=>{
          setPlaceholder(data.framesNum)
      })
    }else if(recordState ==='/stop_record'){
      fetch('/stop_record').then(res => res.json()).then(data=>{
          setPlaceholder("0")
      })
    }
  },[placeholder, recordState])



  const handleReroute = (newRoute) =>{
    setPath(newRoute)
    handleDownload()
 

  }

  const handleSessionState = () =>{
    if(!sessionRunning === true){
      // fetch('/stream').then(res => res.json()).then(data=>{
      //   setPlaceholder(data.result)
      // })
      handleStartCaptureClick()
      setIsLoading(true)
    }else{
      // fetch('/stream').then(res => res.json()).then(data=>{
      //   setPlaceholder(data.result)
      // })
      handleStopCaptureClick()
    }
    setSessionRunning(!sessionRunning)
  }

  const getVideo = () =>{
    fetch('/').then(res => res.json()).then(data=>{
      return data
    })
  }
  const element = <h1>Hello, world</h1>;
  return (
    <div id='app-root'>
      <Router>
        <Redirect to={currentPath} />
        <Switch>
          <Route exact path = "/physiodash">
            <StickyFooter>
              {/* <h1>Frame Count: {placeholder}</h1> */}
              {(counter !== waitTime) &&
               <Paper style={{margin:"auto", textAlign:"center", width:640}}>
                  <h2>{`Session starts in: ${counter}`}</h2>
               </Paper>
              }

              {/* <Button onClick={()=>{setPath('/physiodash/summary/')}}>redirect to summary</Button> */}

              <Webcam audio={false} ref={webcamRef}/>
                
                {sessionRunning
                  ? <Button style={{padding:"5px"}} onClick={handleSessionState} variant="contained" color="primary" size="large">End Session</Button>
                  : <Button style={{padding:"5px"}} onClick={handleSessionState} variant="contained" color="primary" size="large">Begin Session</Button>
                }
              {recordedChunks.length > 0 && (
                <div>
                  <Button style={{padding:"5px"}}onClick={()=>handleReroute("/summary")} variant="contained" color="secondary" size="large">View Summary</Button> 
                </div>
              )}
            </StickyFooter>
          </Route>

          <Route exact path ="/summary">
            <DashboardPage>
              {(isLoading === false)
              
              ?<TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableCell>Exercise</TableCell>
                    <TableCell align="center">Reps</TableCell>

                  </TableHead>
                  <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Wall Pushups
                        </TableCell>
                        <TableCell align="center">{wallRepCount}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Squats
                        </TableCell>
                        <TableCell align="center">{squatCount}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Lunges
                        </TableCell>
                        <TableCell align="center">{lungeCount}</TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              : <h1>Workout Summary Loading</h1>
              }
              <Button style={{padding:"5px"}} onClick={()=>handleReroute("/physiodash")} variant="contained" color="primary" size="large">New Session</Button> 
              {/* <Button style={{padding:"5px"}} onClick={handleDownload} variant="contained" color="secondary" size="large">Get Workout Summary</Button>  */}
              {/* <Button onClick={()=>{window.location.href('physiodash/summary')}}>See my results</Button> */}
            </DashboardPage>
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App
