import React, { Component } from 'react';


// Seems easier to put this here rather than inside the event handlers (onMouseMove, onTouchMove)
function CalcPos(pos, snap, minimum) {
  return Math.max(minimum, Math.round(pos + snap - (pos % snap)))
}


// Component class
export default class Flowpoint extends Component {


  constructor(props) {

    super(props);
    this.state = {

      // Helpers
      id: props.id,
      selected: (props.selected === undefined) ? false : props.selected,
      noShadow: (props.noShadow === undefined) ? false : props.noShadow,

      // Snap to grid
      snap: (props.snap === undefined) ? {x:1, y:1} : props.snap,

      // Enable drag along axes
      dragX: (props.dragX === undefined) ? true : props.dragX,
      dragY: (props.dragY === undefined) ? true : props.dragY,

      // Position limits
      minX: (props.minX === undefined) ? 0 : props.minX,
      minY: (props.minY === undefined) ? 0 : props.minY,

      // Sizes
      width: (props.width === undefined) ? 150 : props.width,
      height: (props.height === undefined) ? 50 : props.height,

      // Currently dragging
      drag: false,

      // Position and relative position
      pos: (props.startPosition === undefined) ? {x:0, y:0} : props.startPosition,
      rel: {x:0, y:0}

    };

    // Helper variables
    this.didDrag = false;
    this.doTellFlowspace = false;

    // User defined event handlers
    this.onClick = props.onClick;
    this.onDrag = props.onDrag;
    this.onHover = props.onHover;

    // Refered methods
    this.updateFlowspace = props.updateFlowspace;

    // Binding helper methods
    this.tellFlowspace = this.tellFlowspace.bind(this);

    // Binding event handlers
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

  }


  componentDidMount() {
    this.tellFlowspace(); // Flowspace won't draw connections before this have been called
  }


  componentWillReceiveProps(props) {
    const testkeys = ['width', 'height']
    testkeys.map(propkey => {
      if (propkey in props) {
        if (props[propkey] !== this.state[propkey]) {
          this.state[propkey] = props[propkey]
          this.doTellFlowspace = true
        }
      }
    })
  }


  componentDidUpdate(props, state) {

    // Telling flowspace about changes?
    if (this.doTellFlowspace) {
      this.tellFlowspace();
      this.doTellFlowspace = false;
    }

    // Adding/removing event listeners
    if (this.state.drag && !state.drag) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.drag && state.drag) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }

  }


  tellFlowspace() {

    // Telling parent flowspace about new positions and/or dimensions
    this.updateFlowspace(
      this.state.id,
      {
        x: this.state.pos.x,
        y: this.state.pos.y,
        width: this.state.width,
        height: this.state.height
      }
    )

    // Prevent another tell on componentDidUpdate
    this.doTellFlowspace = false;

  }


  onTouchStart(e) {

    // No dragging?
    if (e.target.className.includes('nodrag')) return

    // Resetting drag
    this.didDrag = false;

    // Updating state
    this.setState({
      drag: true,
      rel: {
        x: e.touches[0].pageX - this.state.pos.x,
        y: e.touches[0].pageY - this.state.pos.y
      }
    })

    // Final routines
    e.preventDefault()
    e.stopPropagation()

  }


  onTouchEnd(e) {

    // Trigger user-defined onClick?
    if (!this.didDrag) this.onClick(e)

    // Resetting drag
    this.setState({drag: false})

    // Updating flowspace
    this.tellFlowspace()

    // Final routines
    e.stopPropagation()
    e.preventDefault()

  }


  onTouchMove(e) {

    // No dragging?
    if (!this.state.drag) return

    // Flowpoint was moved
    this.didDrag = true;

    // Calculating new position
    var pos = {
      x: this.state.dragX ? CalcPos(e.touches[0].pageX - this.state.rel.x, this.state.snap.x, this.state.minX) : this.state.pos.x,
      y: this.state.dragY ? CalcPos(e.touches[0].pageY - this.state.rel.y, this.state.snap.y, this.state.minY) : this.state.pos.y
    };
    this.setState({pos})

    // Passing to user-defined event handler
    if (this.onDrag) this.onDrag(pos)

    // Updating flowspace
    this.tellFlowspace()

    // Final routines
    e.preventDefault()
    e.stopPropagation()

  }


  onMouseOver(e) {
    // Trigger user-defined event?
    if (this.onHover) {
      this.onHover(true)
    }
  }


  onMouseOut(e) {
    // Trigger user-defined event?
    if (this.onHover) {
      this.onHover(false)
    }
  }


  onMouseDown(e) {

    // Wrong button or nodrag will cancel click and drag events
    if (e.button !== 0) return
    if (e.target.className.includes('nodrag')) return

    // Resetting dragging (just to be sure)
    this.didDrag = false;

    // Updating state
    this.setState({
      drag: true,
      rel: {
        x: e.pageX - this.state.pos.x,
        y: e.pageY - this.state.pos.y
      }
    })

    // Final routines
    e.stopPropagation()
    e.preventDefault()

  }


  onMouseUp(e) {

    // Trigger user-defined onClick?
    if (!this.didDrag) this.onClick(e)

    // Resetting drag
    this.setState({drag: false})

    // Updating flowspace
    this.tellFlowspace()

    // Final routines
    e.stopPropagation()
    e.preventDefault()

  }


  onMouseMove(e) {

    // No dragging?
    if (!this.state.drag) return

    // Flowpoint was moved
    this.didDrag = true;

    // Calculating new position
    var pos = {
      x: this.state.dragX ? CalcPos(e.pageX - this.state.rel.x, this.state.snap.x, this.state.minX) : this.state.pos.x,
      y: this.state.dragY ? CalcPos(e.pageY - this.state.rel.y, this.state.snap.y, this.state.minY) : this.state.pos.y
    }
    this.setState({pos})

    // Passing to user-defined event handler
    if (this.onDrag) this.onDrag(pos)

    // Updating flowspace
    this.tellFlowspace()

    // Final routines
    e.stopPropagation()
    e.preventDefault()

  }


  render() {

    // Prepping default style (and adds updated position)
    var style = {
      width: this.props.width || this.state.width,
      height: this.props.height || this.state.height,
      left: this.state.pos.x + 'px',
      top: this.state.pos.y + 'px',
      position: 'absolute',
      backgroundColor: 'white',
      boxShadow: this.state.noShadow ? null : this.props.selected ? '2px 2px 3px rgba(0,0,0,0.12), 0 3px 3px rgba(0,0,0,0.24)' : '2px 2px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24)'
    }

    // Adding user defined styles
    if (this.props.style) {
      Object.keys(this.props.style).map(key => {
        style[key] = this.props.style[key];
      })
    }

    // Returning finished Flowpoint
    return (
      <div
        key={this.state.id}
        style={style}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onMouseDown={(e) => {this.onMouseDown(e)}}
        onMouseUp={(e) => {this.onMouseUp(e)}}
        onMouseMove={(e) => {this.onMouseMove(e)}}
        onTouchStart={(e) => {this.onTouchStart(e)}}
        onTouchEnd={(e) => {this.onTouchEnd(e)}}
        onTouchCancel={(e) => {this.onTouchEnd(e)}}
        onTouchMove={(e) => {this.onTouchMove(e)}}>
        {
          this.props.children
        }
      </div>
    )
  }
}
