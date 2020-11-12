define([
  "app/map-style",
  "esri/layers/support/LabelClass"
], function (style, LabelClass) {

function getBackgroundCanvasURL(height, width) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", width.toString() + "px");
  canvas.setAttribute("height", height.toString() + "px");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = style.pointsOfInterest.iconBackgroundColor;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png");
}

  const hutSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          href: getBackgroundCanvasURL(1, 3)
        },
        size: 60,
        anchor: "relative",
        anchorPosition: {
          x: 0,
          y: 0.4
        }
      },
      {
        type: "icon",
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hotel.svg"
        },
        material: { color: style.pointsOfInterest.color },
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
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Restaurant.svg"
        },
        material: { color: style.pointsOfInterest.color },
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
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hospital.svg"
        },
        material: { color: style.pointsOfInterest.firstAidIconColor },
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
      size: style.callout.size,
      color: style.pointsOfInterest.color
    }
  };
  const restaurantSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          href: getBackgroundCanvasURL(1, 2)
        },
        size: 40,
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
        material: { color: style.pointsOfInterest.color },
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
          href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hospital.svg"
        },
        material: { color: style.pointsOfInterest.firstAidIconColor },
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
      size: style.callout.size,
      color: style.pointsOfInterest.color
    }
  };
  const barSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          href: getBackgroundCanvasURL(1, 1)
        },
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
        material: { color: style.pointsOfInterest.color },
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
      size: style.callout.size,
      color: style.pointsOfInterest.color
    }
  };

  return {
    getWaterRenderer() {
      return {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [
            {
              type: "water",
              color: style.water.color,
              waveStrength: "moderate",
              waterbodySize: "large"
            }
          ]
        }
      }
    },
    getWaterLabeling() {
      return [
        new LabelClass({
          labelExpressionInfo: { expression: "$feature.Name" },
          labelPlacement: "above-center",
          symbol: {
            type: "label-3d",
            symbolLayers: [
              {
                type: "text",
                material: {
                  color: style.water.labels.color
                },
                font: style.font,
                halo: style.halo
              }
            ],
            verticalOffset: {
              screenLength: 20,
              maxWorldLength: 20000,
              minWorldLength: 50
            },
            callout: {
              type: "line",
              size: style.callout.size,
              color: style.water.callout.color,
              border: {
                color: style.callout.borderColor
              }
            }
          }
        })
      ];
    },
    getSkiLiftRenderer() {
      return {
        type: "simple",
        symbol: {
          type: "line-3d",
          symbolLayers: [
            {
              type: "path",
              profile: "quad",
              material: { color: style.skiLift.color },
              width: 25,
              height: 5,
              join: "miter",
              cap: "butt",
              anchor: "bottom",
              profileRotation: "all"
            }
          ]
        }
      }
    },
    getSkiLiftLabeling() {
      return [
        new LabelClass({
          labelExpressionInfo: { expression: `"\ue654"` },
          where: "Status = 1",
          symbol: {
            type: "label-3d",
            symbolLayers: [
              {
                type: "text",
                material: {
                  color: style.skiLift.labels.openColor
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
          where: "Status = 0",
          symbol: {
            type: "label-3d",
            symbolLayers: [
              {
                type: "text",
                material: {
                  color: style.skiLift.labels.closedColor
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
    },
    getPillarRenderer() {
      return {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "object",
              resource: { primitive: "cylinder" },
              material: { color: style.skiLift.color },
              anchor: "top",
              depth: 3,
              height: 100,
              width: 3
            }
          ]
        }
      }
    },
    getPOIRenderer() {
      return {
        type: "unique-value",
        field: "Type",
        defaultSymbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: { primitive: "circle" },
              material: { color: style.pointsOfInterest.color },
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
            size: style.callout.size,
            color: style.pointsOfInterest.color,
            border: {
              color: style.callout.borderColor
            }
          }
        },
        uniqueValueInfos: [
          {
            value: "Hut",
            symbol: hutSymbol
          },
          {
            value: "Restaurant",
            symbol: restaurantSymbol
          },
          {
            value: "Bar",
            symbol: barSymbol
          }
        ]
      }
    },
    getPOILabeling() {
      return [
        new LabelClass({
          labelExpressionInfo: { expression: "$feature.Name" },
          symbol: {
            type: "label-3d",
            symbolLayers: [
              {
                type: "text",
                material: {
                  color: style.font.color
                },
                font: style.font,
                halo: style.halo
              }
            ]
          }
        })
      ]
    },
    getTreesRenderer() {
      return {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "object",
              resource: { primitive: "cone" },
              material: { color: style.trees.color },
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
    },
    getSkiTrailsRenderer() {
      return {
        type: "unique-value",
        field: "Type",
        uniqueValueInfos: [
          {
            value: "5",
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "line",
                  material: { color: style.skiTrails.park.color },
                  size: style.skiTrails.size
                },
                {
                  type: "line",
                  material: { color: style.skiTrails.park.outline },
                  size: style.skiTrails.outlineSize
                }
              ]
            },
            label: "Terrain parks"
          },
          {
            value: "4",
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "line",
                  material: { color: style.skiTrails.difficult.color },
                  size: style.skiTrails.size
                },
                {
                  type: "line",
                  material: { color: style.skiTrails.difficult.outline },
                  size: style.skiTrails.outlineSize
                }
              ]
            },
            label: "Difficult - black diamond"
          },
          {
            value: "3",
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "line",
                  material: { color: style.skiTrails.vDifficult.color },
                  size: style.skiTrails.size
                },
                {
                  type: "line",
                  material: { color: style.skiTrails.vDifficult.outline },
                  size: style.skiTrails.outlineSize
                }
              ]
            },
            label: "Very difficult - double black diamond"
          },
          {
            value: "2",
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "line",
                  material: { color: style.skiTrails.easy.color },
                  size: style.skiTrails.size
                },
                {
                  type: "line",
                  material: { color: style.skiTrails.easy.outline },
                  size: style.skiTrails.outlineSize
                }
              ]
            },
            label: "Easy - blue square"
          },
          {
            value: "1",
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "line",
                  material: { color: style.skiTrails.easiest.color },
                  size: style.skiTrails.size
                },
                {
                  type: "line",
                  material: { color: style.skiTrails.easiest.outline },
                  size: style.skiTrails.outlineSize
                }
              ]
            },
            label: "Easiest - green circle"
          }
        ]
      }
    },
    getModelsRenderer() {
      return {
        type: "unique-value",
        field: "name",
        uniqueValueInfos: [
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
                }
              ]
            }
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
    }
  }

});
