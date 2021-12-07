const { getVoiceConnection } = require("@discordjs/voice");

// Batidão
const queue = require("./const");

function skip(interaction, serverQueue) {
  if (!interaction.member.voice.channel) {
    return interaction.editReply(
      "Você precisa estar em um canal de voz para pular um batidão!"
    );
  }

  if (serverQueue && serverQueue.songs) {
    if (serverQueue.songs.length > 1) {
      serverQueue.player.stop();
      return interaction.editReply("O batidão foi skipado!");
    }

    if (serverQueue.songs.length == 1) {
      const connection = getVoiceConnection(interaction.guild.id);
      if (connection) {
        if (serverQueue.connection) {
          serverQueue.connection.destroy();
          console.log("\nConnection destroyed because not has song.");
        }
      }

      queue.delete(interaction.guild.id);

      return interaction.editReply("O batidão foi derrubado!");
    }
  }

  return interaction.editReply("Não há nenhum batidão tocando!");
}

module.exports = skip;
