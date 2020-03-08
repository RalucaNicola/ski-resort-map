define([], function () {
  const vertices = [];
  const random = new Math.seedrandom("mammoth");
  return {
    getRandomPointsAsFlatVertexArray(xmin, xmax, ymin, ymax, step) {
      for (let x = xmin; x <= xmax; x += step) {
        for (let y = ymin; y <= ymax; y += step) {
          const deviance = step - 50;
          const devianceX = -deviance + random() * deviance;
          const devianceY = -deviance + random() * deviance;
          vertices.push(x + devianceX, y + devianceY);
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
