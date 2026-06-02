export async function sendDiscordNotification(message, env) {
  if (!env.DISCORD_WEBHOOK_URL) {
    return { skipped: true, reason: 'DISCORD_WEBHOOK_URL is not configured.' };
  }

  const payload = {
    embeds: [
      {
        title: message.title || 'GAGA Update',
        description: message.description || '',
        color: 0x171512
      }
    ]
  };

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return { ok: response.ok };
}
