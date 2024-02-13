
require('dotenv').config();

// const { SlashCommandBuilder } = require('discord.js');
const util = require('axios');
// const Discord = require('discord.js')
const ChannelType = require('discord.js')

const interval = process.env.INTERVAL;
let onlinePlayers = [];

const Discord = require('discord.js');
const {IntentsBitField} = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

const client = new Discord.Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});
client.login(process.env.DISCORD_TOKEN)

client.commands = new Discord.Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const command = require("C:\\Users\\Piotr\\Documents\\mc-player-list-bot\\commands\\monitor.js");
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once('ready', () => {
    console.log('beep, bot ready');
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if(interaction.commandName === 'monitor'){
		interaction.reply('ok');
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});