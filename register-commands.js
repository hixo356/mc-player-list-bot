require('dotenv').config();
const {REST, Routes} = require('discord.js');

const commands = [
    {
        name: 'monitor',
        description: 'Starts monitoring server',
    },
];

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )

        console.log('Slash commands were required')
    } catch (error) {
        console.log('There was an error: $(error)');
    }
})();
