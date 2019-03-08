import React, { Component } from "react";
import ReactDOM from "react-dom";
import './index.css';

import { postToDB, getDB } from './DBhandler.js';
import { num2string, string2num, themes, darktheme, parseToQuery, parseFromQuery } from './Helpers.js';

import copy from 'copy-to-clipboard';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import LinkIcon from '@material-ui/icons/Link';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';

import green from '@material-ui/core/colors/green';
import orange from '@material-ui/core/colors/orange';
import blue from '@material-ui/core/colors/blue';
import indigo from '@material-ui/core/colors/indigo';
import deepPurple from '@material-ui/core/colors/deepPurple';
import lightBlue from '@material-ui/core/colors/lightBlue';

import { Flowspace, Flowpoint } from '../../src';

var myImg = require('../../assets/favicon.ico');
var myImg = require('../../assets/this_is_flowpoints.png');
var myImg = require('../../assets/filled.png');
var myImg = require('../../assets/outlined.png');
var myImg = require('../../assets/paper.png');
var myImg = require('../../assets/sample_1.png');
var myImg = require('../../assets/sample_2.png');
var myImg = require('../../assets/sample_3.png');

var htmlToImage = require('html-to-image');


// Main example
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showSettings: true,
      showInfobox: false,
      selected: null,
      connecting: null,
      inputColor: '#00fff2',
      outputColor: '#0c00ff',
      lineWidth: 4,
      points: {},
      theme: 'indigo',
      variant: 'outlined',
      background: 'black',
      lastPos: {x:300, y:50},
      snackShow: false,
      snackMsg: '',
      snackColor: blue[500],
      doFocus: false
    }

    // Helper variables
    this.diagramRef = null;
    this.baseUrl = window.location.href.split('/?p=')[0]
    if (this.baseUrl[this.baseUrl.length - 1] !== '/') this.baseUrl += '/'
    this.count = Object.keys(this.state.points).length
    this.currentQuery = ''

    // Binding class methods
    this.handleClick = this.handleClick.bind(this)
    this.handleTouch = this.handleTouch.bind(this)
    this.settingsBox = this.settingsBox.bind(this)
    this.infoBox = this.infoBox.bind(this)
    this.handleAddPoint = this.handleAddPoint.bind(this)

    // Adding lineClick
    Object.keys(this.state.points).map(key => {
      Object.keys(this.state.points[key].outputs).map(out_key => {
        this.state.points[key].outputs[out_key].onClick = this.handleClickLine
      })
    })
  }


  componentDidMount() {
    const opts = [
      'red',
      'pink',,
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'green',
      'light-green',
      'lime',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
    ]
    this.setState({
      theme:opts[Math.round(Math.random() * opts.length)],
      variant:(Math.random() < 0.5 ? 'outlined' : 'filled')
    })
    var query = window.location.href.split(this.baseUrl)[1].substring(3)
    if (query) {
      try {
        query = query.slice(0, 15)
        getDB(data => {
          if (query in data) {
            var newLib = parseFromQuery(data[query])
            this.count = newLib.count
            this.setState({
              theme: (newLib.theme === null ? opts[Math.round(Math.random() * opts.length)] : newLib.theme),
              variant: newLib.variant,
              lineWidth: newLib.lineWidth,
              points: newLib.points,
              snackShow: true,
              snackMsg: 'Loaded model from URL',
              snackcolor: green['A700']
            })
          } else {
            this.setState({
              snackShow: true,
              snackMsg: 'Failed to load model from URL',
              snackcolor: orange['A400']
            })
          }
        })
      } catch(err) {
        console.log('Failed to rebuild from query', err)
        this.setState({
          snackShow: true,
          snackMsg: 'Failed to load model from URL',
          snackcolor: orange['A400']
        })
      }
    }
  }


  handleAddPoint() {
    var newpoint = {
      msg: '',
      pos: {x:this.state.lastPos.x, y:this.state.lastPos.y + 100},
      outputs: {},
    }
    var points = this.state.points
    points['' + this.count] = newpoint
    this.count += 1
    this.setState({points, selected:''+(this.count - 1), lastPos:{x:this.state.lastPos.x, y:this.state.lastPos.y + 100}})
  }


  handleClick(id, e) {
    this.doFocus = true;
    var selected = this.state.selected
    var points = this.state.points
    if (e.shiftKey) {
      if (selected === null) {
        selected = id
      } else {
        if (selected !== id) {
          var p1 = points[selected]
          if (id in p1.outputs) {
            delete p1.outputs[id]
          } else {
            p1.outputs[id] = {
              output:'auto',
              input:'auto',
              onClick:this.handleClickLine
            }
          }
        }
      }
    } else {
      selected = (selected === null ? id : (selected === id ? null : id))
    }
    this.setState({selected, points})
  }


  handleTouch(id, e) {
    this.doFocus = false;
    var selected = this.state.selected
    var points = this.state.points
    if (selected === null) {
      selected = id
    } else {
      if (selected !== id) {
        var p1 = points[selected]
        if (id in p1.outputs) {
          delete p1.outputs[id]
        } else {
          p1.outputs[id] = {
            output:'auto',
            input:'auto',
            onClick:this.handleClickLine
          }
        }
      }
    }
    this.setState({selected, points})
  }


  infoBox() {
    return (
      <div style={{position:'fixed', top:0, left:0, width:350, paddingLeft:10, opacity:0.8}}>

        <Card style={{marginTop:10, maxHeight:'70vh', overflow:'scroll'}}>
          <CardContent>

            <Typography gutterBottom variant="h5" component="h2" style={{opacity:1}}>
              Flowpoints!
            </Typography>

            <Typography component="p">
              A developer-friendly library for creating flowcharts and diagrams.
              <br/><br/>
              This is a demo for the React JS package found <a style={{color:'#29F9FF'}} href="https://www.npmjs.com/package/flowpoints">here</a>
              <br/><br/>
              Here's some hints to get you started!
              <br/><br/>
              <b>Creating new flowpoints:</b><br/>
              You can create new nodes with the blue plus button in the lower right corner.
              New nodes will appear just beneath whichever node was created or moved last.
              <br/><br/>
              <b>Adding connections:</b><br/>
              Start by selecting a node. It´s color should change to indicate that it´s been selected.
              Next hold shift while clicking another node to connect the two. Keep holding shift and clicking other nodes to connect to those as well.
              <br/><br/>
              <b>Removing connections:</b><br/>
              Just repeat the steps from the "adding connections" section to delete that connection between two nodes.
              <br/><br/>
              <b>Changing styles:</b><br/>
              Click the settings button in the lower right corner (this info box will disappear!).
              In the menu that shows up you'll be able to change the appearance of your flowchart. Everything in this menu should be fairly self-explanatory :)
              <br/><br/>
              <b>Sharing your work:</b><br/>
              You can share your current diagrams by clicking the link-button in the lower right corner.
              When clicking this a link will be copied to your clipboard.
              <br/><br/>
              <b>!!!</b>
              <br/>
              Please note that when you create links like this a string representation of your diagram will be stored in a <b>publicly viewable</b> Google Sheet.
              As this demo is hosted using GitHub pages I don´t have an actual server to store user data on.
            </Typography>

          </CardContent>
        </Card>
      </div>
    )
  }


  settingsBox() {
    return (
      <div style={{position:'fixed', top:0, left:0, width:250, paddingLeft:10, opacity:0.8}}>

        {
          this.state.showSettings
          ? <Card style={{marginTop:10}}>
            <CardContent>

              <Typography gutterBottom variant="h5" component="h2" style={{opacity:1}}>
                Settings
              </Typography>

              <div style={{paddingBottom:10}}>
                <FormControl style={{width:'100%'}}>
                  <InputLabel htmlFor='backselect'>Background</InputLabel>
                  <Select
                    value={this.state.background}
                    inputProps={{ name:'back select', id:'backselect'}}
                    onChange={(e) => {
                      this.setState({background:e.target.value})
                    }}>
                    {
                      themes.map(themename => {
                        return (
                          <MenuItem value={themename}>{themename}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </div>

              <div style={{paddingBottom:10}}>
                <FormControl style={{width:'100%'}}>
                  <InputLabel htmlFor='themeselect'>Theme</InputLabel>
                  <Select
                    value={this.state.theme}
                    inputProps={{ name:'theme select', id:'themeselect'}}
                    onChange={(e) => {
                      this.setState({theme:e.target.value})
                    }}>
                    {
                      themes.map(themename => {
                        return (
                          <MenuItem value={themename}>{themename}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </div>

              <div>
                <FormControl style={{width:'100%'}}>
                  <InputLabel htmlFor='variantselect'>Variant</InputLabel>
                  <Select
                    value={this.state.variant}
                    inputProps={{ name:'variant select', id:'variantselect'}}
                    onChange={(e) => {
                      this.setState({variant:e.target.value})
                    }}>
                    {
                      ['paper','outlined','filled'].map(variantname => {
                        return (
                          <MenuItem value={variantname}>{variantname}</MenuItem>
                        )
                      })
                    }
                  </Select>
                </FormControl>
              </div>

              <form onSubmit={(e) => {e.preventDefault()}}>
                <TextField
                  id="linewidthfield"
                  label="Line width"
                  value={this.state.lineWidth}
                  onChange={(e) => {this.setState({lineWidth:e.target.value})}}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{width:'100%'}}
                  margin="normal"/>
              </form>

              <Button
                variant="outlined"
                onClick={(e) => {
                  htmlToImage.toPng(this.diagramRef).then(function (dataUrl) {
                    var img = new Image();
                    img.src = dataUrl;
                    console.log(img)
                    var link = document.createElement('a');
                    link.download = 'diagram.png';
                    link.href = dataUrl;
                    link.click();
                  })
                }}>
                Export
              </Button>

            </CardContent>
          </Card> : null
        }

        {
          this.state.selected !== null && this.state.selected in this.state.points
            ? <Card style={{marginTop:10}}>
              <CardContent style={{paddingTop:0, paddingBottom:15}}>

                <form onSubmit={(e) => {e.preventDefault()}}>
                  <TextField
                    id="msgfield"
                    label="Message"
                    autoComplete="off"
                    inputRef={(input) => {if (this.doFocus && input) input.focus()}}
                    value={this.state.points[this.state.selected].msg}
                    onChange={(e) => {
                      var points = this.state.points
                      var point = points[this.state.selected]
                      point.msg = e.target.value
                      this.setState({points: points})
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{width:'100%'}}
                      margin="normal"/>
                </form>

                <Button
                  variant="outlined"
                  onClick={(e) => {
                    var selected = this.state.selected;
                    var points = {}
                    Object.keys(this.state.points).map(testkey => {
                      if (testkey !== selected) points[testkey] = this.state.points[testkey]
                    })
                    if (Object.keys(points).length === 0) this.count = 0
                    this.setState({selected:null, points})
                  }}>
                  Delete
                </Button>

              </CardContent>
            </Card> : null
        }

      </div>
    )
  }


  render() {
    return (
      <MuiThemeProvider theme={darktheme}>

        <div>
          <Flowspace
            theme={this.state.theme}
            variant={this.state.variant}
            background={this.state.background}
            getDiagramRef={ref => {this.diagramRef = ref}}
            avoidCollisions
            style={{height:'100vh', width:'100vw'}}
            connectionSize={this.state.lineWidth}
            selected={this.state.selected}
            onClick={e => {this.setState({ selected:null, selectedLine:null })}}>

            {
              Object.keys(this.state.points).map(key => {
                var point = this.state.points[key]

                return (

                  <Flowpoint
                    key={key}
                    snap={{x:10, y:10}}
                    style={{height:Math.max(50, Math.ceil(point.msg.length / 20) * 30)}}
                    startPosition={point.pos}
                    outputs={point.outputs}
                    onClick={e => {this.handleClick(key, e)}}
                    onTouch={e => {this.handleTouch(key, e)}}
                    onDrag={pos => {
                      var points = this.state.points;
                      points[key].pos = pos;
                      this.setState({points, lastPos:pos})
                    }}>
                    <div style={{display:'table', width:'100%', height:'100%'}}>
                      <div style={{display:'table-cell', verticalAlign:'middle', textAlign:'center', paddingLeft:2, paddingRight:2}}>
                        {
                          point.msg !== '' ? point.msg : 'empty'
                        }
                      </div>
                    </div>
                  </Flowpoint>

                )

              })
            }

          </Flowspace>
        </div>

        {
          this.state.showInfobox ? this.infoBox() : this.settingsBox()
        }

        <div style={{position:'fixed', bottom:0, right:0, padding:3}}>
          <div style={{paddingBottom:3}}>
            <Fab
              style={{background:lightBlue['A400'], color:'#ffffff', zIndex:6, boxShadow:'none'}}
              onClick={() => {this.handleAddPoint()}}>
              <AddIcon />
            </Fab>
          </div>
          <div style={{paddingBottom:3}}>
            <Fab
              style={{background:indigo['A400'], color:'#ffffff', zIndex:6, boxShadow:'none'}}
              onClick={() => {
                var newQuery = parseToQuery(this.state.theme, this.state.variant, this.state.lineWidth, this.count, this.state.points);
                postToDB(newQuery, (mod_id) => {
                  var newUrl = this.baseUrl + '?p=' + mod_id;
                  copy(newUrl)
                  this.setState({
                    snackShow: true,
                    snackMsg: 'Copied link to clipboard',
                    snackcolor: indigo['A400']
                  })
                })
              }}>
              <LinkIcon />
            </Fab>
          </div>
          <div style={{paddingBottom:3}}>
            <Fab
              style={{background:deepPurple['A400'], color:'#ffffff', zIndex:6, boxShadow:'none'}}
              onClick={() => { this.setState({showSettings:(this.state.showInfobox ? true : !this.state.showSettings), showInfobox:false}) }}>
              <SettingsIcon />
            </Fab>
          </div>
          <div>
            <Fab
              style={{background:orange['A700'], color:'#ffffff', zIndex:6, boxShadow:'none'}}
              onClick={() => { this.setState({showInfobox:!this.state.showInfobox}) }}>
              <HelpIcon />
            </Fab>
          </div>
        </div>

        <Snackbar
          autoHideDuration={3000}
          onClose={() => { this.setState({snackShow:false}) }}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          open={this.state.snackShow}>
          <SnackbarContent
            message={this.state.snackMsg}
            style={{backgroundColor:this.state.snackcolor, color:'black'}}/>
        </Snackbar>

      </MuiThemeProvider>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));
