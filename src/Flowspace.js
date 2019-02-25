import React, { Component } from 'react';
import Flowpoint from './Flowpoint.js';


// Get connector location
function GetConnectorLoc(p, loc) {
  const base_offset = 100;
  var location = {
    x: p.x,
    y: p.y,
    offsetX: 0,
    offsetY: 0
  };
  switch(loc[0]) {
    case 't':
      location.x += Math.round( p.width / 2 );
      location.offsetY = -base_offset;
      break;
    case 'l':
      location.y += Math.round( p.height / 2 );
      location.offsetX = -base_offset;
      break;
    case 'r':
      location.x += p.width;
      location.y += Math.round( p.height / 2 );
      location.offsetX = base_offset;
      break;
    case 'b':
      location.x += Math.round( p.width / 2 );
      location.y += p.height
      location.offsetY = base_offset;
      break;
    default:
      location.x += Math.round( p.width / 2 );
      location.y += Math.round( p.height / 2 );
  }
  return location
}


// Checking wether connection crashes with other flowpoints
function DoCrash(p1, p2, key1, key2, allPositions) {

  // Helpers
  var docrash = false;
  const a = (p2.y - p1.y) / (p2.x - p1.x);
  const b = p1.y - a * p1.x;
  function getx(y) {
    return (y - b) / a
  }
  function gety(x) {
    return a * x + b
  }

  // Testing all positions
  Object.keys(allPositions).map(key => {
    if (key !== key1 && key !== key2) {
      if (!docrash) {

        // Loop specifics
        const pt = allPositions[key];
        const x1 = getx(pt.y);
        const x2 = getx(pt.y + pt.height);
        const y1 = gety(pt.x);
        const y2 = gety(pt.x + pt.width);
        const p1x = p1.x + p1.offsetX;
        const p1y = p1.y + p1.offsetY;
        const p2x = p2.x + p2.offsetX;
        const p2y = p2.y + p2.offsetY;

        // Perfectly lined up?
        if (Math.abs(p1.x - p2.x) < 1){
          if (pt.x < p1.x && p1.x < pt.x + pt.width) {
            if (Math.min(p1.y, p2.y) <= pt.y && pt.y <= Math.max(p1.y, p2.y)) {
              docrash = true
            }
          }
        }

        // Passing through box?
        if ((Math.min(p1x, p2x) < pt.x + pt.width && pt.x < Math.max(p1x, p2x)) && (Math.min(p1y, p2y) < pt.y + pt.height && pt.y < Math.max(p1y, p2y))) {
            if (pt.x <= x1 && x1 <= pt.x + pt.width) docrash = true;
            if (pt.x <= x2 && x2 <= pt.x + pt.width) docrash = true;
            if (pt.y <= y1 && y1 <= pt.y + pt.height) docrash = true;
            if (pt.y <= y2 && y2 <= pt.y + pt.height) docrash = true;
        }
        if ((Math.min(p1.x, p2.x) < pt.x + pt.width && pt.x < Math.max(p1.x, p2.x)) && (Math.min(p1.y, p2.y) < pt.y + pt.height && pt.y < Math.max(p1.y, p2.y))) {
            if (pt.x <= x1 && x1 <= pt.x + pt.width) docrash = true;
            if (pt.x <= x2 && x2 <= pt.x + pt.width) docrash = true;
            if (pt.y <= y1 && y1 <= pt.y + pt.height) docrash = true;
            if (pt.y <= y2 && y2 <= pt.y + pt.height) docrash = true;
        }

      }
    }
  })

  // Returning
  return docrash

}


// Auto connector locations
function AutoGetLoc(pa, pb, aLoc, bLoc, key1, key2, allPositions, avoidCollisions) {
  var newLocs = {
    output: null,
    input: null
  }
  if (aLoc === 'auto' || bLoc === 'auto') {
    const positions = ['top','right','left','bottom'];
    var best = {
      d: Infinity,
      output: null,
      input: null
    };
    var bestNoCrash = {
      d: Infinity,
      output: null,
      input: null
    }
    positions.map(posA => {
      const p1 = GetConnectorLoc(pa, posA);
      positions.map(posB => {

        const p2 = GetConnectorLoc(pb, posB);
        const d = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        if (d < best.d) {
          best.d = d;
          best.output = p1;
          best.input = p2;
        }

        if (avoidCollisions) {
          if (d < bestNoCrash.d && !DoCrash(p1, p2, key1, key2, allPositions)) {
            bestNoCrash.d = d;
            bestNoCrash.output = p1;
            bestNoCrash.input = p2;
          }
        }

      })
    })
    newLocs.output = aLoc === 'auto' ? (bestNoCrash.d !== Infinity ? bestNoCrash.output : best.output) : GetConnectorLoc(pa, aLoc);
    newLocs.input = bLoc === 'auto' ? (bestNoCrash.d !== Infinity ? bestNoCrash.input : best.input) : GetConnectorLoc(pb, bLoc);
  } else {
    newLocs.output = GetConnectorLoc(pa, aLoc);
    newLocs.input = GetConnectorLoc(pb, bLoc);
  }
  return newLocs
}


// Component class
export default class Flowspace extends Component {


  constructor(props) {

    super(props);
    this.state = {};

    // Helper variables
    this.updated = {};
    this.positions = {}; // To help preventing unnecessary calculations
    this.didMount = false; // Used to determine when drawing of connections should start

    // Binding class methods
    this.updateFlowspace = this.updateFlowspace.bind(this);
    this.handleFlowspaceClick = this.handleFlowspaceClick.bind(this);

  }


  updateFlowspace(key, pos) {
    this.updated[key] = true;
    this.setState({[key]: pos});
  }


  componentDidMount() {
    this.didMount = true;
  }


  handleFlowspaceClick(e) {

    // Testing click if this.props.onClick is defined
    if (this.props.onClick) {

      // Testing helper variable
      var isSpaceClick = false;

      // Testing click target (don't fire if flowpoint or connection was clicked)
      if (e.target) {
        const test = ['flowcontainer', 'flowspace', 'flowconnections']
        if (test.includes(e.target.className.baseVal)) isSpaceClick = true;
        if (test.includes(e.target.className)) isSpaceClick = true;
      }

      // Potentially triggering user-defined onClick
      if (isSpaceClick) {
        this.props.onClick(e);
        e.stopPropagation();
      }

    }

  }


  render() {

    // Helper variables
    var connections = []
    var paths = []
    var gradients = []
    var maxX = 0
    var maxY = 0

    // Extracting connections and adding updateFlowspace to all children
    var newKeys = []
    const childrenWithProps = React.Children.map(this.props.children, child => {

      if (child.type === Flowpoint) {

        const outputs = child.props.outputs

        // Outputs can be defined as array or object
        if (outputs instanceof Array) {

          outputs.map(out_key => {
            connections.push({
              a:child.key,
              b:out_key,
              width: this.props.connectionSize || 4,
              outputLoc: 'auto',
              inputLoc: 'auto',
              outputColor: this.props.outputColor || '#0c00ff',
              inputColor: this.props.inputColor || '#00fff2',
              onClick: null
            });
          });

        } else if (outputs instanceof Object) {

          Object.keys(outputs).map(out_key => {
            const output = outputs[out_key];
            connections.push({
              a:child.key,
              b:out_key,
              width: output.width || this.props.connectionSize || 4,
              outputLoc: output.output || 'auto',
              inputLoc: output.input || 'auto',
              outputColor: output.outputColor || this.props.outputColor || '#0c00ff',
              inputColor: output.inputColor || this.props.inputColor || '#00fff2',
              onClick: output.onClick ? (e) => {output.onClick(child.key, out_key, e)} : this.props.onLineClick ? (e) => {this.props.onLineClick(child.key, out_key, e)} : null
            });
          });

        };

        // Adding to newKeys
        newKeys.push(child.key);

        // Returning updated child element
        return React.cloneElement(child, {
          updateFlowspace:this.updateFlowspace,
          id:child.key,
          selected:(child.props.selected || this.props.selected === child.key),
        });
      };

    });

    // Removing unused positions
    Object.keys(this.state).map(testkey => {
      if (!newKeys.includes(testkey)) delete this.state[testkey];
    });

    // Drawing of connections will only start after Flowspace have been mounted once.
    if (this.didMount) {

      // Getting flowspace size
      Object.keys(this.state).map(key => {
        const point = this.state[key]
        maxX = Math.max(maxX, point.x + 2 * point.width)
        maxY = Math.max(maxY, point.y + 2 * point.height)
      })

      // Looping through connections and adding paths and gradients.
      var newCons = [];
      connections.map(connection => {

        // Loop specifics
        const pa = this.state[connection.a]
        const pb = this.state[connection.b]
        const con_key = connection.a + '_' + connection.b;

        const grad_name = 'grad_' + con_key;

        // Adding to this cycle's connections
        newCons.push(con_key)

        // Continuing only if both pa and pb are defined
        if (pa && pb) {

          // Calculate new positions or get old ones
          this.positions[con_key] = AutoGetLoc(pa, pb, connection.outputLoc, connection.inputLoc, connection.a, connection.b, this.state, (this.props.avoidCollisions === false ? false : true));
          var positions = this.positions[con_key];

          // Calculating bezier offsets and adding new path to list
          const d = Math.round(Math.pow(Math.pow(positions.output.x - positions.input.x, 2) + Math.pow(positions.output.y - positions.input.y, 2), 0.5) / 2)
          const pathkey = 'path_' + connection.a + '_' + connection.b
          var isSelectedLine = false
          if (this.props.selectedLine) {
            if (this.props.selectedLine.a === connection.a && this.props.selectedLine.b === connection.b) isSelectedLine = true
          }
          paths.push(
            <path
              key={pathkey}
              className='flowconnection'
              style={{ transition:'stroke-width 0.15s ease-in-out'}}
              d={'M' + positions.output.x + ',' + positions.output.y +
                'C' +
                (positions.output.x + (positions.output.offsetX > 0 ? Math.min(d, positions.output.offsetX) : Math.max(-d, positions.output.offsetX))) + ',' +
                (positions.output.y + (positions.output.offsetY > 0 ? Math.min(d, positions.output.offsetY) : Math.max(-d, positions.output.offsetY))) + ' ' +
                (positions.input.x + (positions.input.offsetX > 0 ? Math.min(d, positions.input.offsetX) : Math.max(-d, positions.input.offsetX))) + ',' +
                (positions.input.y + (positions.input.offsetY > 0 ? Math.min(d, positions.input.offsetY) : Math.max(-d, positions.input.offsetY))) + ' ' +
                (positions.input.x-0.01) + ',' + (positions.input.y-0.01)}
              fill="none"
              stroke={'url(#' + grad_name + ')'}
              strokeWidth={parseInt(connection.width) + (isSelectedLine ? 3 : 0)}
              onClick={connection.onClick}/>
          )

          // Calculating how x and y should affect gradient
          var p1 = {x:0, y:0}
          var p2 = {x:0, y:0}
          const maxD = Math.max(Math.abs(positions.output.x - positions.input.x), Math.abs(positions.output.y - positions.input.y)) + 1e-5;
          if (Math.abs(positions.output.x - positions.input.x) > Math.abs(positions.output.y - positions.input.y)) {
            if (positions.output.x > positions.input.x) {
              p1.x = maxD;
            } else {
              p2.x = maxD;
            }
          } else {
            if (positions.output.y > positions.input.y) {
              p1.y = maxD;
            } else {
              p2.y = maxD;
            }
          }
          p1.x /= maxD;
          p1.y /= maxD;
          p2.x /= maxD;
          p2.y /= maxD;

          // Adding gradient to list
          gradients.push(
            <linearGradient
              key={grad_name}
              id={grad_name}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}>
              <stop offset="0" stopColor={connection.outputColor}/>
              <stop offset="1" stopColor={connection.inputColor}/>
            </linearGradient>
          )
        }
      })

      // Prevent more calculations than necessary
      Object.keys(this.updated).map(testkey => {
        this.updated[testkey] = false
        if (!newCons.includes(testkey)) delete this.updated[testkey];
      })

    }

    // Adding scroll (settings for overflow will be overwritten if defined by user)
    var style = {overflow:'scroll'}
    if (this.props.style) {
      Object.keys(this.props.style).map(propkey => {
        style[propkey] = this.props.style[propkey];
      });
    };

    // Returning finished Flowspace
    return (
      <div style={style} onClick={this.handleFlowspaceClick} className='flowcontainer'>
        <div style={{width:maxX, height:maxY, position:'relative', overflow:'visible'}} className='flowspace'>
          <svg style={{width:'100%', height:'100%', position:'absolute', overflow:'visible'}} className='flowconnections'>
            {
              gradients
            }
            {
              paths
            }
          </svg>
          {
            childrenWithProps
          }
        </div>
      </div>
    )
  }
}
