import React, { Component } from "react";
import ReactDOM from "react-dom";

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';

var CryptoJS = require("crypto-js");

export function num2string(num) {
  return num.toString(36)
}

export function string2num(str) {
  return parseInt(str, 36)
}

export const themes = [
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
  'brown',
  'grey',
  'blue-grey',
  'black',
  'white'
]

export const arrows = [
  'none',
  'start',
  'end',
  'both'
]

export const darktheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  typography: { useNextVariants: true },
});

const lvls = {
  0:'IIA',
  1:'IIB',
  2:'IIC',
  3:'IID'
}

// Parse from current state to query
export function parseToQuery(tmp_theme, tmp_variant, lineWidth, count, points) {
  var msg = '' + num2string(themes.indexOf(tmp_theme)) + lvls[0] + tmp_variant
  msg += lvls[0] + num2string(lineWidth) + lvls[0] + num2string(count)
  Object.keys(points).map(key => {
    const p = points[key]
    msg += lvls[0] + key
    msg += lvls[1] + p.msg
    msg += lvls[1] + num2string(Math.round( p.pos.x / 10 ))
    msg += lvls[1] + num2string(Math.round( p.pos.y / 10 ))
    msg += lvls[1]
    Object.keys(p.outputs).map(out_key => {
      msg += out_key
      msg += lvls[3] + p.outputs[out_key].output[0]
      msg += p.outputs[out_key].input[0]
      msg += lvls[2]
    })
    if (Object.keys(p.outputs).length !== 0) {
      msg = msg.substring(0, msg.length - 1)
    }
  })
  return msg
}


// Parse query and return state variables
export function parseFromQuery(rawquery) {
  var newLib = { points:{} }
  var queries = rawquery.split(lvls[0])
  newLib['theme'] = (queries[0] === 'R' ? null : themes[string2num(queries[0])])
  newLib['variant'] = queries[1]
  newLib['lineWidth'] = string2num(queries[2])
  newLib['count'] = string2num(queries[3])
  queries.slice(4).map(q_str => {
    var p = {}
    var q = q_str.split(lvls[1])
    p['msg'] = q[1]
    p['pos'] = { x:string2num(q[2])*10, y:string2num(q[3])*10 }
    p['outputs'] = {}
    q[4].split(lvls[2]).map(output_str => {
      const output_q = output_str.split(lvls[3])
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

export function ReplaceAll(str, search, replacement) {
  var newstr = ''
  str.split(search).map(val => {newstr += val + replacement})
  return newstr.substring(0, newstr.length - replacement.length)
}

export function getSpecialsLib(reversed) {
  var lib = {
    '§': '%C2%A7',
    '"': '%22',
    '#': '%23',
    '%': '%25',
    '&': '%26',
    '=': '%3D',
    '`': '%60',
    '^': '%5E',
    '+': '%2B',
    '´': '%C2%B4',
    '¨': '%C2%A8'
  }
  if (reversed) {
    var revlib = {}
    Object.keys(lib).map(key => {
      revlib[lib[key]] = key
    })
    return revlib
  }
  return lib
}

export function Encrypt(data, key) {
  var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
  const specials = getSpecialsLib()
  Object.keys(specials).map(key => {
    encrypted = ReplaceAll(encrypted, key, specials[key])
  })
  return encrypted
}

export function Decrypt(data, key) {
  var msg = data
  const specials = getSpecialsLib(true)
  Object.keys(specials).map(key => {
    msg = ReplaceAll(msg, key, specials[key])
  })
  return JSON.parse(CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8))
}


export class PasswordContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pswd: ''
    }
  }
  render() {
    return (
      <form autoComplete='off' onSubmit={(e) => {e.preventDefault(); if (this.props.onSubmit) {this.props.onSubmit(this.state.pswd)}}}>
        <TextField
          id="pswdfield"
          label="Password"
          value={this.state.pswd}
          onChange={(e) => {this.setState({pswd:e.target.value})}}
          type="text"
          InputLabelProps={{
            shrink: true,
          }}
          style={{width:'100%'}}
          margin="normal"
          inputRef={(input) => {if (input) {input.focus()}}}/>
      </form>
    )
  }
}