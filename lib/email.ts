import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing from environment variables.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const data = await resend.emails.send({
            from: "Hookory <onboarding@resend.dev>", // Using testing domain. Verify 'hookor.com' in Resend dashboard to use 'noreply@hookor.com'
            to,
            subject,
            html,
        });

        console.log(`[Email] Sent to ${to}: ${data.data?.id}`);
        return { success: true, data };
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error);
        return { success: false, error };
    }
}
