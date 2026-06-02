import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Send meal plan reminder email */
export async function sendMealPlanReminder(
  to: string,
  userName: string,
  weekStart: string,
  recipeCount: number
) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return { success: false, reason: "not_configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Cookify <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Your meal plan for this week",
    html: `
      <h1>Hi ${userName},</h1>
      <p>Your meal plan for the week starting <strong>${weekStart}</strong> is ready!</p>
      <p>You have <strong>${recipeCount}</strong> recipes planned.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/meal-plan">View your meal plan</a></p>
    `,
  });

  if (error) throw error;
  return { success: true, data };
}
