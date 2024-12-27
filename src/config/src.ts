import Discord from 'discord.js'

const sources = {
  Emojis: {
    Cash: '<:satoru_coin:1197558510293106739>',
    Edit: '<:edit:1197236810858889268>',
    Loading: '<a:loading:1197500658681651241>',
    List: '<:list:1197940808821788764>',
    Refresh: '<:refresh:1197940806166777907>',
    Shop: '<:shop:1197574992976695407>',
    ArrowUp: '<:arrowup:1197942018484207686>',
    Question: '<:question:1197942659352891503>'
  },
  Media: {
    MoneyRainGIF: 'https://i.imgur.com/TUiWKTr.gif',
    CashThumbnail: 'https://i.imgur.com/41hYgCl.png',
    BlackjackThumbnail: 'https://i.imgur.com/k1mfKdv.png',
    ArcadeThumbnail: 'https://i.imgur.com/1luLYIo.png',

    BlackJackWinGIF: 'https://cdn.discordapp.com/attachments/1204766604777492500/1204773775229325403/Win.gif?ex=65d5f403&is=65c37f03&hm=4c0a84c43cd004e2a4fd05939af7e2c337b8467677bb7424065e9933a46fc037&',
    BlackJackLoseGIF: 'https://cdn.discordapp.com/attachments/1204766604777492500/1204773774839517204/Lost.gif?ex=65d5f403&is=65c37f03&hm=94373b76a0511dd0acbae18ea44c7850f9b861026d48b2d21ef3ebb4614bf0cf&',
    ShopImage: 'https://cdn.discordapp.com/attachments/1204766604777492500/1204766694791446528/ShopRoles.png?ex=65d5ed6b&is=65c3786b&hm=0a06a3d2c7c39b903949d57eca39b0575a22adaf6830c40bff776338ca4330cf&'
  },
  Colors: {
    DarkBlurple: Discord.resolveColor(Discord.resolveColor('#302c34'))
  } as Record<string, number>
}

export default sources
