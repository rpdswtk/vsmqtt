const COLORS = [
    "#270d70",
    "#daffb2",
    "#1aa6f2",
    "#ed4f00",
    "#9476e0",
    "#00ba31",
    "#eacf9d",
    "#d7fca4",
    "#5275f2",
    "#cbfca1",
    "#fc743f",
    "#ef6e9f",
    "#e5627a",
    "#adffd0",
    "#8845ad",
    "#b1b0f4",
    "#b6a6ed",
    "#9c8cdb",
    "#8ef9e9",
    "#473aff",
    "#e57bb0",
    "#3198d8",
    "#9859f7",
    "#f2b3b4",
    "#dd9c6a",
    "#dc86ef",
    "#ed50a1",
    "#3a6ee0",
    "#7fef95",
    "#dd52c8",
    "#c1bb05",
    "#f293e5",
    "#72f25c",
    "#93f9a7",
    "#3251b5",
    "#54c7ea",
    "#ffcccd",
    "#cc267e",
    "#ef8bc0",
    "#7fd662",
    "#e5d462",
    "#60e0d1",
    "#7c64c1",
    "#f2d674",
    "#f7c8af",
    "#41ea82",
    "#f9eb7c",
    "#b57310",
    "#8e56bf",
    "#25b5ce",
    "#e89e74",
    "#6ce819",
    "#db40ed",
    "#358591",
    "#b58829",
    "#f4d1b2",
    "#b0bc2b",
    "#e295c4",
    "#ccf963",
    "#50d8d4",
    "#50ed8c",
    "#2222d6",
    "#afa8ea",
    "#f4c4b5",
    "#8b8de5",
    "#34c97c",
    "#dda06e",
    "#ed40db",
    "#de23ef",
    "#90bedd",
    "#abed28",
    "#ef5df7",
    "#202d8e",
    "#0af702",
    "#028e52",
    "#12868c",
    "#c1970b",
    "#7d78d3",
    "#bdf918",
    "#766dc4",
    "#ffdba5",
    "#e86e68",
    "#78dbdb",
    "#bc8edb",
    "#0dc651",
    "#f96166",
    "#028404",
    "#f7a3d7",
    "#8ab6db",
    "#dd7b30",
    "#c17bd8",
    "#efc57c",
    "#4ce840",
    "#2d47b7",
    "#48ea71",
    "#ccea8f",
    "#90f99d",
    "#144277",
    "#bc06e0",
    "#66ffb7",
    "#d31f73",
    "#3fba16",
    "#e06073",
    "#3c08a5",
    "#dd2c6d",
    "#d3ed87",
    "#96d9ea",
    "#04458c",
    "#318dc6",
    "#ed747e",
    "#e86dd9",
    "#b27c1e",
    "#f46eeb",
    "#6207b7",
    "#7f4baf",
    "#2fa315",
    "#7edb72",
    "#87c7db",
    "#dfe26c",
    "#ed8be1",
    "#30dd5e",
    "#7b48b5",
    "#726dce",
    "#f73d8e",
    "#299e1c",
    "#33d602",
    "#e2d731",
    "#f995a3",
    "#960320",
    "#81cdf9",
    "#fca4d1",
    "#bafc94",
    "#bd8fe8",
    "#096199",
    "#d9b1ef",
    "#1568ed",
    "#cc0a95",
    "#6fb51b",
    "#2cce16",
    "#f9b6e4",
    "#cad345",
    "#cef7a0",
    "#439eb2",
    "#d586ef",
    "#dd8d66",
    "#f4c764",
    "#edccff",
    "#fc97f9",
    "#b8ff82",
    "#89ff77",
    "#991f1b",
    "#76f7f0",
    "#f9b8f5",
    "#a8e5f4",
    "#36c156",
    "#d16132",
    "#ffd0cc",
    "#67fcc8",
    "#daccff",
    "#ffb2e1"
];

function shuffle(array: Array<any>) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

export class ColorManager {

    private static topicColors = new Map<string, string>();
    private static colors = shuffle(COLORS);
    private static index = 0;

    public static getColor(topic: string): string {
        if (ColorManager.topicColors.has(topic)) {
            let color = ColorManager.topicColors.get(topic);
            return color? color : "";
        }

        let newColor = ColorManager.colors[ColorManager.index];
        ColorManager.index++;
        if (ColorManager.index > ColorManager.colors.length - 1) {
            ColorManager.index = 0;
        }
        ColorManager.topicColors.set(topic, newColor);
        return newColor;
    }
}