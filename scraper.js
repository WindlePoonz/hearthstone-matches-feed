import fs from "fs";

const data = {
  upcoming: [
    {
      time: new Date(Date.now() + 2 * 3600000).toISOString(),
      player1: "PlayerOne",
      player2: "PlayerTwo",
      player1_country: "SE",
      player2_country: "US",
      tournament: "Hearthstone Open 2025"
    }
  ],
  past: [
    {
      time: new Date(Date.now() - 2 * 3600000).toISOString(),
      player1: "PlayerThree",
      player2: "PlayerFour",
      player1_country: "FR",
      player2_country: "DE",
      tournament: "Winter Championship"
    }
  ]
};

fs.writeFileSync("hearthstone-matches.json", JSON.stringify(data, null, 2));
console.log("✅ Mock JSON written");
