const Discord = require('discord.js');
const { Client, Intents } = require("discord.js");
const token = require('./token.json');

const client = new Discord.Client({ intents: [Intents.ALL, Intents.PRIVILEGED, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS] });

//스레드 생성용 채널 카테고리 ID
const parentTextChannelId = "849115692245843989";

client.login(token.discord_token);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


// 메세지 핸들러
client.on('message',async function(msg){

    // 해당 채널이 생성카테고리에 포함된 채널일경우 삭제 명령어를 가능
    if(msg.content === "!채널삭제" && msg.channel.parentID == parentTextChannelId){
        msg.channel.delete('채널삭제');
    }

    // 스레드 생성 로직
    if(msg.content.startsWith("!채널생성 ")){
        const _str = msg.content.substr(6);
        const randStr = Math.random().toString(36).substr(2,11);
        const parentCnl = await msg.guild.channels.cache.get(parentTextChannelId)

        const position = parseInt(await msg.guild.channels.cache.get(parentTextChannelId).position) + 1;

        await msg.guild.channels.create("#"+_str+"_"+randStr, {
            type: 'text',
            parent: parentCnl,
            permissionOverwrites: [
                {
                    id: "847704235965022218",
                    allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                    id: msg.author.id,
                    allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                    id: msg.guild.roles.everyone,
                    deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
            ],
        }).then(c => {
            msg.reply("<@"+msg.member.id+">님이 채널생성 생성하였습니다. <#"+c.id+">")
                .then(m => {
                m.react('%E2%96%B6%EF%B8%8F')
            })
        }).catch();

        return null;
    }
});


// 이모지  이벤트 핸들러
client.on('messageReactionAdd', async (reaction, user) => {

    if(reaction.message.author.id == "847704235965022218" && reaction.emoji.identifier == "%E2%96%B6%EF%B8%8F" && user.id != "847704235965022218"){

        // 이모지가 달린 글에서 텍스트 채널 이름 파싱
        const reactCnlId = reaction.message.content.split("<#")[1].split(">")[0];

        // 파싱된 이름을 바탕으로 해당 메세지로 생성된 채널 확인
        const threadCnl =  await reaction.message.guild.channels.cache.find( c => c.id == reactCnlId);

        if(threadCnl){

            // 해당 채널에 유저의 권한 추가
            await threadCnl.overwritePermissions([
                {
                    id: user.id,
                    allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
            ]);
        }
    }
});
