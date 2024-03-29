const ytdl = require("ytdl-core");

const {
  getVoiceConnection,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
} = require("@discordjs/voice");

// Batidão
const queue = require("./const");

function play(guild, song) {
  let serverQueue = queue.get(guild.id);
  //console.log("\nserverQueue:", serverQueue);

  if (!song) {
    destroyQueue(guild, serverQueue);

    return;
  }

  serverQueue.connection.on("error", (err) => console.log(err));

  serverQueue.connection.on("stateChange", (oldState, newState) => {
    console.log(
      `\nConnection transitioned from ${oldState.status} to ${newState.status}.`
    );
  });

  serverQueue.connection.on(VoiceConnectionStatus.Ready, () => {
    console.log("\nConnection has ready");
  });

  console.log("\nplay", song);

  const stream = ytdl(song.url, { filter: "audioonly" });

  serverQueue.player.play(createAudioResource(stream));

  serverQueue.player.on("error", (err) => console.log(err));

  serverQueue.player.on("stateChange", (oldState, newState) => {
    console.log(
      `\nPlayer transitioned from ${oldState.status} to ${newState.status}.`
    );
  });

  serverQueue.player.on(AudioPlayerStatus.AutoPaused, () => {
    disconnectAFK(guild, serverQueue);

    pauseQueue(guild, serverQueue);

    playNext(guild, serverQueue);
  });

  serverQueue.player.on(AudioPlayerStatus.Idle, () => {
    disconnectAFK(guild, serverQueue);

    pauseQueue(guild, serverQueue);

    playNext(guild, serverQueue);
  });

  serverQueue.player.on(AudioPlayerStatus.Playing, () => {
    connectAFK(guild, serverQueue);

    playQueue(guild, serverQueue);
  });

  return serverQueue.interaction.channel.send(
    'Começando a tocar o batidão: \n"' + song.title + '"\n' + song.url
  );
}

function playNext(guild, serverQueue) {
  if (serverQueue && serverQueue.songs) {
    if (serverQueue.songs.length > 1) {
      const song = serverQueue.songs[1];
      //console.log("\nplayNext", song);

      serverQueue.songs.shift();

      play(guild, song);
    }
  }
}

function pauseQueue(guild, serverQueue) {
  serverQueue.playing = false;

  queue.set(guild.id, serverQueue);
}

function playQueue(guild, serverQueue) {
  serverQueue.playing = true;

  queue.set(guild.id, serverQueue);
}

function destroyQueue(guild, serverQueue) {
  const connection = getVoiceConnection(guild.id);
  if (connection) {
    if (serverQueue.connection) {
      serverQueue.connection.destroy();
      console.log("\nConnection destroyed because not has song.");
    }
  }

  queue.delete(guild.id);
}

function disconnectAFK(guild, serverQueue) {
  serverQueue.disconnect = setTimeout(() => {
    if (!serverQueue.playing) {
      destroyQueue(guild, serverQueue);
    }
  }, 60000);

  queue.set(guild.id, serverQueue);
}

function connectAFK(guild, serverQueue) {
  if (serverQueue.disconnect) {
    clearTimeout(serverQueue.disconnect);

    queue.set(guild.id, serverQueue);
  }
}

module.exports = play;
