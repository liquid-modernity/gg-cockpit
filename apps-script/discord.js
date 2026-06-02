/**
 * Discord webhook integration.
 */

function sendDiscordWebhook_(payload) {
  const props = PropertiesService.getScriptProperties();
  const webhookUrl = props.getProperty('DISCORD_WEBHOOK_URL');

  if (!webhookUrl) {
    Logger.log('DISCORD_WEBHOOK_URL not configured.');
    return;
  }

  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
