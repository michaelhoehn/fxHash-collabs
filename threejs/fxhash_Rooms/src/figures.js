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

  // naming Adj + noun + of + adj + concept

  const adjArray = [
    "tall ",
    "thin ",
    "large ",
    "expansive ",
    "broad ",
    "deep ",
    "extended ",
    "sweeping ",
    "wide ",
    "boundless ",
    "endless ",
    "infinte ",
    "unlimited ",
    "capacious ",
    "roomy ",
    "spacious ",
    "big ",
    "bulky ",
    "generous ",
    "considerable ",
    "grand ",
    "great ",
    "handsome ",
    "oversized ",
    "cozy ",
    "comfortable ",
    "gigantic ",
    "huge ",
    "staggering ",
    "monumental ",
    "tremendous ",
    "stupendous ",
    "super ",
    "titanic ",
    "enormous ",
    "gargatuan ",
    "atomic ",
    "baby ",
    "microscopic ",
    "miniature ",
    "minute ",
    "teeny ",
    "pocket-sized ",
    "model ",
    "archetypical "
  ];

  const nounArray = [
    "room ",
    "habitat ",
    "quarters ",
    "domicile ",
    "abode ",
    "dwelling ",
    "habitation ",
    "hearth ",
    "home ",
    "gallery ",
    "casa ",
    "estate ",
    "hall ",
    "manor ",
    "hermitage ",
    "hovel ",
    "hut ",
    "hutch ",
    "shack ",
    "shelter ",
    "bungalow ",
    "casita ",
    "ranch ",
    "collective ",
    "place ",
    "lanai ",
    "piazza ",
    "stoop ",
    "portico ",
    "solarium ",
    "cloister ",
    "arcade ",
    "prototype "
  ];

  const consArray = [
    "of ",
    "de ",
    "van ",
    "von ",
    "di ",
    "de ",
    "z ",
    "for ",
    "voor ",
    "pour ",
    "zum ",
    "por ",
    "per ",
    "dla "
  ];

  const conceptArray = [
    "expanse",
    "space",
    "architecture",
    "viewing",
    "habitation",
    "dwelling",
    "loitering",
    "lollygagging",
    "enjoyment",
    "pleasure",
    "form",
    "cohabitation",
    "occupation",
    "possession",
    "valuables",
    "treasures",
    "prosperity",
    "acquisition",
    "property",
    "real estate",
    "collection",
    "fortune",
    "assets",
    "things",
    "opulence",
    "riches",
    "substance",
    "wealth",
    "worth",
    "abundance",
    "affluence",
    "success",
    "void"
  ];

  var structurename = "";

  var adj1Index = Math.floor(fxrand() * adjArray.length);
  var adj2Index = Math.floor(fxrand() * adjArray.length);
  var nounIndex = Math.floor(fxrand() * nounArray.length);
  var consIndex = Math.floor(fxrand() * consArray.length);
  var conceptIndex = Math.floor(fxrand() * conceptArray.length);

  if (adj1Index == adj2Index) {
    // single chance to reroll adj
    adj2Index = Math.floor(fxrand() * adjArray.length);
  }

  const adj1 = adjArray[adj1Index];
  const noun = nounArray[nounIndex];
  const cons = consArray[consIndex];
  const adj2 = adjArray[adj2Index];
  const concept = conceptArray[conceptIndex];

  structurename = adj1 + noun + cons + adj2 + concept

  features.Name = "STILTED " + structurename.toUpperCase();

  // Here the variable u is the unit used to scale
  var u = 1;

  if (fxrand() < 0.05) {
    u += fxrand() * 3;
    features.Explosion = true;
  } else {
    features.Explosion = false;
  }

  // The floor generator yields a "position" array of points which
  // are a simple polygon

  function floorGenerator() {
    let resolution = 4 + Math.floor(fxrand() * 15);
    let stepSize = 1 + fxrand() * 10;
    let radius = 5 + Math.floor(fxrand() * 20);
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

  // three helpers to build the walls

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

  features.Fullism = fxrand() < 0.25;

  function addRoom(px, py, pz) {
    // generate a polygon
    const roomPos = floorGenerator();

    var roomArr = [];
    roomPos.forEach((d) => {
      roomArr.push({ x: d.drawArgs[0], y: d.drawArgs[1] });
    });

    var wallfull = false;

    if (features.Fullism) {
      if (fxrand() < 0.4) {
        wallfull = true;
        features["Room " + roomCount + " is"] = "full";
      }
    }

    // create an array containing the walls
    const midpoints = [];

    //
    // In the anaverse, boxes are perf cheap (because they're instanced)
    // So creating walls of beams seems to be a cheap way to create
    // interesting textures
    //

    // place the wall beams between two points of each polygon

    var roomChaos = fxrand() < 0.2;

    for (let i = 0; i < roomPos.length - 1; i++) {
      var a = { x: roomPos[i].drawArgs[0], y: roomPos[i].drawArgs[1] };
      var b = { x: roomPos[i + 1].drawArgs[0], y: roomPos[i + 1].drawArgs[1] };

      var dist = getDistance(a, b);
      var height = 3.5 + fxrand() * 15;

      // give 20% chances per wall that there could be a door
      var door = fxrand() < 0.2;

      // if door, add a little chaos on top?

      // place the beams coordinates;
      for (let j = 0; j < dist * 10; j++) {
        var point = interpolate(a, b, j / (dist * 10));
        point.height = height; // + fxrand() / 2
        point.doorstep = 0;
        if (door & (j > dist * 10 * 0.3) && j < dist * 10 * 0.7) {
          point.height = height * 0.2; // + fxrand() / 2

          point.doorstep = height * 0.8;
        }
        if (roomChaos) {
          point.height += fxrand() / 3;
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
        hatch: !wallfull, // Fill with white texture
        full: wallfull, // Fill with color texture (in the anaverse, red and cyan)
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
          bevelSegments: 1,
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
        z: 1,
      },
      name: "floor",
      lines: true, // Display color segments (like wireframe, but faces not triangles)
      hatch: true, // Fill with white texture
      full: false, // Fill with color texture (in the anaverse, red and cyan)
      uncentered: true,
    });

    // "create" the actual geometry for the wall columns
    roomPos.forEach((rP) => {
      figures.push({
        geometry: { type: "BoxGeometry", args: [0.25, 100, 0.25] }, // <---- TODO Adjust the max height of the columns to match the max height of the floors
        pos: {
          // Position
          x: (rP.drawArgs[0] + px) * u,
          y: (py - 50) * u, // <---- TODO same thing here
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
      y: -22 + Math.floor(fxrand() * 15),
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

  const numRooms = fxrand();
  const maxheight = 50;
  const maxWidth = 30;
  //let randomY = Math.floor((fxrand() * maxheight) / 2) + 2;
  let roomCount = 1;

  // Always create a room at 0, 0, 0 (if higher than 0,the user gets stuck in the collider)
  addRoom(0, 0, 0);

  // Room Variations
  if (numRooms > 0.2) {
    let rm1X = Math.floor(fxrand() * maxWidth) + 5;
    let rm1Y = Math.floor(fxrand() * maxheight) + 2;
    let rm1Z = 0;
    addRoom(rm1X, rm1Y, rm1Z);
    roomCount += 1;
  }
  if (numRooms > 0.4) {
    let rm2X = 0;
    let rm2Y = Math.floor(fxrand() * maxheight) + 2;
    let rm2Z = Math.floor(fxrand() * maxWidth) + 5;
    addRoom(rm2X, rm2Y, rm2Z);
    roomCount += 1;
  }
  if (numRooms > 0.6) {
    let rm3X = -(Math.floor(fxrand() * maxWidth) + 5);
    let rm3Y = Math.floor(fxrand() * maxheight) + 2;
    let rm3Z = 0;
    addRoom(rm3X, rm3Y, rm3Z);
    roomCount += 1;
  }
  if (numRooms > 0.8) {
    let rm4X = 0;
    let rm4Y = Math.floor(fxrand() * maxheight) + 2;
    let rm4Z = -(Math.floor(fxrand() * maxWidth) + 5);
    addRoom(rm4X, rm4Y, rm4Z);
    roomCount += 1;
  }
  if (numRooms > 0.9) {
    let rm5X = Math.floor(fxrand() * 100 - 50);
    let rm5Y = Math.floor(fxrand() * maxheight);
    let rm5Z = Math.floor(fxrand() * 100 - 50);
    addRoom(rm5X, rm5Y, rm5Z);
    roomCount += 1;
  }

  features["Number of Rooms"] = roomCount;
  return { figures, features };
};

export { genererFigures };
