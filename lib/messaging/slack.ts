export interface SlackMessage {
  type: string
  text: string
  user: string
  ts: string
  channel: string
}

export async function processSlackMessage(
  message: SlackMessage,
  userId: string
): Promise<void> {
  // This will be called from webhook handler
  // Message will be saved to database via API
}

