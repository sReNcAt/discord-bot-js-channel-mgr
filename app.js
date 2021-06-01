const Discord = require('discord.js');
const { Client, Intents } = require("discord.js");
const token = require('./token.json');

const client = new Discord.Client({ intents: [Intents.ALL, Intents.PRIVILEGED, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INTEGRATIONS] });

//스레드 생성용 채널 카테고리 ID
const parentTextChannelId = "849115692245843989";

// 봇 클라이언트 시작
client.login(token.discord_token);

// 봇 클라이언트 실행 성공시
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
        //동일채널 방지를 위하여 UUID를 붙암
        const randStr = Math.random().toString(36).substr(2,11);
        
        // 채널 카테고리 ID를 불러옴
        const parentCnl = await msg.guild.channels.cache.get(parentTextChannelId);
        
        // 채널생성
        await msg.guild.channels.create("#"+_str+"_"+randStr, {
            type: 'text',                                               // 채팅채널타입
            parent: parentCnl,                                          // 지정한 카테고리로 위치 지정
            permissionOverwrites: [
                {
                    id: "847704235965022218",                           // 봇 자신의 권한지정
                    allow: [
                        Discord.Permissions.FLAGS.VIEW_CHANNEL,         // 채널보기 허용
                        Discord.Permissions.FLAGS.MANAGE_CHANNELS,      // 채널관리 허용
                    ],
                },
                {
                    id: msg.author.id,                                  // 채널생성자 
                    allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],    // 채널보기 허용
                },
                {
                    id: msg.guild.roles.everyone,                       // 모든사용자
                    deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],     // 채널보기 거부
                },
            ],
        }).then(c => {
            msg.reply("<@"+msg.member.id+">님이 채널생성 생성하였습니다. <#"+c.id+">")
                .then(m => {
                m.react('%E2%96%B6%EF%B8%8F');                          // 이모지로 채널참여를 받기위하여 보낸 메세지에 이모지를 달음.
            })
        }).catch(e => {
            console.log(e);
        });

        return null;
    }
});


// 이모지  이벤트 핸들러
client.on('messageReactionAdd', async (reaction, user) => {
    
    // 특정 조건이 되는 이모지 클릭시
    
    if(reaction.message.author.id == "847704235965022218" && reaction.emoji.identifier == "%E2%96%B6%EF%B8%8F" && user.id != "847704235965022218"){

        // 이모지가 달린 글에서 텍스트 채널 이름 파싱
        const reactCnlId = reaction.message.content.split("<#")[1].split(">")[0];

        // 파싱된 이름을 바탕으로 해당 메세지로 생성된 채널 확인
        const threadCnl =  await reaction.message.guild.channels.cache.find( c => c.id == reactCnlId);

        if(threadCnl){
            var newPermission = {
                id: user.id,
                allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
            };
            const permissionArr = [];

            // 채널의 기존 권한 목록을 가져옴
            await threadCnl.permissionOverwrites.map(p => {
                permissionArr.push({
                    id : p.id,
                    type : p.type,
                    allow : p.allow,
                    deny : p.deny
                });
            });
            
            // 이모지 누른 사람에게 권한 허용
            permissionArr.push({
                id: user.id,
                allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
            });

            // 해당 채널에 유저의 권한 추가
            await threadCnl.overwritePermissions(permissionArr);
        }
    }
});
