import { wrapEmail } from "./templates"

export const getUsageWarningEmailTemplate = (name: string, usageLimit: number) => {
    const content = `
    <div class="greeting">Heads Up: You're Crushing It! 🔥</div>
    <div class="message">
      Hi ${name},<br><br>
      You've used <strong>80%</strong> of your monthly generations. That's a lot of creative output!
      <br><br>
      You have about <strong>${Math.floor(usageLimit * 0.2)}</strong> generations left before you hit your limit.
      <br><br>
      Don't let your momentum stop. If you need more power, we're ready for you.
    </div>
    <div class="button-container">
      <a href="https://hookory.vercel.app/dashboard" class="button">Check Usage</a>
    </div>
  `
    return wrapEmail("Usage Alert: 80% Used", content)
}

export const getUsageLimitEmailTemplate = (name: string) => {
    const content = `
      <div class="greeting">You've Maxed Out! 🚀</div>
      <div class="message">
        Hi ${name},<br><br>
        Incredible work! You've officially used <strong>100%</strong> of your monthly generations.
        <br><br>
        Your content engine is taking a breather until your next cycle, or until you upgrade to unlock more.
        <br><br>
        Ready to keep going? Upgrade now to lift the cap immediately.
      </div>
      <div class="button-container">
        <a href="https://hookory.vercel.app/usage" class="button">Upgrade Now</a>
      </div>
    `
    return wrapEmail("Action Required: Monthly Limit Reached", content)
}
