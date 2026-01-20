export interface WhatsAppMessage {
  from: string
  to: string
  message_id: string
  timestamp: string
  type: string
  text?: {
    body: string
  }
}

export async function processWhatsAppMessage(
  message: WhatsAppMessage,
  userId: string
): Promise<void> {
  // This will be called from webhook handler
  // Message will be saved to database via API
}

