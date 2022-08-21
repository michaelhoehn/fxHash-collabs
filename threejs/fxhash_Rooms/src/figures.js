// Randomise the placement of each room
const roomCount = 2; // <---- TODO FXRAND
const minHeight = 1;
const maxHeight = 30;
const minWidth = -30;
const maxWidth = 30;

const genererFigures = (fxhash) => {
  let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  let b58dec = (str) =>
    [...str].reduce(
      (p, c) => (p * alphabet.length + alphabet.indexOf(c)) | 0,
      0
    );
  let fxhashTrunc = fxhash.slice(2);
  let regex = new RegExp(".{" + ((fxhash.length / 4) | 0) + "}", "g");
  let hashes = fxhashTrunc.match(regex).map((h) => b58dec(h));
  let sfc32 = (a, b, c, d) => {
    return () => {
      a |= 0;
      b |= 0;
      c |= 0;
      d |= 0;
      var t = (((a + b) | 0) + d) | 0;
      d = (d + 1) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  };
  var fxrand = sfc32(...hashes);

  const figures = [];
  const features = {};

  // Here the variable u is the unit used to scale
  var u = 1;

  if (fxrand() < 0.05) {
    u += fxrand() * 3;
  }

  // The floor generator yields a "position" array of points which
  // are a simple polygon

  function floorGenerator() {
    let resolution = Math.floor(4 + fxrand() * 11);
    let stepSize = 1 + fxrand() * 4;
    let radius = Math.floor(5 + fxrand() * 8);
    let x = [];
    let y = [];
    let angle = (Math.PI / 180) * (360 / resolution);
    const positions = [];

    for (let i = 0; i < resolution; i++) {
      x.push(Math.cos(angle * i) * radius);
      y.push(Math.sin(angle * i) * radius);
    }

    for (let i = 0; i < resolution; i++) {
      var arg;
      if (i === 0) {
        arg = "moveTo";
      } else {
        arg = "lineTo";
      }
      const splinePts = {
        draw: arg,
        drawArgs: [
          (x[i] += fxrand() * stepSize - stepSize / 2),
          (y[i] += fxrand() * stepSize - stepSize / 2),
        ],
      };
      positions.push(splinePts);
    }
    return positions;
  }

  // Two helpers to build the walls

  function interpolate(a, b, frac) {
    var nx = a.x + (b.x - a.x) * frac;
    var ny = a.y + (b.y - a.y) * frac;
    return { x: nx, y: ny };
  }

  function getDistance(a, b) {
    let y = b.x - a.x;
    let x = b.y - a.y;

    return Math.sqrt(x * x + y * y);
  }

  // The addRoom function, which adds a room centered on the px/py/pz position;

  function addRoom(px, py, pz) {
    // generate a polygon
    const roomPos = floorGenerator();

    // create an array containing the walls
    const midpoints = [];

    //
    // In the anaverse, boxes are perf cheap (because they're instanced)
    // So creating walls of beams seems to be a cheap way to create
    // interesting textures
    //

    // place the wall beams between two points of each polygon
    for (let i = 0; i < roomPos.length - 1; i++) {
      var a = { x: roomPos[i].drawArgs[0], y: roomPos[i].drawArgs[1] };
      var b = { x: roomPos[i + 1].drawArgs[0], y: roomPos[i + 1].drawArgs[1] };

      var dist = getDistance(a, b);
      var height = 3.5 + fxrand() * 15;

      // give 20% chances per wall that there could be a door
      var door = fxrand() < 0.2;

      // place the beams coordinates;
      for (let j = 0; j < dist * 10; j++) {
        var point = interpolate(a, b, j / (dist * 10));
        point.height = height; // + fxrand() / 2
        point.doorstep = 0;
        if (door & (j > dist * 10 * 0.3) && j < dist * 10 * 0.7) {
          point.height = height * 0.2; // + fxrand() / 2
          point.doorstep = height * 0.8;
        }
        midpoints.push(point);
      }
    }

    // place the wall beams between the origin and the last point of the polygon
    var a = {
      x: roomPos[roomPos.length - 1].drawArgs[0],
      y: roomPos[roomPos.length - 1].drawArgs[1],
    };
    var b = { x: roomPos[0].drawArgs[0], y: roomPos[0].drawArgs[1] };

    var dist = getDistance(a, b);
    var height = 1 + fxrand() * 20;
    var door = fxrand() < 0.2;
    for (let j = 0; j < dist * 10; j++) {
      var point = interpolate(a, b, j / (dist * 10));
      point.height = height; //+ fxrand() / 2
      point.doorstep = 0;
      if (door & (j > dist * 10 * 0.3) && j < dist * 10 * 0.7) {
        point.height = height * 0.2; // + fxrand() / 2
        point.doorstep = height * 0.8;
      }
      midpoints.push(point);
    }

    // "create" the actual geometry for the wall beams
    midpoints.forEach((d) => {
      figures.push({
        geometry: { type: "BoxGeometry", args: [0.1, d.height, 0.1] },
        pos: {
          // Position
          x: (px + d.x) * u,
          // place them higher if there's a door (it's 0 when there isn't one)
          y: (py + d.doorstep + d.height / 2) * u,
          z: (pz + d.y) * u,
        },
        rot: {
          // Rotation
          x: 0,
          y: Math.sin(fxrand() * Math.PI * 2),
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
        name: "wall",
        lines: true, // Display color segments (like wireframe, but faces not triangles)
        hatch: true, // Fill with white texture
        full: false, // Fill with color texture (in the anaverse, red and cyan)
      });
    });

    //"create" the floor extrude geometry
    figures.push({
      geometry: {
        type: "ExtrudeGeometry", // Type of geometry
        shapeArgs: roomPos,
        extrudeSettings: {
          steps: 1,
          depth: 0.2,
          bevelEnabled: false,
          bevelThickness: 0,
          bevelSize: 0,
          bevelOffset: 0,
          bevelSegments: 0,
        },
      },
      pos: {
        // Position
        x: px * u,
        y: py * u,
        z: pz * u,
      },
      rot: {
        // Rotation
        x: Math.PI * 0.5,
        y: 0,
        z: 0,
      },
      scale: {
        x: 1,
        y: 1,
        z: 0.1,
      },
      name: "floor",
      lines: true, // Display color segments (like wireframe, but faces not triangles)
      hatch: true, // Fill with white texture
      full: false, // Fill with color texture (in the anaverse, red and cyan)
    });

    // "create" the actual geometry for the wall columns
    roomPos.forEach((rP) => {
      figures.push({
        geometry: { type: "BoxGeometry", args: [0.1, maxHeight, 0.1] }, // <---- TODO Adjust the max height of the columns to match the max height of the floors
        pos: {
          // Position
          x: (rP.drawArgs[0] + px) * u,
          y: py * u - maxHeight / 2, // <---- TODO same thing here
          z: (rP.drawArgs[1] + pz) * u,
        },
        rot: {
          // Rotation
          x: 0,
          y: 0,
          z: 0,
        },
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
        name: "column",
        lines: true, // Display color segments (like wireframe, but faces not triangles)
        hatch: true, // Fill with white texture
        full: false, // Fill with color texture (in the anaverse, red and cyan)
      });
    });
  }

  // "create" the ground plane to unite all rooms
  figures.push({
    geometry: {
      type: "PlaneGeometry",
      args: [1000 * u, 1000 * u],
    },
    pos: {
      x: 0,
      y: -2,
      z: 0,
    },
    rot: {
      x: -Math.PI * 0.5,
      y: 0,
      z: 0,
    },
    name: "plane",
    lines: true, // Display color segments (like wireframe, but faces not triangles)
    hatch: true, // Fill with white texture
    full: false, // Fill with color texture (in the anaverse, red and cyan)
  });
  
  // Always create a room at 0,0,0
  addRoom(0, 0, 0);

  // TODO <---- probabilities for placement 
  // if roomCount = 2... 3... 4... 
  addRoom(-7 - fxrand() * 5, 5 + fxrand() * maxHeight, 7 + fxrand() * 5);
  addRoom(7 + fxrand() * 5, 10 + fxrand() * maxHeight, 7 + fxrand() * 5);

  return { figures, features };
};

export { genererFigures };
