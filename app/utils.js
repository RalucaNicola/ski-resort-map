
define([], function () {
  const vertices = [];
  const random = new Math.seedrandom("mammoth");

  function deviateCoord(min, max, count, index) {
    debugger;
    const step = (max - min) / count;
    const coord = min + index * step;
    if (0 < index && index < count) {
      const dev = step * 0.9;
      return coord - dev / 2 + random() * dev;
    } else {
      return coord;
    }
  }

  return {
    getRandomPointsAsFlatVertexArray(xmin, xmax, ymin, ymax, step) {
      const countX = Math.floor((xmax - xmin) / step);
      const countY = Math.floor((ymax - ymin) / step);

      const devX = deviateCoord.bind(this, xmin, xmax, countX);
      const devY = deviateCoord.bind(this, ymin, ymax, countY);

      for (let x = 0; x <= countX; x++) {
        for (let y = 0; y <= countY; y++) {
          vertices.push(devX(x), devY(y));
        }
      }

      return vertices;
    },
    setZValues(layer, sampler, index) {
      if (index < 14000) {
        layer
          .queryFeatures({
            where: "1=1",
            outFields: ["OBJECTID"],
            returnGeometry: true,
            returnZ: true,
            num: 2000,
            start: index
          })
          .then(function (result) {

            const features = result.features;

            features.forEach(function (feature) {
              // const densifiedGeometry = geometryEngine.densify(feature.geometry, 0.001);
              // console.log(densifiedGeometry.paths[0], "\n ------");
              const zGeometry = sampler.queryElevation(feature.geometry);
              console.log(zGeometry.z);
              feature.geometry = zGeometry;
              // feature.geometry = densifiedGeometry;
              // console.log(densifiedGeometry);
            });
            layer
              .applyEdits({ updateFeatures: features })
              .then(function (results) {
                console.log(results);
                setZValues(layer, sampler, index + 2000);
              })
              .catch(console.error);
          });
      }
    }
  };
});
