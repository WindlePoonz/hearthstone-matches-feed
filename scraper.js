import { JSDOM } from "jsdom";
import moment from "moment-timezone";
import fs from "fs";

const URL = "https://liquipedia.net/hearthstone/Upcoming_and_ongoing_matches";
const TIMEZONE = "Europe/Paris";

async function fetchMatches() {
  const dom = await JSDOM.fromURL(URL, { resources: "usable" });
  const doc = dom.window.document;
  const rows = [...doc.querySelectorAll(".infobox_matches_content > table tr")];
  const upcoming = [], past = [];

  for (const row of rows) {
    const timeElem = row.querySelector(".match-filler + .match-countdown");
    const players = row.querySelectorAll(".team-left, .team-right");
    const tour = row.closest(".fo-nttax-infobox").querySelector("a");

    if (!timeElem || players.length < 2 || !tour) continue;

    const timestamp = timeElem.getAttribute("data-timestamp");
    const datetime = moment.unix(timestamp).tz(TIMEZONE);
    const now = moment().tz(TIMEZONE);

    const match = {
      time: datetime.toISOString(),
      player1: players[0].textContent.trim(),
      player2: players[1].textContent.trim(),
      player1_country: players[0].querySelector("img")?.getAttribute("title")?.toUpperCase() || "",
      player2_country: players[1].querySelector("img")?.getAttribute("title")?.toUpperCase() || "",
      tournament: tour.textContent.trim()
    };

    if (datetime.isAfter(now)) upcoming.push(match);
    else past.push(match);
  }

  fs.writeFileSync("hearthstone-matches.json", JSON.stringify({ upcoming, past }, null, 2));
  console.log("✅ hearthstone-matches.json written.");
}

fetchMatches().catch(console.error);
