// random seed library: https://github.com/davidbau/seedrandom
// best tree color so far: #4BB5BF

require([
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "esri/Map",
  "esri/Color",
  "esri/views/SceneView",
  "esri/request",
  "esri/Graphic",
  "esri/geometry/Polygon",
  "esri/geometry/Point",
  "esri/geometry/Multipoint",
  "esri/geometry/Extent",
  "esri/geometry/Mesh",
  "esri/geometry/support/MeshComponent",
  "esri/geometry/Polyline",
  "esri/geometry/support/meshUtils",
  "esri/geometry/SpatialReference",
  "esri/core/promiseUtils",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ElevationLayer",
  "esri/config",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/widgets/Editor",
  "esri/layers/BaseElevationLayer",
  "esri/geometry/geometryEngine",
  "esri/geometry/support/meshUtils",
  "esri/layers/support/LabelClass",
  "esri/geometry/support/MeshMaterialMetallicRoughness",
  "lib/Delaunator",
  "lib/utils",
  "lib/font",
  "lib/fontmesh"
], function (
  OAuthInfo,
  esriId,
  Map,
  Color,
  SceneView,
  esriRequest,
  Graphic,
  Polygon,
  Point,
  Multipoint,
  Extent,
  Mesh,
  MeshComponent,
  Polyline,
  meshUtils,
  SpatialReference,
  promiseUtils,
  GraphicsLayer,
  FeatureLayer,
  ElevationLayer,
  esriConfig,
  SketchViewModel,
  Editor,
  BaseElevationLayer,
  geometryEngine,
  meshUtils,
  LabelClass,
  MeshMaterialMetallicRoughness,
  Delaunator,
  utils,
  font,
  fontmesh
) {
  const info = new OAuthInfo({
    // Swap this ID out with registered application ID
    appId: "iLylggsE3toQeCGV",
    // Uncomment the next line and update if using your own portal
    portalUrl: "https://jsapi.maps.arcgis.com/",
    // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
    // authNamespace: "portal_oauth_inline",
    popup: false
  });

  esriId.registerOAuthInfos([info]);

  const map = new Map({
    ground: {
      opacity: 0
    }
  });
  // create elevation layer for sampling height info
  const elevationLayer = new ElevationLayer({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
  });
  //esriConfig.portalUrl = "https://jsapi.maps.arcgis.com/";



  const xmin = -13253776.1039;
  const xmax = -13245135.78;
  const ymin = 4524162.1421;
  const ymax = 4530795.2634;

  const exaggerationFactor = 2;

  var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
    // Add an exaggeration property whose value will be used
    // to multiply the elevations at each tile by a specified
    // factor. In this case terrain will render 100x the actual elevation.

    properties: {
      exaggeration: exaggerationFactor
    },

    // The load() method is called when the layer is added to the map
    // prior to it being rendered in the view.

    load: function () {
      this._elevation = elevationLayer;

      // wait for the elevation layer to load before resolving load()
      this.addResolvingPromise(this._elevation.load());
    },

    // Fetches the tile(s) visible in the view
    fetchTile: function (level, row, col, options) {
      // calls fetchTile() on the elevationlayer for the tiles
      // visible in the view
      return this._elevation.fetchTile(level, row, col, options).then(
        function (data) {
          var exaggeration = this.exaggeration;

          // `data` is an object that contains the
          // the width of the tile in pixels,
          // the height of the tile in pixels,
          // and the values of each pixel
          for (var i = 0; i < data.values.length; i++) {
            // each value represents an elevation sample for the
            // given pixel position in the tile. Multiply this
            // by the exaggeration value
            data.values[i] = data.values[i] * exaggeration;
          }

          return data;
        }.bind(this)
      );
    }
  });

  let maxHeight = 0;

  let minHeight = 4000;

  const extent = {
    xmin,
    xmax,
    ymin,
    ymax,
    spatialReference: SpatialReference.WebMercator
  };

  map.when(function () {
    map.ground.layers = [new ExaggeratedElevationLayer()];
    var trees = map.allLayers.getItemAt(3);
    view.whenLayerView(trees).then(function (lyrView) {
      lyrView.maximumNumberOfFeatures = 100000;
    });

    const waterLayer = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/mammoth_lakes/FeatureServer",
      renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [
            {
              type: "water",
              color: [237, 254, 255],
              waveStrength: "moderate",
              waterbodySize: "large"
            }
          ]
        }
      }
    });
    map.add(waterLayer);
    waterLayer.labelingInfo = waterLayer.labelingInfo = [
      new LabelClass({
        labelExpressionInfo: { expression: "$feature.Name" },
        labelPlacement: "above-center",
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [255, 255, 255]
              },
              font: {
                size: 11,
                family: "sans-serif"
              },
              halo: {
                size: 2,
                color: [89, 170, 186, 0.5]
              }
            }
          ],
          verticalOffset: {
            screenLength: 20,
            maxWorldLength: 20000,
            minWorldLength: 50
          },
          callout: {
            type: "line",
            size: 2,
            color: [255, 255, 255],
            border: {
              color: [89, 170, 186]
            }
          }
        }
      })
    ];
  });

  const skiLiftsLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/ski_lifts_Mammoth/FeatureServer/0",
    outFields: ["OBJECTID"],
    elevationInfo: {
      mode: "absolute-height",
      offset: 25
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "line-3d",
        symbolLayers: [
          {
            type: "path",
            profile: "quad",
            material: { color: [100, 100, 100, 1] },
            width: 25,
            height: 5,
            join: "miter",
            cap: "butt",
            anchor: "bottom",
            profileRotation: "all"
          }
        ]
      }
    },
    labelingInfo: [
      new LabelClass({
        labelExpressionInfo: { expression: `"\ue654"` },
        labelPlacement: "above-center",
        where: "Status = 1",
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [54, 173, 136, 1]
              },
              halo: {
                size: 3,
                color: [255, 255, 255, 0.8]
              },
              font: {
                size: 15,
                family: "CalciteWebCoreIcons"
              }
            }
          ]
        }
      }),
      new LabelClass({
        labelExpressionInfo: { expression: `"\ue647"` },
        labelPlacement: "above-center",
        where: "Status = 0",
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [240, 43, 86, 1]
              },
              halo: {
                size: 3,
                color: [255, 255, 255, 0.8]
              },
              font: {
                size: 15,
                family: "CalciteWebCoreIcons"
              }
            }
          ]
        }
      })
    ]
  });

  const skiLiftPillarLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "absolute-height",
      offset: 26
    }
  });
  map.add(skiLiftPillarLayer);
  const pillarSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "object",
        resource: { primitive: "cylinder" },
        material: { color: [100, 100, 100, 1] },
        anchor: "top",
        depth: 3,
        height: 100,
        width: 3
      }
    ]
  };
  skiLiftsLayer
    .queryFeatures({
      where: "1=1",
      returnZ: true,
      returnGeometry: true
    })
    .then(function (results) {
      console.log("Feature query: ", results);
      results.features.forEach(function (feature) {
        feature.geometry.paths.forEach(function (path) {
          path.forEach(function (point) {
            const pillarGeometry = new Point({
              x: point[0],
              y: point[1],
              z: point[2],
              spatialReference: feature.geometry.spatialReference
            });
            const graphic = new Graphic({
              geometry: pillarGeometry,
              symbol: pillarSymbol
            });
            skiLiftPillarLayer.add(graphic);
          });
        });
      });
    });

  const hutSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0] },
        size: 30,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0
        }
      },
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: 1,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hotel.svg"
        },
        material: { color: [100, 100, 100] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: 1.2,
          y: 0.5
        }
      },
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Restaurant.svg"
        },
        material: { color: [100, 100, 100] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0.5
        }
      },

      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: -1,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hospital.svg"
        },
        material: { color: [230, 87, 97] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: -1,
          y: 0.5
        }
      }
    ],
    verticalOffset: {
      screenLength: 20,
      maxWorldLength: 20000,
      minWorldLength: 50
    },
    callout: {
      type: "line",
      size: 1,
      color: [50, 50, 50]
    }
  };
  const restaurantSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0] },
        size: 30,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0
        }
      },
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: 0.5,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Restaurant.svg"
        },
        material: { color: [100, 100, 100] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: 0.5,
          y: 0.5
        }
      },
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: -0.5,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hospital.svg"
        },
        material: { color: [230, 87, 97] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: -0.5,
          y: 0.5
        }
      }
    ],
    verticalOffset: {
      screenLength: 20,
      maxWorldLength: 20000,
      minWorldLength: 50
    },
    callout: {
      type: "line",
      size: 1,
      color: [50, 50, 50]
    }
  };
  const barSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          primitive: "square"
        },
        material: { color: [255, 255, 255, 0.7] },
        size: 20,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: { href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Coffee.svg" },
        material: { color: [100, 100, 100] },
        size: 15,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0.5
        }
      }
    ],
    verticalOffset: {
      screenLength: 20,
      maxWorldLength: 20000,
      minWorldLength: 50
    },
    callout: {
      type: "line",
      size: 1,
      color: [50, 50, 50]
    }
  };

  const pointsOfInterestLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/interest_points_mammoth/FeatureServer",
    screenSizePerspectiveEnabled: false,
    renderer: {
      type: "unique-value",
      field: "Type",
      defaultSymbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "icon",
            resource: { primitive: "circle" },
            material: { color: [100, 100, 100, 1] },
            size: 1
          }
        ],
        verticalOffset: {
          screenLength: 20,
          maxWorldLength: 20000,
          minWorldLength: 50
        },
        callout: {
          type: "line",
          size: 1,
          color: [50, 50, 50]
        }
      },
      uniqueValueInfos: [
        {
          value: "Hut",
          symbol: hutSymbol,
          label: "label for the legend"
        },
        {
          value: "Restaurant",
          symbol: restaurantSymbol,
          label: "label for the legend"
        },
        {
          value: "Bar",
          symbol: barSymbol
        }
      ]
    },
    labelingInfo: [
      new LabelClass({
        labelExpressionInfo: { expression: "$feature.Name" },
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [50, 50, 50]
              },
              font: {
                size: 10,
                family: "sans-serif"
              },
              halo: {
                size: 2,
                color: [255, 255, 255, 0.7]
              }
            }
          ]
        }
      })
    ]
  });

  map.add(pointsOfInterestLayer);

  const treesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/trees_mammoth/FeatureServer",
    elevationInfo: {
      mode: "absolute-height"
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "object",
            resource: { primitive: "cone" },
            material: { color: "#4BB5BF" },
            depth: 15,
            height: 20,
            width: 5
          }
        ]
      },
      visualVariables: [
        {
          type: "size",
          field: "HEIGHT",
          axis: "height"
        },
        {
          type: "rotation",
          field: "Rotate",
          rotationType: "geographic"
        }
      ]
    }
  });

  map.add(treesLayer);

  lineSize = 1;

  const skiTrailsLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/ski_trails_mammoth/FeatureServer",
    elevationInfo: {
      mode: "absolute-height",
      offset: 5
    },
    renderer: {
      type: "unique-value",
      field: "Type",
      defaultSymbol: {
        type: "line-3d",
        symbolLayers: [
          {
            type: "line",
            material: { color: [235, 64, 52, 1] },
            size: lineSize
          },
          {
            type: "line",
            material: { color: [235, 64, 52, 0.2] },
            size: 6
          }
        ]
      },
      uniqueValueInfos: [
        {
          value: "5",
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "line",
                material: { color: [255, 143, 46, 1] },
                size: lineSize
              },
              {
                type: "line",
                material: { color: [255, 143, 46, 0.2] },
                size: 6
              }
            ]
          },
          label: "Something else"
        },
        {
          value: "4",
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "line",
                material: { color: [100, 100, 100, 1] },
                size: lineSize
              },
              {
                type: "line",
                material: { color: [100, 100, 100, 0.2] },
                size: 6
              }
            ]
          },
          label: "Very difficult"
        },
        {
          value: "3",
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "line",
                material: { color: [235, 64, 52, 1] },
                size: lineSize
              },
              {
                type: "line",
                material: { color: [235, 64, 52, 0.2] },
                size: 6
              }
            ]
          },
          label: "Difficult"
        },
        {
          value: "2",
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "line",
                material: { color: [52, 134, 209, 1] },
                size: lineSize
              },
              {
                type: "line",
                material: { color: [52, 134, 209, 0.2] },
                size: 6
              }
            ]
          },
          label: "Medium"
        },
        {
          value: "1",
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "line",
                material: { color: [141, 199, 97, 1] },
                size: lineSize
              },
              {
                type: "line",
                material: { color: [141, 199, 97, 0.2] },
                size: 6
              }
            ]
          },
          label: "Easy"
        }
      ]
    }
  });
  map.add(skiTrailsLayer);


  var view = new SceneView({
    container: "viewDiv",
    map: map,
    alphaCompositingEnabled: true,
    environment: {
      lighting: {
        directShadowsEnabled: false
      },
      background: {
        type: "color",
        color: [0, 0, 0, 0]
      },
      starsEnabled: false,
      atmosphereEnabled: false
    },
    camera: { "position": { "spatialReference": { "latestWkid": 3857, "wkid": 102100 }, "x": -13239947.23509459, "y": 4537716.550325148, "z": 9144.733118887329 }, "heading": 222.1099999996886, "tilt": 72.64999999988527 },
    spatialReference: SpatialReference.WebMercator,
    viewingMode: "local",
    qualityProfile: "high",
    clippingArea: extent
  });
  view.ui.add("toggle-snippet", "top-left");

  window.view = view;

  let vertices = utils.getRandomPointsAsFlatVertexArray(xmin, xmax, ymin, ymax, 200);

  // // display the random generated points - only for debugging
  // const graphics = utils.displayGraphicsFromFlatVertexArray(vertices);
  // view.graphics.addMany(graphics);
  const dif = 150;
  // add the boundary points
  vertices.push(xmin, ymin, xmin, ymax, xmax, ymin, xmax, ymax);
  //vertices.push(xmin - 2, ymin - 2, xmin - 2, ymax + 2, xmax + 2, ymin - 2, xmax + 2, ymax + 2);

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

    // const debugLayer = new GraphicsLayer({
    //   title: "Points"
    // });
    // map.add(debugLayer);
    // const graphics = utils.displayGraphicsFromFlatVertexArray(borderVerticesFlatArray);
    // debugLayer.addMany(graphics);
    return borderVerticesFlatArray;
  }

  borderVerts = generateBorderVertices(10);

  vertices = vertices.concat(borderVerts);
  vertices.push(xmin - dif, ymin - dif, xmin - dif, ymax + dif, xmax + dif, ymin - dif, xmax + dif, ymax + dif);

  const delaunay = new Delaunator(vertices);
  const triangles = delaunay.triangles;

  enhanceVerticesWithZValues(vertices, exaggerationFactor)
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
      console.log(minHeight, maxHeight);

      const meshComponent = new MeshComponent({
        faces: triangles,
        shading: "flat",
        material: new MeshMaterialMetallicRoughness({
          metallic: 0.4,
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
      const graphic = new Graphic({
        geometry: mesh,
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{ type: "fill" }]
        }
      });

      view.graphics.add(graphic);

      // meshUtils.createElevationSampler(mesh).then(function(sampler) {
      //   setZValues(treesLayer, sampler, 0);
      // });
    })
    .catch(console.error);

  function setZValues(layer, sampler, index) {
    console.log(index);
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
          //console.log("Trees", result);

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
  map.add(skiLiftsLayer);
  function enhanceVerticesWithZValues(vertices, exaggerationFactor) {
    const points = [];

    for (let i = 0; i < vertices.length; i += 2) {
      points.push([vertices[i], vertices[i + 1]]);
    }

    const multipoint = new Multipoint({ points: points, spatialReference: SpatialReference.WebMercator });

    return elevationLayer
      .queryElevation(multipoint, { demResolution: "finest-contiguous" })
      .then(function (result) {
        return result.geometry.points.map(function (p) {
          const z = p[2] * exaggerationFactor;
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
    const endColor = new Color("#e8f1ff");
    let color = Color.blendColors(startColor, endColor, (height - minHeight) / (maxHeight - minHeight));
    return [color.r, color.g, color.b, 255];
  }

  const modelsLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/3d_models_mammoth/FeatureServer",
    renderer: {
      type: "unique-value",
      field: "name",
      uniqueValueInfos: [
        {
          value: "skier",
          symbol: {
            type: "point-3d",
            symbolLayers: [
              {
                type: "object",
                resource: { href: "./assets/skier/model.gltf" },
                tilt: 60
              }
            ]
          },
          label: "label for the legend"
        },
        {
          value: "chalet",
          symbol: {
            type: "point-3d",
            symbolLayers: [
              {
                type: "object",
                resource: { href: "./assets/chalet/Chalet.gltf" },
                height: 200,
                heading: 0
                // material: {
                //   color: [155, 155, 155]
                // }
              }
            ]
          },
          label: "label for the legend"
        }
      ],
      visualVariables: [
        {
          type: "size",
          field: "Model_size",
          axis: "height",
          valueUnit: "meters"
        },
        {
          type: "rotation",
          field: "Rotation",
          rotationType: "geographic"
        }
      ]
    }
  });
  map.add(modelsLayer);

  const featureEditor = new Editor({
    view: view
  });

  // view.ui.add(featureEditor, "top-right");

  var graphic = null;

  font
    .create("./assets/font.ttf")
    .then(font => {
      const origin = new Point({
        latitude: 37.654744,
        longitude: -119.018839,
        z: 4400,
        spatialReference: { wkid: 4326 }
      });
      const text = "M A M M O T H";

      const fullMesh = fontmesh.fromString(font, text, origin, { size: 800, alignment: { x: "center" } });

      function makeGraphic(s, vangle) {
        if (vangle == null) {
          vangle = 90;
        }

        if (graphic) {
          view.graphics.remove(graphic);
        }

        const mesh =
          s === text ? fullMesh : fontmesh.fromString(font, s, origin, { size: 800, alignment: { x: "center" } });

        // Rotate so it stands up
        mesh.rotate(vangle, 0, 180, { origin });

        graphic = new Graphic({
          geometry: mesh,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: { color: "#ebfdff" }
              }
            ]
          }
        });

        view.graphics.add(graphic);
      }

      makeGraphic(text);
    })
    .catch(err => {
      console.error(err);
    });

  let itSnows = false;
  document.getElementById("snow");
  document.getElementById("startSnow").addEventListener("click", function () {
    snowContainer.style.display = itSnows ? "none" : "inherit";
    // if (itSnows) {
    //   musicController.pause();
    // } else {
    //   musicController.play();
    // }
    itSnows = !itSnows;
  });

  const mapExtent = new Extent(extent);
  const center = mapExtent.center;

  const planeGraphicsLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "absolute-height"
    }
  });
  map.add(planeGraphicsLayer);
  var radius = 3000;
  var duration = 20000;
  const planeGraphic = new Graphic({
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: { href: "./assets/heli/small-airplane-v3.gltf" },
          height: 250,
          heading: 90,
          roll: 15,
          tilt: 0
        }
      ]
    },
    geometry: new Point({
      x: center.x,
      y: center.y,
      z: 7000,
      spatialReference: SpatialReference.WebMercator
    }),
    visible: false,
  });

  planeGraphicsLayer.add(planeGraphic);

  var planeGeometry = planeGraphic.geometry;
  var planeSymbolLayer = planeGraphic.symbol.symbolLayers.getItemAt(0);
  const positionAnimation = anime({
    targets: planeGeometry,
    x: {
      value: "+=" + radius,
      easing: function (el, i, total) {
        return function (t) {
          return Math.sin(t * 2 * Math.PI);
        }
      }
    },
    y: {
      value: "+=" + radius,
      easing: function (el, i, total) {
        return function (t) {
          return Math.cos(t * 2 * Math.PI);
        }
      }
    },
    duration,
    autoplay: false,
    loop: true,
    update: function () {
      planeGraphic.geometry = planeGeometry.clone();
    }
  });

  const headingAnimation = anime({
    targets: planeSymbolLayer,
    heading: "+=360",
    duration,
    easing: "linear",
    autoplay: false,
    loop: true,
    update: function () {
      planeGraphic.symbol = planeGraphic.symbol.clone();
      planeGraphic.symbol.symbolLayers = [planeSymbolLayer];
    }
  });

  let planeFlying = false;

  document.getElementById("flyPlane").addEventListener("click", function () {

    view.goTo({ "position": { "spatialReference": { "latestWkid": 3857, "wkid": 102100 }, "x": -13242114.57981226, "y": 4536875.754788172, "z": 8172.549514131692 }, "heading": 222.13771837133106, "tilt": 74.79683387995716 });

    if (planeFlying) {
      positionAnimation.pause();
      headingAnimation.pause();
    } else {
      planeGraphic.visible = true;
      positionAnimation.play();
      headingAnimation.play();
    }
    planeFlying = !planeFlying;
  });

  // const symbol = {
  //   type: "mesh-3d",
  //   symbolLayers: [
  //     {
  //       type: "fill",
  //       material: { color: "white" }
  //     }
  //   ]
  // };

  // const videoLocation = new Point({
  //   x: -119.031963,
  //   y: 37.629232,
  //   z: 6650,
  //   spatialReference: { wkid: 4326 }
  // });

  // const movie = document.createElement("video");
  // movie.src = "./assets/arno.mp4";
  // //movie.crossOrigin = "anonymous";
  // movie.autoplay = true;
  // movie.loop = true;
  // movie.muted = true;
  // // movie.preload = "auto";
  // document.body.appendChild(movie);

  // const geometryScreen = Mesh.createBox(videoLocation, {
  //   size: {
  //     height: 90,
  //     width: 90,
  //     depth: 20
  //   },
  //   imageFace: "south",
  //   material: {
  //     colorTexture: {
  //       data: movie
  //     }
  //   }
  // });
  // geometryScreen.offset(0, 0, 60);
  // geometryScreen.rotate(0, 0, 330);

  // const geometryTrunk = Mesh.createBox(videoLocation, {
  //   size: { width: 10, depth: 10, height: 60 },
  //   material: { color: "white" }
  // });

  // const geometry = meshUtils.merge([geometryTrunk, geometryScreen]);

  // view.graphics.add(new Graphic(geometry, symbol));
});
