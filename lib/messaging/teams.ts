export interface TeamsMessage {
  id: string
  messageType: string
  createdDateTime: string
  from: {
    user: {
      id: string
      displayName: string
    }
  }
  body: {
    content: string
  }
  channelIdentity?: {
    channelId: string
  }
}

export async function processTeamsMessage(
  message: TeamsMessage,
  userId: string
): Promise<void> {
  // This will be called from webhook handler
  // Message will be saved to database via API
}

