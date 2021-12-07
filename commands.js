const { SlashCommandBuilder } = require("@discordjs/builders");

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Retorna um pong!"),
  new SlashCommandBuilder()
    .setName("flybis")
    .setDescription("Retorna o flybis!"),
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Tocar um batidão!")
    .addStringOption((option) =>
      option
        .setName("busca")
        .setDescription("Insira um texto/link")
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName("stop").setDescription("Parar um batidão!"),
  new SlashCommandBuilder().setName("skip").setDescription("Pular um batidão!"),
].map((command) => command.toJSON());

module.exports = commands;
