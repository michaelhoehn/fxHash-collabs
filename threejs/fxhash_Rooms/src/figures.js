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

  // Add the box

  figures.push({
    geometry: {
      type: "BoxGeometry", // Type of geometry
      args: [
        // Arguments relevant to the geometry (check THREE API)
        fxrand() * u, // Cube width
        fxrand() * u, // Cube height
        fxrand() * u, // Cube depth
      ],
    },

    pos: {
      // Position
      x: 0 * u,
      y: -0.25 * u,
      z: -1.5 * u,
    },
    rot: {
      // Rotation
      x: 0,
      y: 0,
      z: 0,
    },
    name: "box",
    lines: true, // Display color segments (like wireframe, but faces not triangles)
    hatch: true, // Fill with white texture
    full: false, // Fill with color texture (in the anaverse, red and cyan)
  });

  //sphere
  figures.push({
    geometry: {
      type: "SphereGeometry", // Type of geometry
      args: [
        // Arguments relevant to the geometry (check THREE API)
        0.5 * u,
        32 * u,
        32 * u,
      ],
    },

    pos: {
      // Position
      x: 0 * u,
      y: 0 * u,
      z: 0 * u,
    },
    rot: {
      // Rotation
      x: 0,
      y: 0,
      z: 0,
    },
    name: "sphere",
    lines: true, // Display color segments (like wireframe, but faces not triangles)
    hatch: true, // Fill with white texture
    full: false, // Fill with color texture (in the anaverse, red and cyan)
  });

  //plane
  figures.push({
    geometry: {
      type: "PlaneGeometry", // Type of geometry
      args: [
        // Arguments relevant to the geometry (check THREE API)
        100,
        100,
      ],
    },
    //0, -0.25, -1.5
    pos: {
      // Position
      x: 0,
      y: 0,
      z: 0,
    },
    rot: {
      // Rotation
      x: -Math.PI * 0.5,
      y: 0,
      z: 0,
    },
    name: "plane",
    lines: true, // Display color segments (like wireframe, but faces not triangles)
    hatch: true, // Fill with white texture
    full: false, // Fill with color texture (in the anaverse, red and cyan)
  });

  return { figures, features };
};

export { genererFigures };
