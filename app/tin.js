define([
  "app/config",
  "app/utils",
  "esri/layers/ElevationLayer",
  "esri/geometry/Multipoint",
  "esri/geometry/support/MeshMaterialMetallicRoughness",
  "esri/geometry/Mesh",
  "esri/geometry/support/MeshComponent",
  "esri/geometry/SpatialReference",
  "esri/Color",
  "lib/delaunator"
], function (
  config,
  utils,
  ElevationLayer,
  Multipoint,
  MeshMaterialMetallicRoughness,
  Mesh,
  MeshComponent,
  SpatialReference,
  Color,
  Delaunator
) {

  const xmin = config.extent.xmin;
  const ymin = config.extent.ymin;
  const xmax = config.extent.xmax;
  const ymax = config.extent.ymax;

  let vertices = utils.getRandomPointsAsFlatVertexArray(xmin, xmax, ymin, ymax, 200);

  const elevationLayer = new ElevationLayer({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
  });

  const delaunay = new Delaunator(vertices);
  const triangles = delaunay.triangles;

  return {
    createGeometry: function () {
      return enhanceVerticesWithZValues(vertices)
        .then(function (verticesZ) {

          // Mesh component for terrain
          const terrain = new MeshComponent({
            faces: triangles.reverse(),
            shading: "flat",
            material: new MeshMaterialMetallicRoughness({
              metallic: 0.5,
              roughness: 0.8,
              doubleSided: false
            })
          });

          // Add another mesh component by duplicating the hull and placing it at 4000m
          var hull = delaunay.hull;
          var lengthWithoutWall = verticesZ.length;
          var wallTriangles = [];

          for (let i = 0; i < hull.length; i++) {
            const vIdx1 = hull[i];
            const vIdx2 = hull[(i + 1) % hull.length];

            const vIdx3 = lengthWithoutWall + i;
            const vIdx4 = lengthWithoutWall + (i + 1) % hull.length;

            // Add new wall vertex
            const bottomVertex = [].concat.apply([], verticesZ[vIdx1]);
            bottomVertex[2] = 4000;
            verticesZ.push(bottomVertex);

            wallTriangles.push(vIdx2, vIdx3, vIdx1, vIdx4, vIdx3, vIdx2);
          }

          const vertexColor = verticesZ.map(function (vertex) {
            const color = getColorFromHeight(vertex[2]);
            return [color.r, color.g, color.b, 255];
          });

          const flatPosition = [].concat.apply([], verticesZ);
          const flatColor = [].concat.apply([], vertexColor);

          const wall = new MeshComponent({
            faces: wallTriangles,
            shading: "flat",
            material: new MeshMaterialMetallicRoughness({
              emissiveColor: "#2f5870",
              metallic: 0.5,
              roughness: 0.8,
              doubleSided: false
            })
          });

          const mesh = new Mesh({
            components: [terrain, wall],
            vertexAttributes: {
              position: flatPosition,
              color: flatColor
            },
            spatialReference: SpatialReference.WebMercator
          });
          return mesh;
        })
        .catch(console.error);
    }
  }

  function enhanceVerticesWithZValues(vertices) {
    const points = [];

    for (let i = 0; i < vertices.length; i += 2) {
      points.push([vertices[i], vertices[i + 1]]);
    }

    const multipoint = new Multipoint({ points: points, spatialReference: SpatialReference.WebMercator });

    return elevationLayer
      .queryElevation(multipoint, { demResolution: "finest-contiguous" })
      .then(function (result) {
        return result.geometry.points.map(function (p) {
          const z = p[2] * config.terrain.exaggerationFactor;
          return [p[0], p[1], z];
        });
      })
      .catch(console.error);
  }

  function getColorFromHeight(value) {

    const stops = [
      { value: 4000, color: new Color("#fff") },
      { value: 5000, color: new Color("#d1eeff") },
      { value: 6500, color: new Color("#dbe7ff") }
    ];
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];

      if (value < stop.value) {
        if (i === 0) {
          return stop.color;
        }

        const prev = stops[i - 1];

        const weight = (value - prev.value) / (stop.value - prev.value);
        return Color.blendColors(prev.color, stop.color, weight);
      }
    }

    return stops[stops.length - 1].color;
  }
});
