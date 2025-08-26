const { Rcon } = require("rcon-client");
require("dotenv").config();
const mcIP = process.env.MC_IP;
const discordChannelId = "866548058220920835";

module.exports = async (bot) => {
  const rcon = new Rcon({
    host: mcIP,
    port: 25575,
    password: process.env.RCON_PASSWORD,
  });

  await rcon.connect();
  console.log("Connected to Minecraft server via RCON");

  let previousPlayers = [];

  // Poll every 5 seconds
  setInterval(async () => {
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
      console.error("Error polling Minecraft server:", err);
    }
  }, 1000);
};
