const { getVoiceConnection } = require("@discordjs/voice");

// Batidão
const queue = require("./const");

function stop(interaction, serverQueue) {
  if (!interaction.member.voice.channel) {
    return message.editReply(
      "Você precisa estar em um canal de voz para parar o batidão!"
    );
  }

  if (!serverQueue || serverQueue.songs.length <= 0) {
    return interaction.editReply("Não há nenhum batidão tocando!");
  }

  const connection = getVoiceConnection(interaction.guild.id);
  if (connection) {
    serverQueue.connection.destroy();
    console.log("\nConnection destroyed because has stopped.");
  }

  queue.delete(interaction.guild.id);

  return interaction.editReply("O batidão foi derrubado!");
}

module.exports = stop;
