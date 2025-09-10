import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "✨ Раді вітати тебе, світла душа, у просторі тиші Vipassana.Yoga 🙏\n\n" +
        "Вже зовсім скоро відбудеться благодійний ретрит 8–12 жовтня 2025 року.\n" +
        "Це час глибокої практики та внутрішнього оновлення.\n\n" +
        "Ретрит проходитиме у двох форматах:\n" +
        "⛰️ Офлайн — у живій присутності в колі однодумців у Карпатах\n" +
        "💻 Онлайн — з можливістю практикувати з будь-якої точки світу\n\n" +
        "Щоб дізнатися більше, зареєструватися чи підтримати проєкт — обери потрібний пункт нижче 👇"
    );

    bot.sendMessage(msg.chat.id,
        "1️⃣ РЕТРИТ КАРПАТИ \nреєстрація як учасника 🧘‍♀️\n\n" +
        "2️⃣ СЛУЖІННЯ НА РЕТРИТІ\nдеталі і реєстрація 🙏🏻\n\n" +
        "3️⃣ ОНЛАЙН РЕТРИТ \nдеталі і реєстрація 👨‍💻\n\n" +
        "4️⃣ ДОНАТ \nблагодійний внесок для підтримки ретриту 🫶🏻\n\n" +
        "5️⃣ ПИТАННЯ \nВи можете задати питання команді — просто напишіть повідомлення і ми вам відповімо ☀️",
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "1️⃣", callback_data: "option_1" },
                        { text: "2️⃣", callback_data: "option_2" }
                    ],
                    [
                        { text: "3️⃣", callback_data: "option_3" },
                        { text: "4️⃣", callback_data: "option_4" }
                    ]
                ]
            }
        }
    );

    // Обработка нажатий на кнопки
    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        let responseText = "";

        switch (query.data) {
            case "option_1":
                responseText = "Ви обрали РЕТРИТ КАРПАТИ 🧘‍♀️\n\nПравила проходження ретриту за командою /rules\nРеєстрація як учасника: [посилання або деталі тут]";
                break;
            case "option_2":
                responseText = "Ви обрали СЛУЖІННЯ НА РЕТРИТІ 🙏🏻\n\nПравила проходження ретриту за командою /rules\nДеталі і реєстрація: [посилання або деталі тут]";
                break;
            case "option_3":
                responseText = "Ви обрали ОНЛАЙН РЕТРИТ 👨‍💻\n\nПравила проходження ретриту за командою /rules\nДеталі і реєстрація: [посилання або деталі тут]";
                break;
            case "option_4":
                responseText = "Ви обрали ДОНАТ 🫶🏻\nБлагодійний внесок для підтримки ретриту: [посилання або деталі тут]";
                break;
            default:
                responseText = "Невідома опція.";
        }

        bot.answerCallbackQuery(query.id)
            .then(() => {
                bot.sendMessage(chatId, responseText);
            });
    });
    console.log(msg.chat);
});

// Рассылка условий
bot.onText(/\/rules/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "✨ Умови ретриту:\n" +
        "- Харчування вегетаріанська \n" +
        "- Не використовувати гаджети\n" +
        "- Розпорядок дня за командою /schedule"
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

    // Если это сообщение от поддержки — выходим
    if (chatId.toString() === process.env.SUPPORT_CHAT_ID) return;

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
        // Сохраняем соответствие: message_id пересланного → chat.id пользователя
        replyMap.set(sentMessage.message_id, chatId);
      });
  }
});

bot.on("message", (msg) => {
    // Проверяем: это сообщение в группе поддержки?
    if (msg.chat.id.toString() !== process.env.SUPPORT_CHAT_ID) return;
    if (!msg.reply_to_message) return;

    // Извлекаем настоящего автора вопроса
    const fwd = msg.reply_to_message.forward_from
        || msg.reply_to_message.forward_origin?.sender_user;

    if (!fwd) {
        bot.sendMessage(msg.chat.id, "⚠️ Не удалось определить пользователя для ответа.");
        return;
    }

    const userId = fwd.id;

    // Отправляем ответ пользователю
    bot.sendMessage(userId, "📩 Відповідь підтримки:\n" + msg.text)
        .then(() => {
            bot.sendMessage(msg.chat.id, "✅ Відповідь надіслана користувачу.");
        })
        .catch(err => {
            bot.sendMessage(msg.chat.id, "⚠️ Не вдалося надіслати повідомлення користувачу.");
            console.error(err);
        });
});