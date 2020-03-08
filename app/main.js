define([
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "app/config",

  "esri/Map",
  "esri/geometry/SpatialReference",
  "app/tin",

  "esri/views/SceneView",

  "esri/Graphic",
  "esri/geometry/Polygon",
  "esri/geometry/Point",

  "esri/geometry/Extent",
  "esri/geometry/Polyline",
  "esri/geometry/support/meshUtils",
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
  "esri/layers/support/LabelClass"
], function (
  OAuthInfo,
  esriId,
  config,

  Map,
  SpatialReference,
  tin,
  SceneView,

  Graphic,
  Polygon,
  Point,

  Extent,
  Polyline,
  meshUtils,
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
  LabelClass) {
  return {
    init: function () {
      const info = new OAuthInfo({
        appId: config.appId,
        portalUrl: config.portalUrl,
        popup: false
      });

      esriId.registerOAuthInfos([info]);

      const map = new Map({
        ground: {
          opacity: 0
        }
      });

      const view = new SceneView({
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
        camera: {
          position: {
            spatialReference: SpatialReference.WebMercator,
            x: -13239947.23509459,
            y: 4537716.550325148,
            z: 9144.733118887329
          },
          heading: 222,
          tilt: 72
        },
        spatialReference: SpatialReference.WebMercator,
        viewingMode: "local",
        qualityProfile: "high",
        clippingArea: config.extent
      });

      tin.createGeometry()
        .then(function (mesh) {
          const graphic = new Graphic({
            geometry: mesh,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [{ type: "fill" }]
            }
          });

          view.graphics.add(graphic);
        })


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

      window.view = view;

      map.add(skiLiftsLayer);

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

      let itSnows = false;
      const snowContainer = document.getElementById("snow");
      document.getElementById("startSnow").addEventListener("click", function () {
        snowContainer.style.display = itSnows ? "none" : "inherit";
        itSnows = !itSnows;
      });

      const mapExtent = new Extent(config.extent);
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
    }
  }
})
