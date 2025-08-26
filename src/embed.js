const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { Rcon } = require("rcon-client");
require("dotenv").config();
const mcIP = process.env.MC_IP;
const rconPort = 25575;
const rconPassword = process.env.RCON_PASSWORD;

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "minecraft") {
      const embed = new EmbedBuilder()
        .setTitle("Minecraft Server Information")
        .setDescription(
          `Server IP Address:\n\`\`\`\n${mcIP}\n\`\`\`\nServer Version:\n\`\`\`\n1.21.8\n\`\`\``
        )
        .setColor("#006400")
        .setFooter({
          text: "by ForgedLives",
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "online") {
      try {
        const rcon = new Rcon({
          host: mcIP,
          port: rconPort,
          password: rconPassword,
        });
        await rcon.connect();
        const response = await rcon.send("list");
        await rcon.end();

        const onlinePlayers =
          response
            .split(":")[1]
            ?.split(",")
            .map((p) => p.trim())
            .filter((p) => p) || [];

        const embed = new EmbedBuilder()
          .setTitle("Online Players")
          .setDescription(
            onlinePlayers.length
              ? onlinePlayers.map((p) => `**${p}**`).join("\n")
              : "No players online."
          )
          .setColor("#006400")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "Failed to fetch online players from the server.",
          ephemeral: true,
        });
      }
    }
  });
};
