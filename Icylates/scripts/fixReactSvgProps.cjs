const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "../src/components/common/Icons.jsx");
let source = fs.readFileSync(file, "utf8");
for (const [from, to] of Object.entries({
  "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin",
  "fill-opacity": "fillOpacity", "clip-path": "clipPath", "shape-rendering": "shapeRendering",
  "stop-color": "stopColor", "stop-opacity": "stopOpacity",
})) source = source.replaceAll(from + "=", to + "=");
source = source.replace(/\bclass=/g, "className=");
source = source.replace("export const Star = () => {\r\n  return (\r\n    <div>\r\n      <svg", "export const Star = () => {\r\n  return (\r\n      <svg");
source = source.replace("      </svg>\r\n    </div>\r\n  );\r\n};\r\nexport const AddToCard", "      </svg>\r\n  );\r\n};\r\nexport const AddToCard");
source = source.replace(/\s*<a href="https:\/\/www\.figma\.com\/design\/XyQF2PqHFmF2VlxXAALhkp\?node-id=3-1826">[\s\S]*?<\/a>/, "");
source = source.replace(/\s*<a href="https:\/\/www\.figma\.com\/design\/XyQF2PqHFmF2VlxXAALhkp\?node-id=3-3">[\s\S]*?<\/a>/, "");
fs.writeFileSync(file, source);
console.log("React SVG properties repaired");
