import React, { Component } from 'react';

import Flowpoint from './Flowpoint.js';
import { getColor, AutoGetLoc } from './Helpers.js';


// Component class
export default class Flowspace extends Component {

  constructor(props) {

    super(props);
    this.state = {};

    // Helper variables
    this.didMount = false; // Used to determine when drawing of connections should start

    // Binding class methods
    this.updateFlowspace = this.updateFlowspace.bind(this);
    this.handleFlowspaceClick = this.handleFlowspaceClick.bind(this);

  }


  updateFlowspace(key, pos) {
    this.setState({ [key]:pos });
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
        const test = ['flowcontainer', 'flowspace', 'flowconnections'];
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

    // Colors
    const theme_colors = getColor(this.props.theme || 'indigo');
    const background_color = getColor(this.props.background || 'white');
    const selected = this.props.selected ? (Array.isArray(this.props.selected) ? this.props.selected : [this.props.selected]) : [];

    // Helper variables
    var connections = [];
    var paths = [];
    var gradients = [];
    var defs = {};
    var maxX = 0;
    var maxY = 0;

    // Extracting connections and adding updateFlowspace to all children
    var newKeys = []
    const childrenWithProps = React.Children.map(this.props.children, child => {

      if (child.type === Flowpoint) {

        const outputs = child.props.outputs;

        // Outputs can be defined as array or object
        if (outputs instanceof Array) {

          outputs.map(out_key => {
            connections.push({
              a:child.key,
              b:out_key,
              width: this.props.connectionSize || 4,
              outputLoc: 'auto',
              inputLoc: 'auto',
              outputColor: theme_colors.p,
              inputColor: this.props.noFade ? theme_colors.p : theme_colors.a,
              dash: undefined,
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
              outputColor: output.outputColor || theme_colors.p,
              inputColor: output.inputColor || (this.props.noFade ? theme_colors.p : theme_colors.a),
              arrowStart: output.arrowStart,
              arrowEnd: output.arrowEnd,
              dash: (output.dash !== undefined ? (output.dash > 0 ? output.dash : undefined) : undefined),
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
          selected:(child.props.selected || selected.includes(child.key)),
          spaceColor:background_color,
          variant:(child.props.variant || (this.props.variant || 'paper')),
          theme:(child.props.theme || (this.props.theme || 'indigo'))
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
        maxX = Math.max(maxX, point.x + 4 * point.width)
        maxY = Math.max(maxY, point.y + 4 * point.height)
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
          var positions = AutoGetLoc(pa, pb, connection.outputLoc, connection.inputLoc, connection.a, connection.b, this.state, (this.props.avoidCollisions === false ? false : true));

          // Display arrows - if set then connection-specific overrides flowspace
          var markerStart = this.props.arrowStart;
          if (connection.arrowStart !== undefined) markerStart = connection.arrowStart;
          var markerEnd = this.props.arrowEnd;
          if (connection.arrowEnd !== undefined) markerEnd = connection.arrowEnd;

          // Adding coloured arrow-marker definitions to list (if not already present)
          if (markerStart && !defs[connection.outputColor]) defs[connection.outputColor] = 
            <marker id={"arrow" + connection.outputColor} viewBox="0 0 50 50" markerWidth="5" markerHeight="5" refX="45" refY="24" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M0,0 L50,20 v8 L0,48 L6,24 Z" fill={connection.outputColor} stroke-width='0' opacity='1' />
            </marker>
          if (markerEnd && !defs[connection.inputColor]) defs[connection.inputColor] = 
            <marker id={"arrow" + connection.inputColor} viewBox="0 0 50 50" markerWidth="5" markerHeight="5" refX="45" refY="24" orient="auto-start-reverse" markerUnits="strokeWidth">
              <path d="M0,0 L50,20 v8 L0,48 L6,24 Z" fill={connection.inputColor} stroke-width='0' opacity='1' />
            </marker>

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
              style={{
                transition:'stroke-width 0.15s ease-in-out',
                strokeDasharray:connection.dash
              }}
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
              onClick={connection.onClick}
              markerStart={markerStart ? 'url(#arrow' + connection.outputColor + ')' : null}
              markerEnd={markerEnd ? 'url(#arrow' + connection.inputColor + ')' : null}
              />
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

    }

    // Adding scroll (settings for overflow will be overwritten if defined by user)
    var style = {
      overflow:'scroll',
      backgroundColor: background_color.p
    };
    if (this.props.style) {
      Object.keys(this.props.style).map(propkey => {
        style[propkey] = this.props.style[propkey];
      });
    };

    // Returning finished Flowspace
    return (
      <div style={style} onClick={this.handleFlowspaceClick} className='flowcontainer'>
        <div style={{width:maxX, height:maxY, position:'relative', overflow:'visible'}} className='flowspace'>
          <div ref={ref => {if (this.props.getDiagramRef) this.props.getDiagramRef(ref)}} style={{width:'100%', height:'100%', backgroundColor:background_color.p}}>

            <svg style={{width:'100%', height:'100%', position:'absolute', overflow:'visible'}} className='flowconnections'>
              <defs>
                  {Object.values(defs)}
              </defs>
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
      </div>
    )
  }
}
