/* eslint-disable @typescript-eslint/no-explicit-any */
export class MailhogClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:8025') {
    this.baseUrl = baseUrl;
  }

  async getMessages() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      throw new Error('Failed to fetch messages from Mailhog');
    }
  }

  async getLatestMessage() {
    const messages = await this.getMessages();
    return messages.items?.[0] || null;
  }

  async getMessagesByRecipient(email: string) {
    const messages = await this.getMessages();
    return (
      messages.items?.filter((msg: any) =>
        msg.To?.some((to: any) => to.Mailbox === email.split('@')[0])
      ) || []
    );
  }

  async clearMessages() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/messages`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Wait for deletion to complete
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increased from 50ms
    } catch (error) {
      console.warn(
        'Failed to clear Mailhog messages:',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  extractVerificationCode(messageBody: string): string | null {
    // First, decode quoted-printable encoding
    let decodedBody = messageBody;

    // Decode quoted-printable characters - handle =3D specifically first
    decodedBody = decodedBody.replace(/=3D/g, '='); // =3D becomes =
    decodedBody = decodedBody.replace(/=20/g, ' '); // =20 becomes space
    decodedBody = decodedBody.replace(/=\r?\n/g, ''); // Remove soft line breaks

    // NOTE: We intentionally avoid the general hex replacement /=([0-9A-F]{2})/g
    // because it would convert =09 to tab character, corrupting verification codes

    // Extract the verification code - simple alphanumeric pattern
    const codeMatch = decodedBody.match(/confirm-account\?code=([a-zA-Z0-9]+)/);

    return codeMatch ? codeMatch[1] : null;
  }

  extractPasswordResetCode(messageBody: string): string | null {
    // First, decode quoted-printable encoding
    let decodedBody = messageBody;

    // Decode quoted-printable characters - handle =3D specifically first
    decodedBody = decodedBody.replace(/=3D/g, '='); // =3D becomes =
    decodedBody = decodedBody.replace(/=20/g, ' '); // =20 becomes space
    decodedBody = decodedBody.replace(/=\r?\n/g, ''); // Remove soft line breaks

    // Extract the password reset code - simple alphanumeric pattern
    const codeMatch = decodedBody.match(/reset-password\?code=([a-zA-Z0-9]+)/);

    return codeMatch ? codeMatch[1] : null;
  }

  async waitForEmail(recipient: string, timeout = 10000): Promise<any> {
    const startTime = Date.now();
    const checkInterval = 200; // Increased from 100ms for more reliable checks
    let lastEmailCount = 0;
    let consecutiveChecks = 0;
    const maxConsecutiveChecks = 3; // Increased back to 3

    while (Date.now() - startTime < timeout) {
      try {
        const messages = await this.getMessagesByRecipient(recipient);

        // If we found messages, wait to ensure we get the latest one
        if (messages.length > lastEmailCount) {
          lastEmailCount = messages.length;
          consecutiveChecks = 0;

          // Wait for email processing
          await new Promise((resolve) => setTimeout(resolve, 300));

          const latestMessages = await this.getMessagesByRecipient(recipient);
          if (latestMessages.length > 0) {
            // Delay to ensure email content is available
            await new Promise((resolve) => setTimeout(resolve, 100));
            return latestMessages[0]; // Return the most recent message
          }
        } else if (messages.length > 0) {
          // We have messages but count didn't change
          consecutiveChecks++;
          if (consecutiveChecks >= maxConsecutiveChecks) {
            return messages[0];
          }
        }

        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      } catch (error) {
        // Continue waiting if there's a temporary error
        console.warn('Warning: Error checking for email:', error);
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      }
    }

    throw new Error(`No email received for ${recipient} within ${timeout}ms`);
  }
}
