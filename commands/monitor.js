const { SlashCommandBuilder, ChannelType } = require('discord.js');
const util = require('axios');
const Discord = require('discord.js')
// const ChannelType = require('discord.js')

const interval = process.env.INTERVAL;
let onlinePlayers = [];
let playerCount;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('monitor')
		.setDescription('Start monitoring the server'),
    async execute(interaction) {

        await createChannels(interaction);

        await update(interaction);
        setInterval(() => {
			update(interaction);
		}, interval);
    },
};

async function createChannels(interaction) {
    if(!interaction.guild.channels.cache.find(x => x.name === 'SERVER STATUS:')){
        const status = await interaction.guild.channels.create({name: 'SERVER STATUS:', type: ChannelType.GuildCategory});
        await interaction.guild.channels.create({name: `Status: Offline`, parent: status, type: ChannelType.GuildVoice});
        //await interaction.guild.channels.create({name: `Players:  / `, parent: status, type: ChannelType.GuildVoice});
        console.log('[INFO]: Created status channels');
    }else{
        //interaction.guild.channels.cache.find(x => x.name.includes('Status:')).setName(`Status: ${response.data.online ? 'Online' : 'Offline'}`);
        //interaction.guild.channels.cache.find(x => x.name.includes('Players:')).setName(`Players: ${response.data.players.online} / ${response.data.players.max}`);
        console.log('[INFO]: Status channels found');
    }

    if(!interaction.guild.channels.cache.find(x => x.name === 'ONLINE PLAYERS:')){
        await interaction.guild.channels.create({name: 'ONLINE PLAYERS:', type: ChannelType.GuildCategory});
        console.log('[INFO]: Created players channel group');
    }else{
        const map = interaction.guild.channels.cache.find(x => x.name === 'ONLINE PLAYERS:').children.cache.map(c => c.id);
        map.forEach(child => {
            interaction.guild.channels.fetch(child).then(channel => channel.delete());
        });
        console.log('[INFO]: Players channel group found and cleared');
    }
}

async function update(interaction) {
    const listParent = interaction.guild.channels.cache.find(x => x.name === 'ONLINE PLAYERS:');
    const statusParent = interaction.guild.channels.cache.find(x => x.name === 'SERVER STATUS:');

    const statusChannels = statusParent.children.cache.map(c => c.id);

    util.get(`https://api.mcstatus.io/v2/status/java/${process.env.SERVER_IP}`)
        .then((response) => {
            if (response.data.players.online === 0 && onlinePlayers.length === 0) return;

            let players = [];
            if (response.data.players.list != null){
                response.data.players.list.forEach(player => {
                    players.push(player.name_clean);
                });
            }

            const compareArrays = (a, b) =>
              a.length === b.length &&
              a.every((element, index) => element === b[index]);


            players.sort();
            onlinePlayers.sort();
            if(compareArrays(players, onlinePlayers)){
                console.log("No changes");
                return;
            }



            //console.log(players)
            //console.log(onlinePlayers)
            //console.log(response.data.players.online)

            interaction.guild.channels.cache.find(x => x.id === statusChannels[0]).setName(`Status: ${response.data.online ? 'Online' : 'Offline'}`);
            //console.log(interaction.guild.channels.cache.find(x => x.id === statusChannels[1]).name);
            //interaction.guild.channels.cache.find(x => x.id === statusChannels[1]).setName(`Players: ${response.data.players.online} / ${response.data.players.max}`);

            players.forEach(player => {
                if(!onlinePlayers.includes(player)){
                    onlinePlayers.push(player);
                    interaction.guild.channels.create({name: player, type: ChannelType.GuildVoice, parent: listParent});
                }
            });

            onlinePlayers.forEach(player => {
                if(!players.includes(player)){
                    onlinePlayers.splice(onlinePlayers.indexOf(player), 1);
                    const channel = interaction.guild.channels.cache.find(x => x.name === player);
                    channel.delete();
                }
            });
        });
}