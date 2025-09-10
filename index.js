import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "Вітаємо на ретриті 🌿\n\n" +
        "Ви можете:\n" +
        "1️⃣ Ознайомитись з умовами — /rules\n" +
        "2️⃣ Задати питання підтримці — просто напишіть повідомлення."
    );

    console.log(msg.chat);
});

// Рассылка условий
bot.onText(/\/rules/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "✨ Умови ретриту:\n" +
        "- Розпорядок дня ...\n" +
        "- Харчування ...\n" +
        "- Правила тиші ..."
    );
});

// Отправка ссылки вручную
bot.onText(/\/link/, (msg) => {
    bot.sendMessage(msg.chat.id, "Ось корисне посилання: https://example.com");
});

// Любое сообщение = вопрос → автоответ + пересылка в чат поддержки
bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    // Игнорируем команды
    if (msg.text && msg.text.startsWith("/")) return;

    // Автоответ пользователю
    bot.sendMessage(chatId,
        "Дякуємо за питання, світла душа 🙏\n" +
        "Спеціаліст з підтримки звʼяжеться з вами у робочий час (8:00–20:00) " +
        "чи як тільки зʼявиться можливість."
    );


    // Пересылаем в чат поддержки
    if (process.env.SUPPORT_CHAT_ID) {
        bot.forwardMessage(process.env.SUPPORT_CHAT_ID, chatId, msg.message_id)
            .then((sentMessage) => {
                // Запоминаем: ID пересланного → ID пользователя
                replyMap.set(sentMessage.message_id, chatId);
            });
    }
});

// Ловим ответы организаторов (reply)
bot.on("message", (msg) => {
    if (msg.chat.id.toString() !== process.env.SUPPORT_CHAT_ID) return;
    if (!msg.reply_to_message) return; // только если ответ на сообщение

    const originalMessageId = msg.reply_to_message.message_id;
    const userId = replyMap.get(originalMessageId);

    if (userId) {
        bot.sendMessage(userId, "📩 Відповідь підтримки:\n" + msg.text);
        // Можно ещё уведомить организатора, что сообщение ушло
        bot.sendMessage(msg.chat.id, "✅ Відповідь надіслано користувачу.");
    }
});