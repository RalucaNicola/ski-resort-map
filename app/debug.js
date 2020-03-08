define([
  "esri/geometry/Point",
  "esri/Graphic",
  "esri/geometry/SpatialReference"
], function (
  Point,
  Graphic,
  SpatialReference
) {
  return {
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
  }
});
