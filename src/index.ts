import { Bot, InputFile, Keyboard } from 'grammy';
import { run } from "@grammyjs/runner";
import { get } from "https";
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_TOKEN);

bot.command('start', async (ctx) => {
    const message = 'Вітаю! Натисніть кнопку "Отримати карту", щоб отримати зображення карти тривог України у даний момент часу';
    const options = { reply_markup: { resize_keyboard: true, keyboard: new Keyboard().text('Отримати карту').build() } };
    await ctx.reply(message, options)
});

bot.hears('Отримати карту', async (ctx) => {
    await ctx.reply('⌛Завантаження')
    await ctx.replyWithPhoto(new InputFile(await processImage(await urlToBuffer('https://alerts.com.ua/map.png'))))
    await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
})

run(bot);

async function processImage(image: Buffer): Promise<Buffer> {
    return await sharp(image)
        .recomb([
            [.9, 0, .1],
            [0, .5, .5],
            [.05, .95, 0],
        ])
        .modulate({
            saturation: 1.1,
            brightness: 0.9
        })
        .flatten({ background: '#1f2914' })
        .extend({
            top: 25,
            bottom: 25,
            left: 25,
            right: 25,
            background: '#1f2914'
        })
        .toBuffer();
}

function urlToBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const data: Uint8Array[] = [];
        get(url, (res) => {
            res
                .on("data", (chunk: Uint8Array) => {
                    data.push(chunk);
                })
                .on("end", () => {
                    resolve(Buffer.concat(data));
                })
                .on("error", (err) => {
                    reject(err);
                });
        });
    });
}