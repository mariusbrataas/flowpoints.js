// Helps calculate new positions on drag
export function CalcPos(pos, snap, minimum) {
  return Math.max(minimum, Math.round(pos + snap - (pos % snap)))
}


// Colors
export function getColor(color) {

  if (color) {
    switch (color) {
      case 'red':         return { p:'#d50000', s:'#950000', a:'#AE00D5', t:'light', o:'#00c853' };
      case 'pink':        return { p:'#c51162', s:'#890b44', a:'#7811C5', t:'light', o:'#64dd17' };
      case 'purple':      return { p:'#aa00ff', s:'#7600b2', a:'#000FFF', t:'light', o:'#aeea00' };
      case 'deep-purple': return { p:'#6200ea', s:'#4400a3', a:'#0046EA', t:'light', o:'#ffd600' };
      case 'indigo':      return { p:'#304ffe', s:'#2137b1', a:'#30E0FE', t:'light', o:'#ffab00' };
      case 'blue':        return { p:'#2962ff', s:'#1c44b2', a:'#29F9FF', t:'light', o:'#ff6d00' };
      case 'light-blue':  return { p:'#0091ea', s:'#0065a3', a:'#00EA99', t:'light', o:'#ff3d00' };
      case 'green':       return { p:'#00c853', s:'#008c3a', a:'#54C800', t:'light', o:'#d50000' };
      case 'light-green': return { p:'#64dd17', s:'#469a10', a:'#DDCB17', t:'dark',  o:'#c51162' };
      case 'lime':        return { p:'#aeea00', s:'#79a300', a:'#EABC00', t:'dark',  o:'#aa00ff' };
      case 'yellow':      return { p:'#ffd600', s:'#b29500', a:'#FF9000', t:'dark',  o:'#6200ea' };
      case 'amber':       return { p:'#ffab00', s:'#b27700', a:'#FF5100', t:'dark',  o:'#304ffe' };
      case 'orange':      return { p:'#ff6d00', s:'#b24c00', a:'#FF0A00', t:'light',  o:'#2962ff' };
      case 'deep-orange': return { p:'#ff3d00', s:'#b22a00', a:'#FF0084', t:'light', o:'#0091ea' };
      case 'brown':       return { p:'#795548', s:'#543b32', a:'#79485D', t:'light', o:'#607d8b' };
      case 'grey':        return { p:'#9e9e9e', s:'#6e6e6e', a:'#9e9e9e', t:'light', o:'#000000' };
      case 'blue-grey':   return { p:'#607d8b', s:'#435761', a:'#608B7A', t:'light', o:'#795548' };
      case 'black':       return { p:'#000000', s:'#333333', a:'#435761', t:'light', o:'#ffffff' };
      case 'white':       return { p:'#ffffff', s:'#6e6e6e', a:'#608b84', t:'dark',  o:'#000000' };
      default:            return { p:color,     s:color,     a:'#304ffe', t:'light', o:'#ffab00' };
    }
  }

  return { p:'#ffffff', s:'#6e6e6e', a:'#608b84', t:'dark',  o:'#000000' };

}


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
export function AutoGetLoc(pa, pb, aLoc, bLoc, key1, key2, allPositions, avoidCollisions) {
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
