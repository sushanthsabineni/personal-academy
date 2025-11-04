declare module 'web-push' {
  export interface VapidKeys {
    publicKey: string
    privateKey: string
  }

  export interface PushSubscription {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }

  export interface SendNotificationOptions {
    TTL?: number
  }

  export function generateVAPIDKeys(): VapidKeys
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void
  export function sendNotification(
    subscription: PushSubscription,
    payload: string,
    options?: SendNotificationOptions
  ): Promise<unknown>
}
