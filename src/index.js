const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ApplicationCommandOptionType,
  REST,
  Routes,
} = require("discord.js");
// const guildId = "866548058220920832"; // Replace with your target server's ID
require("dotenv").config();
const embeds = require("./embed.js");
const clientId = process.env.BOT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;
const mcLogger = require("./mcLogger.js");
const canvasWatcher = require("./canvasWatcher.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  https: {
    timeout: 50000,
  },
});

client.on("ready", (c) => {
  console.log(`${c.user.username} started!`);
  mcLogger(client);
  canvasWatcher(client);
});

const commands = [
  {
    name: "minecraft",
    description: "Info about the Minecraft server",
  },
  {
    name: "online",
    description: "Info about online players left",
  },
];

const rest = new REST({ version: 10 }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  } catch (error) {
    console.log(error);
  }
})();

embeds(client);

client.login(token);
