const { Client, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { clientId, token, donateLink, flybisLink } = require("./config.json");

const queue = require("./const");
const commands = require("./commands");
const execute = require("./execute");
const skip = require("./skip");
const stop = require("./stop");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

client.once("ready", () => {
  console.log("Discord bot is ready as tag: " + client.user.tag);

  const guilds = client.guilds.cache.map((guild) => guild.id);
  console.log("\nguilds:", guilds);

  const rest = new REST({ version: "9" }).setToken(token);
  rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("\nSuccessfully registered application commands."))
    .catch((err) => console.error("\n" + err));
});

client.once("reconnecting", () => {
  console.log("Discord bot is reconnecting...");
});

client.once("disconnect", () => {
  console.log("Discord bot is disconnecting...");
});

client.on("interactionCreate", async (interaction) => {
  console.log(interaction);

  if (!interaction.isCommand()) return;

  const { commandName, guildId } = interaction;

  const serverQueue = queue.get(guildId);

  switch (commandName) {
    case "ping":
      await interaction.reply(
        "Pong! - " + (Date.now() - interaction.createdTimestamp) + "ms"
      );
      break;
    case "donate":
      await interaction.reply(donateLink);
      break;
    case "flybis":
      await interaction.reply(flybisLink);
      break;
    case "play":
      await interaction.deferReply();
      await execute(interaction, serverQueue);
      break;
    case "skip":
      await interaction.deferReply();
      skip(interaction, serverQueue);
      break;
    case "stop":
      await interaction.deferReply();
      stop(interaction, serverQueue);
      break;
  }
});

client.login(token);
