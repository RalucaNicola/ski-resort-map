define(["esri/geometry/Point", "esri/Graphic", "esri/geometry/SpatialReference"], function(
  Point,
  Graphic,
  SpatialReference
) {
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
          // vertices.push(x, y);
        }
      }
      return vertices;
    },
    displayGraphicsFromFlatVertexArray(vertices) {
      const graphics = [];
      const pointSymbol = {
        type: "point-3d",
        symbolLayers: [
          {
            type: "icon",
            resource: { primitive: "circle" },
            material: { color: [255, 0, 0, 0.8] },
            size: 5
          }
        ]
      };
      for (let i = 0; i < vertices.length; i += 2) {
        const graphic = new Graphic({
          symbol: pointSymbol,
          geometry: new Point({
            x: vertices[i],
            y: vertices[i + 1],
            z: 5000,
            spatialReference: SpatialReference.WebMercator
          })
        });
        graphics.push(graphic);
      }
      return graphics;
    }
  };
});
