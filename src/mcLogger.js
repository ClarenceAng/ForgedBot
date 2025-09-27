const { Rcon } = require("rcon-client");
require("dotenv").config();
const mcIP = process.env.MC_IP;
const discordChannelId = "1409934238907891805";

module.exports = async (bot) => {
  let rcon;
  let connected = false;

  async function connectRcon() {
    try {
      rcon = new Rcon({
        host: mcIP,
        port: 25575,
        password: process.env.RCON_PASSWORD,
      });

      await rcon.connect();
      connected = true;
      console.log("✅ Connected to Minecraft server via RCON");

      // Reconnect if connection closes
      rcon.on("end", () => {
        console.log("🔌 RCON disconnected. Retrying in 5s...");
        connected = false;
        setTimeout(connectRcon, 5000);
      });
    } catch (err) {
      console.error("⚠️ Failed to connect to RCON:", err.message);
      connected = false;
      setTimeout(connectRcon, 5000); // retry after 5s
    }
  }

  // start trying to connect right away
  connectRcon();

  let previousPlayers = [];

  setInterval(async () => {
    if (!connected || !rcon) return; // don’t poll if RCON isn’t ready

    try {
      const response = await rcon.send("list");
      const onlinePlayers =
        response
          .split(":")[1]
          ?.split(",")
          .map((p) => p.trim())
          .filter((p) => p) || [];

      // Detect joins
      onlinePlayers.forEach((player) => {
        if (!previousPlayers.includes(player)) {
          bot.channels.cache
            .get(discordChannelId)
            ?.send(`✅ **${player}** joined the server`);
        }
      });

      // Detect leaves
      previousPlayers.forEach((player) => {
        if (!onlinePlayers.includes(player)) {
          bot.channels.cache
            .get(discordChannelId)
            ?.send(`❌ **${player}** left the server`);
        }
      });

      previousPlayers = onlinePlayers;
    } catch (err) {
      console.error("Error polling Minecraft server:", err.message);
      connected = false;
      setTimeout(connectRcon, 5000); // try reconnecting if polling fails
    }
  }, 5000); // poll every 5s
};
