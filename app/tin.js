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

  const dif = 150;

  let minHeight = config.terrain.minHeight;
  let maxHeight = config.terrain.maxHeight;

  let vertices = utils.getRandomPointsAsFlatVertexArray(xmin, xmax, ymin, ymax, 200);

  const elevationLayer = new ElevationLayer({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
  });

  // add the boundary points
  vertices.push(xmin, ymin, xmin, ymax, xmax, ymin, xmax, ymax);

  function generateBorderVertices(number) {
    const dif = 148;
    let borderVertices = [
      [xmin - dif, ymin - dif],
      [xmin - dif, ymax + dif],
      [xmax + dif, ymax + dif],
      [xmax + dif, ymin - dif]
    ];
    for (let i = 1; i < number; i++) {
      const newVertices = [];
      for (let j = 0; j < borderVertices.length; j++) {
        const vertex1 = borderVertices[j];
        newVertices.push(vertex1);
        if (j === borderVertices.length - 1) {
          const vertex2 = borderVertices[0];
          const midVertex = [(vertex1[0] + vertex2[0]) / 2, (vertex1[1] + vertex2[1]) / 2];
          newVertices.push(midVertex);
          borderVertices = newVertices;
          j = borderVertices.length;
        } else {
          const vertex2 = borderVertices[j + 1];
          const midVertex = [(vertex1[0] + vertex2[0]) / 2, (vertex1[1] + vertex2[1]) / 2];
          newVertices.push(midVertex);
        }
      }
    }
    const borderVerticesFlatArray = [].concat.apply([], borderVertices);

    return borderVerticesFlatArray;
  }

  const borderVerts = generateBorderVertices(15);

  vertices = vertices.concat(borderVerts);
  vertices.push(xmin - dif, ymin - dif, xmin - dif, ymax + dif, xmax + dif, ymin - dif, xmax + dif, ymax + dif);

  const delaunay = new Delaunator(vertices);
  const triangles = delaunay.triangles;

  return {
    createGeometry: function () {
      return enhanceVerticesWithZValues(vertices)
        .then(function (verticesZ) {
          const length = verticesZ.length;

          verticesZ[length - 4][2] = 4000;
          verticesZ[length - 3][2] = 4000;
          verticesZ[length - 2][2] = 4000;
          verticesZ[length - 1][2] = 4000;

          const color = verticesZ.map(function (vertex) {
            return getColorFromHeight(vertex[2]);
          });

          const flatPosition = [].concat.apply([], verticesZ);
          const flatColor = [].concat.apply([], color);

          const meshComponent = new MeshComponent({
            faces: triangles,
            shading: "flat",
            material: new MeshMaterialMetallicRoughness({
              metallic: 0.5,
              roughness: 0.8
            })
          });

          const mesh = new Mesh({
            components: [meshComponent],
            vertexAttributes: {
              position: flatPosition,
              color: flatColor
            },
            spatialReference: SpatialReference.WebMercator
          });
          return mesh;

          // meshUtils.createElevationSampler(mesh).then(function(sampler) {
          //   setZValues(treesLayer, sampler, 0);
          // });
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
          if (minHeight > z) {
            minHeight = z;
          }
          if (maxHeight < z) {
            maxHeight = z;
          }
          return [p[0], p[1], z];
        });
      })
      .catch(console.error);
  }

  function getColorFromHeight(height) {
    const startColor = new Color("#bfeaff");
    const endColor = new Color("#dbe9ff");
    let color = Color.blendColors(startColor, endColor, (height - minHeight) / (maxHeight - minHeight));
    return [color.r, color.g, color.b, 255];
  }
});
