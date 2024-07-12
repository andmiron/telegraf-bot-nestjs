# NestJS Telegraf bot
The main goal was to learn as much as I could so the project may seem **overenineered**. Telegram bot is easily can be written in plain JavaScript but I chose Typescript for learning purposes.
It was quite a challenge to go through Telegraf docs and connect them with NestJS. NestJS modular design allows to building of scalable and maintainable applications.

> I wrote a little article to help people understand it more deeply. It can be found *[here](https://medium.com/@sylneyshii/telegraf-guide-e53cdc4e625b)*.

### Project Structure
```powershell
│   app.module.ts
│   bot.update.ts
│   main.ts
│
├───common
│       bot.commands.ts
│       bot.constants.ts
│       user.model.ts
│
├───config
│       env.vars.ts
│       logger.options.ts
│
├───interfaces
│       create.user.dto.ts
│       custom.scene.context.ts
│
├───scenes
│       subscribe.scene.ts
│       weather.scene.ts
│
├───services
│       cron.service.ts
│       db.service.ts
│       time.converter.ts
│       weather.service.ts
│
└───utils
        bot.command.creator.ts
        string.generator.ts

```

### Main features

Basically, the bot allows users to get instant weather forecasts based on the user's location. Also, users can subscribe to weather updates to get them every day at the specified time.

|package|desciption|
|---------|---------|
|nestjs-telegraf|project library|
|nestjs-pino|logger|
|mongodb-memory-server|in-memory mongodb|
|nestjs/schedule|run cron jubs|

### Bot commands 

- `/start` - Start the bot and get list of available commands
- `/weather`- Get local weather update
- `/subscribe` - Set time when user wants to get weather update
- `/unsubscribe` - Cancel subscription
- `/check` - Check subscription
- `/update` - Update existing subscription

## Installation

```bash
git clone https://github.com/andmiron/nestjs-telegraf-bot.git

cd nestjs-telegraf-bot

npm ci

TZ=UTC
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEATHER_API_KEY=weather_api_key
GOOGLE_API_KEY=google_api_key

npm start
```
