define([
  "app/config",
  "app/renderers",
  "esri/Map",
  "esri/geometry/SpatialReference",
  "app/tin",
  "esri/views/SceneView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Extent",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/core/watchUtils"
], function (
  config,
  renderers,
  Map,
  SpatialReference,
  tin,
  SceneView,
  Graphic,
  Point,
  Extent,
  GraphicsLayer,
  FeatureLayer,
  watchUtils
  ) {
  return {
    init: function () {

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
      view.when(function() {
        watchUtils.whenFalseOnce(view, "updating", function() {
          document.getElementsByTagName("canvas")[0].style.filter = "opacity(100%)";
        });
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
        });

      const pointsOfInterestLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/interest_points_mammoth/FeatureServer",
        screenSizePerspectiveEnabled: false,
        renderer: renderers.getPOIRenderer(),
        labelingInfo: renderers.getPOILabeling()
      });

      map.add(pointsOfInterestLayer);

      const waterLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/mammoth_lakes/FeatureServer",
        renderer: renderers.getWaterRenderer(),
        labelingInfo: renderers.getWaterLabeling()
      });
      map.add(waterLayer);

      const skiLiftsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/ski_lifts_Mammoth/FeatureServer/0",
        outFields: ["OBJECTID"],
        elevationInfo: {
          mode: "absolute-height",
          offset: 25
        },
        renderer: renderers.getSkiLiftRenderer(),
        labelingInfo: renderers.getSkiLiftLabeling()
      });
      map.add(skiLiftsLayer);

      skiLiftsLayer
        .queryFeatures({
          where: "1=1",
          returnZ: true,
          returnGeometry: true
        })
        .then(function (results) {
          const graphics = [];
          results.features.forEach(function (feature) {
            feature.geometry.paths.forEach(function (path) {
              path.forEach(function (point, index) {
                const pillarGeometry = new Point({
                  x: point[0],
                  y: point[1],
                  z: point[2],
                  spatialReference: feature.geometry.spatialReference
                });
                const graphic = new Graphic({
                  geometry: pillarGeometry,
                  attributes: {
                    ObjectId: index
                  }
                });
                graphics.push(graphic);
              });
            });

            const skiLiftPillarLayer = new FeatureLayer({
              elevationInfo: {
                mode: "absolute-height",
                offset: 26
              },
              fields: [{
                name: "ObjectID",
                alias: "ObjectID",
                type: "oid"
              }],
              renderer: renderers.getPillarRenderer(),
              source: graphics
            });
            map.add(skiLiftPillarLayer);
          });
        });

      const treesLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/trees_mammoth/FeatureServer",
        elevationInfo: {
          mode: "absolute-height"
        },
        renderer: renderers.getTreesRenderer()
      });

      map.add(treesLayer);

      const skiTrailsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/ski_trails_mammoth/FeatureServer",
        elevationInfo: {
          mode: "absolute-height",
          offset: 5
        },
        renderer: renderers.getSkiTrailsRenderer()
      });
      map.add(skiTrailsLayer);

      const modelsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/3d_models_mammoth/FeatureServer",
        renderer: renderers.getModelsRenderer()
      });
      map.add(modelsLayer);

      let itSnows = false;
      const snowContainer = document.getElementsByClassName("snow")[0];
      const snowButton = document.getElementById("startSnow");
      snowButton.addEventListener("click", function () {
        snowContainer.style.display = itSnows ? "none" : "inherit";
        snowButton.innerHTML = itSnows ? "make it snow" : "stop the snow";
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
      const radius = 3000;
      const duration = 20000;
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
        })
      });

      planeGraphicsLayer.add(planeGraphic);

      const planeGeometry = planeGraphic.geometry;
      const planeSymbolLayer = planeGraphic.symbol.symbolLayers.getItemAt(0);
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
      const flyButton = document.getElementById("flyPlane");

      flyButton.addEventListener("click", function () {

        if (planeFlying) {
          positionAnimation.pause();
          headingAnimation.pause();
          flyButton.innerHTML = "fly the plane";
        } else {
          planeGraphic.visible = true;
          positionAnimation.play();
          headingAnimation.play();
          flyButton.innerHTML = "stop the plane";
        }
        planeFlying = !planeFlying;
      });
    }
  }
})
