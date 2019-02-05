![](assets/this_is_flowpoints.png)

# Flowpoints
A developer-friendly library for creating flowcharts and diagrams.


## Installation
```‌
npm install --save flowpoints
```


## Usage
```javascript
import React from 'react';
import { Flowpoint, Flowspace } from 'flowpoints';

...
<Flowspace>
	<Flowpoint key={"point_a"} outputs={["point_b"]}>
		<div>
			Hello world
			...
		</div>
	</Flowpoint>
	<Flowpoint id={"point_b"}>
		<div>
			I am point b
			...
		</div>
	</Flowpoint>
</Flowspace>
...
```

To create a new diagram start by creating open-and-close tags for the "Flowspace". It’s in between these that you may add flowpoints.


### No-drag areas
To create a no-drag area simply set the className of your component/element to "nodrag".


### Outputs
The flowspace extracts information about all connections from the outputs of every flowpoint. Telling a flowpoint about inputs won’t have any effect.

There are two ways to pass info about the connections:

__As an array.__\
Simply pass an array with the keys to all the flowpoints the current one should be connected to.

__As an object.__\
Create an object using the following pattern:

```javascript
...
<Flowpoint
	key="point_a"
	outputs={{
		"point_b": {
			output: "right",
			input: "left"
		},
		"point_c": {
			output: "right",
			input: "left"
		}
	}}>Hello World!</Flowpoint>
...
```

 The "right" and "left" arguments tell the flowspace where on the involved flowpoints the connections should attach.

 Available values (defaults to center):

 * top
 * left
 * center
 * right
 * bottom


## Recommended pattern
Once a flowpoint unmounts it will forget it's last position. To help with this (and a few more things) I find that the following pattern works really well:

```javascript
import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { Flowpoint, Flowspace } from 'flowpoints';


Class App extends Component {

	constructor(props) {
		super(props);

		this.state = {

			selected_point: null,

			flowpoints: {
				"a": {
					position: { x:50, y:50 },
					outputs: {
						"b": {
							output:"right",
							input:"left",
							outputColor:"blue",
							inputColor:"white",
							width:3,
							onClick={(key_a, key_b) => { ... }}
						}
					}
				}
			}
		}
	}

	render() {
		return (
			<Flowspace
				style={{ height:"100vh", width:"100vw" }}
				selected={this.state.selected_point}>
				{
					Object.keys(this.state.flowpoints).map(key => {
						const point = this.state.flowpoints[key]
						return (
							<Flowpoint
								key={key}
								snap={ x:10, y:10 }
								startPosition={point.pos}
								onClick={() => {
									var selected_point = this.state.selected_point
									if (selected_point === key) {
										selected_point = null
									} else {
										selected_point = key
									}
									this.setState({selected_point})
								}}
								onDrag={position => {
									var flowpoints = this.state.flowpoints
									flowpoints[key].position = position
									this.setState({flowpoints})
								}}>{"Hello from " + key}</Flowpoint>
						)
					})
				}
			</Flowspace>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))
```

Of course, you can do with much less code than this, but this example should give a good indication on how you can structure your data for a flowchart.

Check out the [demo](https://mariusbrataas.github.io/flowpoints/?p=#41e2f4_#4164f4_4_10_0&This&a&9&1,rl_1&is&y&9&2,rl#3,bt_2&Flowpoints!&1i&9&_3&a&k&k&4,rt_4&library&u&r&5,rt_5&for&14&y&6,rt_6&creating&1e&15&7,rt#8,rl#9,rb_7&flowcharts&1y&v&_8&and&1y&15&_9&diagrams&1y&1f&) and it's [source code](https://github.com/mariusbrataas/flowpoints/demo) for more.
