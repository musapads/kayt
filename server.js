const { Client, MessageEmbed, Intents } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const allIntents = new Intents(32767)
const client = new Client({
    intents: allIntents,
    partials: ["MESSAGE", "CHANNEL", "REACTION"]
});
const config = require('./config.json');

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(config.prefix) || !message.channel || message.channel.type == "dm") return;
    let args = message.content.substring(config.prefix.length).split(" ");
    let command = args[0];
    args = args.splice(1);
    if (command === 'start') {
        if (message.member.voice.channel) {
            let voiceChannel = message.member.voice.channel;
            let connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('ses kanalına bağlandı');
                play(connection)
            });
            

        } else {
            message.channel.send('Lütfen bir ses kanalına girin.');
        }
    }
})

function play(connection) {
    const stream = ytdl(config.url, { filter: 'audio' });
    let resource = createAudioResource(stream, {
        inlineVolume: true
    });

    resource.volume.setVolume(0.5);

    let player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('bitti tekrar başlatılıyor');
        play(connection);
    })
}

client.login(process.env.token).catch(console.error);