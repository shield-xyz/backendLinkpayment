const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

const url = process.env.URL_FRONT; // Endpoint to check server health

cron.schedule("*/5 * * * *", async () => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      logStatus("UP");
    } else {
      logStatus("DOWN");
    }
  } catch (error) {
    logStatus("DOWN");
  }
});

function logStatus(status) {
  const timestamp = new Date().toISOString();
  fs.appendFile("server-status.log", `${timestamp} - ${status}\n`, (err) => {
    if (err) throw err;
  });
}

// Function to calculate uptime and downtime statistics
function calculateUptime() {
  const log = fs.readFileSync("server-status.log", "utf-8");
  const lines = log.trim().split("\n");
  let upTime = 0;
  let downTime = 0;

  lines.forEach((line, index) => {
    const [timestamp, status] = line.split(" - ");
    if (index < lines.length - 1) {
      const nextTimestamp = lines[index + 1].split(" - ")[0];
      const duration = new Date(nextTimestamp) - new Date(timestamp);
      if (status === "UP") {
        upTime += duration;
      } else {
        downTime += duration;
      }
    }
  });

  const totalTime = upTime + downTime;
  const upPercentage = (upTime / totalTime) * 100;
  const downPercentage = (downTime / totalTime) * 100;

  logger.info(`Uptime: ${upPercentage.toFixed(2)}%`);
  logger.info(`Downtime: ${downPercentage.toFixed(2)}%`);
}

// Run the function to calculate uptime and downtime

module.exports = {
  calculateUptime,
};
