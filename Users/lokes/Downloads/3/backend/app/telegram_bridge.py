"""Zoey OS Telegram Bridge — Lightweight long-polling bot for LifeOS ASCEND."""

import logging
import os
import json
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

from app.state_graph import run_agent_graph

log = logging.getLogger(__name__)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f"Hi {user.mention_html()}! I am Zoey OS, your LifeOS ASCEND agent.\n"
        "Send me a message to get started!"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Process incoming messages using the 5-layer agent graph."""
    text = update.message.text
    user_id = str(update.effective_user.id)
    
    # We use the telegram user ID as a session_id suffix
    session_id = f"tg-{user_id}"
    
    # Send a typing indicator to show we're thinking
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action='typing')
    
    try:
        # Run the agent graph headlessly
        # Execution mode "auto" means no Human-in-the-Loop strict pauses here
        final_state = await run_agent_graph(
            user_input=text,
            user_context={"source": "telegram", "user_id": user_id},
            session_id=session_id,
            execution_mode="auto"
        )
        
        response = final_state.get("final_response", "I'm sorry, I couldn't process that.")
        
        # If there are pending actions, we can mention them
        pending = final_state.get("pending_actions", [])
        if pending:
            actions_summary = "\n".join([f"• {a['action']} on {a['store']}" for a in pending])
            response += f"\n\n⚙️ <i>Pending UI actions queued for your web app:</i>\n{actions_summary}"
        
        await update.message.reply_text(response, parse_mode="HTML")
        
    except Exception as e:
        log.error("Telegram message handling failed: %s", e)
        await update.message.reply_text("Oops! Something went wrong in the LifeOS ASCEND backend.")

async def start_telegram_bot():
    """Starts the Telegram bot using long-polling. Designed to run as a background task."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        log.warning("TELEGRAM_BOT_TOKEN not found. Telegram bridge disabled.")
        return

    # Use python-telegram-bot Application
    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    log.info("Telegram bridge initialising long polling...")
    
    # Run polling. 
    # run_polling() is typically blocking, but we can initialize and start the app manually for asyncio
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    
    # Keep it running
    # We don't await application.updater.stop() until shutdown, which would be handled globally
