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
  const u = 1;

  // The floor generator yields a "position" array of points which
  // are a simple polygon

  function floorGenerator() {
    let resolution = Math.floor(4 + fxrand() * 11);
    let stepSize = 1 + fxrand() * 4;
    let radius = Math.floor(2 + fxrand() * 5);
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
      var height = 2 + fxrand() * 5;

      // give 20% chances per wall that there could be a door
      var door = fxrand() < 0.2;

      // place the beams coordinates;
      for (let j = 0; j < dist * 10; j++) {
        var point = interpolate(a, b, j / (dist * 10));
        point.height = height; // + fxrand() / 2
        point.doorstep = 0;
        if (door & (j > dist * 10 * 0.3) && j < dist * 10 * 0.7) {
          point.height = height * 0.2;  // + fxrand() / 2
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
    var height = 2 + fxrand() * 5;
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

    // "create" the vertical column members to extend through the ground plane
    figures.push({
      geometry: { type: "BoxGeometry", args: [0.1, 20, 0.1] },
      pos: {
        // Anaglypic Question
        // Can we add a column that runs from each position of the original room polyline down through the ground plane? 
        // Position for each beam should be the position of each splinePt used to create the polygon from the floor generator
        x: px * u, 
        y: py * u - 20/2, // <---- Arbitrary column depth should match the column height and should pass through the ground plane
        z: pz * u,
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
      name: "column",
      lines: true, // Display color segments (like wireframe, but faces not triangles)
      hatch: true, // Fill with white texture
      full: false, // Fill with color texture (in the anaverse, red and cyan)
    });
  }

  // Anaglyphic Question - Can we add a single ground plane? I can't seem to get this working
  //
  // // "create" the ground plane to unite all rooms
  // figures.push({
  //   geometry: {
  //     type: "PlaneGeometry",
  //     args: [
  //       50 * u,
  //       50 * u,
  //     ],
  //   },
  //   pos: {
  //     x: 0,
  //     y: -5,
  //     z: 0,
  //   },
  //   rot: {
  //     x: -Math.PI * 0.5,
  //     y: 0,
  //     z: 0,
  //   },
  //   name: "plane",
  //   lines: true, // Display color segments (like wireframe, but faces not triangles)
  //   hatch: true, // Fill with white texture
  //   full: false, // Fill with color texture (in the anaverse, red and cyan)
  // });

  // add the rooms <----------- This can be varied to allow for more rooms
  // always have one at 0,0,0 the use probabilities to determine how many rooms can be added
  addRoom(0, 0, 0);
  addRoom(-7 - fxrand() * 5, 5 + fxrand() * 5, 7 + fxrand() * 5);
  addRoom(7 + fxrand() * 5, 10 + fxrand() * 5, 7 + fxrand() * 5);

  return { figures, features };
};

export { genererFigures };
