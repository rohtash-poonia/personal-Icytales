const fs = require("node:fs");
const path = require("node:path");

const project = path.resolve(__dirname, "..");
const source = path.join(project, "src");
const images = path.join(project, "public", "images");
const mapping = {
  "chocolateBrownie2.png": "chocolateBrownie.png",
  "chocolateCone.png": "chocolate.png",
  "chocolateCone2.png": "chocolate.png",
  "chocolateCone3.png": "chocolate.png",
  "mint2.png": "mint.png",
  "mint3.png": "mint.png",
  "mintChocolate.png": "mint.png",
  "peach2.png": "peachMelbaSundae.png",
  "peach3.png": "peachMelbaSundae.png",
  "rockyRoad2.png": "rockyRoadSundae.png",
  "rockyRoad3.png": "rockyRoadSundae.png",
  "strawberry2.png": "strawberry.png",
  "strawberry3.png": "strawberry.png",
  "strawberrySudane.png": "strawberry.png",
  "vanilla.png": "classicVanilla.png",
  "vanilla2.png": "classicVanilla.png",
  "vanilla3.png": "classicVanilla.png",
};
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(?:js|jsx|css)$/.test(entry.name)) files.push(full);
  }
}
walk(source);
let changedFiles = 0;
let changedReferences = 0;
for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const updated = original.replace(/\/images\/([A-Za-z0-9 _().&'-]+\.(?:png|jpe?g|webp|svg|ico))/gi, (reference, filename) => {
    if (fs.existsSync(path.join(images, filename))) return reference;
    const replacement = mapping[filename] && fs.existsSync(path.join(images, mapping[filename])) ? mapping[filename] : "placeholder.svg";
    changedReferences += 1;
    return "/images/" + replacement;
  });
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changedFiles += 1;
  }
}
console.log(JSON.stringify({ changedFiles, changedReferences }));
