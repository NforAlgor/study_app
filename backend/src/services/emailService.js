const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send deadline reminder email to a student
 * @param {string} to        - recipient email
 * @param {string} name      - recipient name
 * @param {Array}  tasks     - array of { title, deadline, days_left, score }
 */
exports.sendDeadlineReminder = async (to, name, tasks) => {
  const taskRows = tasks
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #F0EEF8;font-size:14px;color:#0D0F14;">
          ${t.title}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F0EEF8;font-size:14px;text-align:center;">
          <span style="background:${t.days_left <= 1 ? "#FEE2E2" : "#FEF3C7"};color:${
            t.days_left <= 1 ? "#DC2626" : "#D97706"
          };padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">
            ${t.days_left === 0 ? "Due TODAY" : t.days_left === 1 ? "Due tomorrow" : `${t.days_left} days left`}
          </span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F0EEF8;font-size:13px;color:#7C6FFF;text-align:center;font-family:monospace;">
          Score: ${t.score}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#F5F4FC;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #E8E6F5;">

      <!-- Header -->
      <div style="background:#0D0F14;padding:28px 32px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;background:#7C6FFF;border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:18px;">📚</div>
          <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;">StudyFlow</span>
        </div>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">Smart Study Planner</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="font-size:16px;color:#0D0F14;margin:0 0 6px;">Hi <strong>${name}</strong> 👋</p>
        <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6;">
          You have <strong style="color:#7C6FFF;">${tasks.length} task${tasks.length > 1 ? "s" : ""}</strong>
          with approaching deadlines. Here's your priority list from StudyFlow:
        </p>

        <!-- Tasks table -->
        <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #E8E6F5;">
          <thead>
            <tr style="background:#F5F4FC;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Task</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Deadline</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Priority</th>
            </tr>
          </thead>
          <tbody>${taskRows}</tbody>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin-top:28px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/planner"
             style="display:inline-block;background:#7C6FFF;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;">
            View My Study Plan →
          </a>
        </div>

        <p style="font-size:12px;color:#9CA3AF;text-align:center;margin-top:24px;line-height:1.6;">
          You're receiving this because you have tasks due within 3 days.<br>
          This reminder is sent daily at 7:00 AM.
        </p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `⏰ StudyFlow: ${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon — check your plan`,
    html,
  });
};