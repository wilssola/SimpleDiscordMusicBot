const ytsr = require("ytsr");
const ytdl = require("ytdl-core");

const {
  joinVoiceChannel,
  createAudioPlayer,
  getVoiceConnection,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

// Batidão
const queue = require("./const");
const play = require("./play");

async function execute(interaction, serverQueue) {
  const search = interaction.options.getString("busca");

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.editReply(
      "Você precisa estar em um canal de voz para tocar um batidão!"
    );
  }
  //console.log("\nvoiceChannel:", voiceChannel);

  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return interaction.editReply(
      "Eu não tenho permissão para entrar e falar nesse canal de voz!"
    );
  }
  //console.log("\npermissions:", permissions);

  let song = null;
  try {
    console.log(search);
    const videoInfo = await ytdl.getInfo(search);
    song = {
      title: videoInfo.videoDetails.title,
      url: videoInfo.videoDetails.video_url,
    };
    console.log("\nsong:", song);
  } catch {
    try {
      const videoSearch = await ytsr(search);
      song = {
        title: videoSearch.items[0].title,
        url: videoSearch.items[0].url,
      };
      console.log("\nsong:", song);
    } catch {
      song = null;
    }
  }

  if (!song) {
    return interaction.editReply(
      'O batidão "' + search + '" não foi encontrado!'
    );
  }

  if (!serverQueue) {
    const queueContruct = {
      textChannel: interaction.channel,
      voiceChannel: voiceChannel,
      interaction: interaction,
      connection: null,
      player: createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      }),
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(interaction.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      joinChannel(voiceChannel, queueContruct);

      return play(interaction.guild, song);
    } catch (err) {
      console.log(err);

      queue.delete(interaction.guild.id);

      return interaction.editReply(err);
    }
  } else {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      joinChannel(voiceChannel, serverQueue);
    }

    serverQueue.songs.push(song);

    if (!serverQueue.playing) {
      play(interaction.guild, song);
    }

    return interaction.editReply(
      'O batidão foi adicionado a fila: \n"' + song.title + '"\n' + song.url
    );
  }
}

function joinChannel(voiceChannel, serverQueue) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  connection.setSpeaking(true);

  connection.subscribe(serverQueue.player);

  if (!serverQueue.connection) {
    serverQueue.connection = connection;
  }
}

module.exports = execute;