const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");
const moment = require("moment-timezone");

const TIMEZONE = "Europe/Paris";
const URL = "https://liquipedia.net/hearthstone/api.php?action=parse&page=Liquipedia:Upcoming_and_ongoing_matches&format=json&prop=text";

function getFlagCountry(name) {
  const match = name.match(/\((\\w{2})\\)/);
  return match ? match[1] : null;
}

function cleanName(name) {
  return name.replace(/\\s*\\(\\w{2}\\)/, "").trim();
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 MagicMirror" }
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data).parse.text["*"]));
    }).on("error", reject);
  });
}

(async () => {
  try {
    const html = await fetchHTML(URL);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const now = moment().tz(TIMEZONE);

    const tables = [...document.querySelectorAll("table")];
    const upcoming = [];
    const past = [];

    tables.forEach(table => {
      const tournament = table.previousElementSibling?.textContent?.trim() || "Unknown Tournament";
      const rows = [...table.querySelectorAll("tr")];

      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 5) {
          const timeText = cells[0].textContent.trim();
          const player1 = cells[1].textContent.trim();
          const player2 = cells[3].textContent.trim();

          const timeMatch = timeText.match(/(\\d{2}):(\\d{2})/);
          if (timeMatch) {
            const [_, hour, minute] = timeMatch;
            const date = moment().tz(TIMEZONE).set({ hour: +hour, minute: +minute, second: 0 });

            const match = {
              time: date.toISOString(),
              player1: cleanName(player1),
              player2: cleanName(player2),
              player1_country: getFlagCountry(player1),
              player2_country: getFlagCountry(player2),
              tournament
            };

            (date.isAfter(now) ? upcoming : past).push(match);
          }
        }
      });
    });

    const result = {
      upcoming: upcoming.slice(0, 10),
      past: past.slice(-10).reverse()
    };

    fs.writeFileSync("hearthstone-matches.json", JSON.stringify(result, null, 2));
    console.log("✔ JSON updated.");
  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
})();
