define([], function () {

  const waterLabelColor = "rgb(72, 140, 153)";
  const waterColor = "rgb(128, 227, 255)";

  const darkGray = "rgb(50, 50, 50)";
  const gray = "rgb(100, 100, 100)";

  const greenOpen = "rgb(54, 173, 136)";
  const red = "rgb(230, 87, 97)";

  const background = "rgba(255, 255, 255, 0.8)";

  const greenTrees = "rgb(75, 181, 191)";

  const greenSlope = "rgb(141, 199, 97)";
  const greenSlopeOutline = "rgba(141, 199, 97, 0.2)";
  const blueSlope = "rgb(52, 134, 209)";
  const blueSlopeOutline = "rgba(52, 134, 209, 0.2)";
  const redSlope = "rgb(235, 64, 52)";
  const redSlopeOutline = "rgba(235, 64, 52, 0.2)";
  const blackSlope = "rgb(100, 100, 100)";
  const blackSlopeOutline = "rgba(100, 100, 100, 0.2)";
  const orangeSlope = "rgb(255, 143, 46)";
  const orangeSlopeOutline = "rgba(255, 143, 46, 0.2)";

  return {
    // general settings
    font: {
      size: 10,
      family: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
      color: darkGray
    },
    callout: {
      size: 1,
      borderColor: [255, 255, 255]
    },
    halo: {
      size: 2,
      color: background
    },

    // water
    water: {
      color: waterColor,
      labels: {
        color: waterLabelColor
      },
      callout: {
        color: waterLabelColor
      }
    },

    // ski lifts
    skiLift: {
      color: gray,
      labels: {
        openColor: greenOpen,
        closedColor: red
      }
    },

    // icons
    pointsOfInterest: {
      color: gray,
      firstAidIconColor: red,
      iconBackgroundColor: background
    },

    // trees
    trees: {
      color: greenTrees
    },

    // trails
    skiTrails: {
      size: 1,
      outlineSize: 7,
      easiest: {
        color: greenSlope,
        outline: greenSlopeOutline
      },
      easy: {
        color: blueSlope,
        outline: blueSlopeOutline
      },
      vDifficult: {
        color: redSlope,
        outline: redSlopeOutline
      },
      difficult: {
        color: blackSlope,
        outline: blackSlopeOutline
      },
      park: {
        color: orangeSlope,
        outline: orangeSlopeOutline
      }
    }
  }
});
