
'use server';
/**
 * @fileOverview A flow for sending shipping notifications.
 *
 * - sendShippingNotification - A function that sends a notification email.
 * - SendNotificationInput - The input type for the sendShippingNotification function.
 * - SendNotificationOutput - The return type for the sendShippingNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendNotificationInputSchema = z.string().describe("The Tag ID that is ready for shipping.");
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;


export async function sendShippingNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
    return sendShippingNotificationFlow(input);
}

// This is a mock email sending function. In a real application, you would
// integrate with an email service like SendGrid, Resend, etc.
const sendEmailTool = ai.defineTool(
    {
        name: 'sendEmail',
        description: 'Sends an email to a specified recipient.',
        inputSchema: z.object({
            to: z.string().email(),
            subject: z.string(),
            body: z.string(),
        }),
        outputSchema: z.object({
            success: z.boolean(),
        }),
    },
    async ({ to, subject, body }) => {
        console.log('--- Mock Email Sent ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: \n${body}`);
        console.log('-----------------------');
        // In a real scenario, this would return true on success from the email API
        return { success: true };
    }
);


const sendShippingNotificationFlow = ai.defineFlow(
  {
    name: 'sendShippingNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async (tagId) => {
    const result = await sendEmailTool({
        to: 'yasubuddinali@gmail.com',
        subject: `Ready for Pickup: Tag ID ${tagId}`,
        body: `The Graphics department has completed all work for Tag ID: ${tagId}. It is now ready for pickup and shipping.`
    });

    if (result.success) {
        return { success: true, message: `Notification sent for ${tagId}.` };
    } else {
        return { success: false, message: `Failed to send notification for ${tagId}.` };
    }
  }
);
