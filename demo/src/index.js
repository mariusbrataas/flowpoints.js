import React, { Component } from "react";
import ReactDOM from "react-dom";
import './index.css';

import { Flowspace, Flowpoint } from '../../src';

var myImg1 = require('../../assets/favicon.ico');
var myImg2 = require('../../assets/this_is_flowpoints.png');


/*
The following two functions - num2string and string2num - are meant to help
keep the URL as short as possible. By leveraging a number system with 36 symbols
higher numbers can be described in fewer places.

For example 100k = 255s

This doesn't shorten the URL much, but anything helps.
*/
function num2string(num) {
  return num.toString(36)
}

function string2num(str) {
  return parseInt(str, 36)
}


// Parse from current state to query
function parseToQuery(inputColor, outputColor, lineWidth, count, points) {
  var msg = '' + inputColor + '_' + outputColor + '_' + num2string(lineWidth) + '_' + num2string(count)
  Object.keys(points).map(key => {
    const p = points[key]
    msg += '_' + key
    msg += '&' + p.msg
    msg += '&' + num2string(Math.round( p.pos.x / 10 ))
    msg += '&' + num2string(Math.round( p.pos.y / 10 ))
    msg += '&'
    Object.keys(p.outputs).map(out_key => {
      msg += out_key
      msg += ',' + p.outputs[out_key].output[0]
      msg += p.outputs[out_key].input[0]
      msg += '#'
    })
    if (Object.keys(p.outputs).length !== 0) {
      msg = msg.substring(0, msg.length - 1)
    }
  })
  msg = msg.replace(/ /g, '%s0')
  return msg
}


// Parse query and return state variables
function parseFromQuery(rawquery) {
  var query = rawquery.replace(/%s0/g, ' ')
  var newLib = { points:{} }
  var queries = query.split('_')
  newLib['inputColor'] = queries[0]
  newLib['outputColor'] = queries[1]
  newLib['lineWidth'] = string2num(queries[2])
  newLib['count'] = string2num(queries[3])
  queries.slice(4).map(q_str => {
    var p = {}
    var q = q_str.split('&')
    p['msg'] = q[1]
    p['pos'] = { x:string2num(q[2])*10, y:string2num(q[3])*10 }
    p['outputs'] = {}
    q[4].split('#').map(output_str => {
      const output_q = output_str.split(',')
      if (output_q.length === 2) {
        const let2pos = {
          a: 'auto',
          t: 'top',
          l: 'left',
          c: 'center',
          r: 'right',
          b: 'bottom'
        }
        p.outputs[output_q[0]] = {
          output: let2pos[output_q[1][0]],
          input: let2pos[output_q[1][1]]
        }
      }
    })
    newLib.points['' + q[0]] = p
  })
  return newLib
}


// Main example
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      selectedLine: null,
      connecting: null,
      inputColor: '#00fff2',
      outputColor: '#0c00ff',
      lineWidth: 4,
      points: {}
    }

    // Helper variables
    this.baseUrl = window.location.href.split('/?p=')[0]
    if (this.baseUrl[this.baseUrl.length - 1] !== '/') this.baseUrl += '/'
    this.count = Object.keys(this.state.points).length
    this.currentQuery = ''

    // Binding class methods
    this.handleClick = this.handleClick.bind(this)
    this.settingsBox = this.settingsBox.bind(this)
    this.handleAddPoint = this.handleAddPoint.bind(this)
    this.handleClickLine = this.handleClickLine.bind(this)

    // Adding lineClick
    Object.keys(this.state.points).map(key => {
      Object.keys(this.state.points[key].outputs).map(out_key => {
        this.state.points[key].outputs[out_key].onClick = this.handleClickLine
      })
    })
  }


  componentDidMount() {
    const query = window.location.href.split(this.baseUrl)[1].substring(3)
    if (query) {
      try {
        var newLib = parseFromQuery(query)
        this.count = newLib.count
        this.setState({
          inputColor: newLib.inputColor,
          outputColor: newLib.outputColor,
          lineWidth: newLib.lineWidth,
          points: newLib.points })
      } catch(err) {
        console.log('Failed to rebuild from query', err)
      }
    }
  }


  componentDidUpdate() {
    try {
      var newQuery = parseToQuery(this.state.inputColor, this.state.outputColor, this.state.lineWidth, this.count, this.state.points);
      if (newQuery !== this.currentQuery) {
        window.history.replaceState({}, null, this.baseUrl + '?p=' + newQuery);
        this.currentQuery = newQuery;
      }
    } catch(err) {
      console.log('Url encoding failed', err);
    }
  }


  handleClickLine(key, out_key, e) {
    var selectedLine = {a:key, b:out_key}
    var points = this.state.points
    if (this.state.selectedLine !== null) {
      if (selectedLine.a === this.state.selectedLine.a && selectedLine.b === this.state.selectedLine.b) {
        selectedLine = null
      }
    }
    this.setState({selectedLine})
  }


  handleAddPoint() {
    var newpoint = {
      msg: 'Message',
      pos: {x:50, y:50},
      outputs: {},
    }
    var points = this.state.points
    points['' + this.count] = newpoint
    this.count += 1
    this.setState({points})
  }


  handleClick(id) {
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
      selected = null
    }
    this.setState({selected, points})
  }


  settingsBox() {
    const boxStyle = {
      padding:'5px',
      marginBottom:'10px',
      backgroundColor:'white',
      boxShadow:'0 1px 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
    }
    return (
      <div style={{top:'10px', right:'10px', position:'fixed'}}>
        <div style={boxStyle}>
          <h2 style={{marginTop:'2px'}}>Settings</h2>
          <form onSubmit={(e) => {e.preventDefault()}}>
            <label>
              Input color:
              <input
                style={{marginLeft:'10px'}}
                value={this.state.inputColor}
                onChange={(e) => {
                  this.setState({inputColor: e.target.value})
                }}/>
            </label>
          </form>
          <form onSubmit={(e) => {e.preventDefault()}}>
            <label>
              Output color:
              <input
                style={{marginLeft:'10px'}}
                value={this.state.outputColor}
                onChange={(e) => {
                  this.setState({outputColor: e.target.value})
                }}/>
            </label>
          </form>
          <form onSubmit={(e) => {e.preventDefault()}}>
            <label>
              Linewidth:
              <input
                style={{marginLeft:'10px'}}
                value={this.state.lineWidth}
                type='number'
                onChange={(e) => {
                  this.setState({lineWidth: e.target.value})
                }}/>
            </label>
          </form>
          <button onClick={this.handleAddPoint}>Add new flowpoint</button>
        </div>
        {
          this.state.selected !== null && this.state.selected in this.state.points ?
            <div style={boxStyle}>
              <h2 style={{marginTop:'2px'}}>Flowpoint contents</h2>
              <button
                style={{marginBottom:'10px'}}
                onClick={(e) => {
                  var selected = this.state.selected;
                  var points = {}
                  Object.keys(this.state.points).map(testkey => {
                    if (testkey !== selected) points[testkey] = this.state.points[testkey]
                  })
                  if (Object.keys(points).length === 0) this.count = 0
                  this.setState({selected:null, points})
                }}>Delete</button>
              <form onSubmit={(e) => {e.preventDefault()}}>
                <label>
                  Message:
                  <input
                    style={{marginLeft:'10px'}}
                    ref={(msgRef) => {
                      if (msgRef) msgRef.focus()
                    }}
                    onFocus={e => {e.target.select()}}
                    value={this.state.points[this.state.selected].msg}
                    onChange={(e) => {
                      var points = this.state.points
                      var point = points[this.state.selected]
                      point.msg = e.target.value
                      this.setState({points: points})
                    }}/>
                </label>
              </form>
            </div>
            : null
        }
        {
          this.state.selectedLine !== null ?
            <div style={boxStyle}>
              <h2 style={{marginTop:'2px'}}>Connection</h2>
              {
                ['input', 'output'].map(dir_key => {
                  return (
                    <div>
                      <h4 style={{marginTop:'5px', marginBottom:'2px'}}>{dir_key + ' position'}</h4>
                      {
                        ['auto', 'top', 'left', 'center', 'right', 'bottom'].map(pos_key => {
                          return (
                            <button
                              style={{marginTop:'2px'}}
                              onClick={(e) => {
                                var points = this.state.points
                                var output = points[this.state.selectedLine.a].outputs[this.state.selectedLine.b]
                                output[dir_key] = pos_key
                                this.setState({points})
                              }}>{pos_key}</button>
                          )
                        })
                      }
                    </div>
                  )
                })
              }
            </div>
            : null
        }
      </div>
    )
  }


  render() {
    return (
      <div>
        <Flowspace
          style={{height:'100vh', width:'100vw'}}
          inputColor={this.state.inputColor}
          outputColor={this.state.outputColor}
          connectionSize={this.state.lineWidth}
          selected={this.state.selected}
          selectedLine={this.state.selectedLine}
          onLineClick={this.handleClickLine}>
          {
            Object.keys(this.state.points).map(key => {
              var point = this.state.points[key]
              return (
                <Flowpoint
                  key={key}
                  snap={{x:10, y:10}}
                  startPosition={point.pos}
                  outputs={point.outputs}
                  onClick={() => {this.handleClick(key)}}
                  onDrag={pos => {
                    var points = this.state.points;
                    points[key].pos = pos;
                    this.setState({points})
                  }}>
                  <div style={{display:'table', width:'100%', height:'100%'}}>
                    <div style={{display:'table-cell', verticalAlign:'middle', textAlign:'center'}}>
                      {
                        point.msg
                      }
                    </div>
                  </div>
                </Flowpoint>
              )
            })
          }
        </Flowspace>
        {
          this.settingsBox()
        }
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));
