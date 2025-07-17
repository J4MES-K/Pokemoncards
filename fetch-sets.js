const fs = require("fs");
const fetch = require("node-fetch"); // install if needed: npm install node-fetch@2

fetch("https://api.pokemontcg.io/v2/sets")
  .then(res => res.json())
  .then(data => {
    fs.writeFileSync("./src/data/sets.json", JSON.stringify(data, null, 2));
    console.log("Saved sets.json successfully.");
  })
  .catch(err => {
    console.error("Failed to fetch sets:", err);
  });
