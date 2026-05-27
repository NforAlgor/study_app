const cron = require("node-cron");
const db   = require("../config/db");
const { sendDeadlineReminder } = require("../services/emailService");
const { sendPushNotification } = require("../services/pushService");

/**
 * Core reminder logic — shared between cron and manual trigger
 * Finds all users with tasks due in 0-3 days and notifies them
 */
const runReminders = () => {
  console.log("🔔 Running deadline reminder job…");

  const query = `
    SELECT
      u.id        AS user_id,
      u.name,
      u.email,
      t.id        AS task_id,
      t.title,
      t.deadline,
      t.importance,
      t.difficulty,
      DATEDIFF(t.deadline, CURDATE()) AS days_left
    FROM users u
    JOIN tasks t ON t.user_id = u.id
    WHERE
      t.status != 'completed'
      AND DATEDIFF(t.deadline, CURDATE()) BETWEEN 0 AND 3
    ORDER BY u.id, days_left ASC
  `;

  db.query(query, async (err, rows) => {
    if (err) {
      console.error("❌ Reminder job DB error:", err.message);
      return;
    }

    if (rows.length === 0) {
      console.log("✅ No upcoming deadlines to remind about.");
      return;
    }

    // Group rows by user
    const userMap = {};
    rows.forEach((row) => {
      if (!userMap[row.user_id]) {
        userMap[row.user_id] = {
          name:  row.name,
          email: row.email,
          tasks: [],
        };
      }

      // Compute priority score (same formula as planner)
      const daysLeft      = Math.max(1, row.days_left);
      const deadlineWeight = Math.min(3, Math.ceil(10 / daysLeft));
      const score = parseFloat(
        (deadlineWeight * 0.5 + row.difficulty * 0.3 + row.importance * 0.2).toFixed(2)
      );

      userMap[row.user_id].tasks.push({
        title:    row.title,
        deadline: row.deadline,
        days_left: row.days_left,
        score,
      });
    });

    // For each user — send email + push
    for (const userId of Object.keys(userMap)) {
      const { name, email, tasks } = userMap[userId];

      // ── 1. Email reminder ──────────────────────────────
      try {
        await sendDeadlineReminder(email, name, tasks);
        console.log(`📧 Email sent to ${email} (${tasks.length} tasks)`);
      } catch (emailErr) {
        console.error(`❌ Email failed for ${email}:`, emailErr.message);
      }

      // ── 2. Push notifications ──────────────────────────
      // Fetch all stored push subscriptions for this user
      const subQuery = "SELECT subscription FROM push_subscriptions WHERE user_id = ?";
      db.query(subQuery, [userId], async (subErr, subs) => {
        if (subErr || subs.length === 0) return;

        const taskWord = tasks.length === 1 ? "task" : "tasks";
        const urgentTask = tasks[0]; // highest priority (already sorted by days_left)

        const payload = {
          title: `⏰ StudyFlow: ${tasks.length} ${taskWord} due soon`,
          body:  `"${urgentTask.title}" is due ${
            urgentTask.days_left === 0 ? "TODAY" :
            urgentTask.days_left === 1 ? "tomorrow" :
            `in ${urgentTask.days_left} days`
          }. Open your study plan.`,
          url: "/planner",
        };

        for (const row of subs) {
          try {
            const subscription = JSON.parse(row.subscription);
            await sendPushNotification(subscription, payload);
            console.log(`🔔 Push sent to user ${userId}`);
          } catch (pushErr) {
            // Subscription expired or invalid — remove it
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              db.query(
                "DELETE FROM push_subscriptions WHERE user_id = ? AND subscription = ?",
                [userId, row.subscription]
              );
              console.log(`🗑️  Removed expired push subscription for user ${userId}`);
            } else {
              console.error(`❌ Push failed for user ${userId}:`, pushErr.message);
            }
          }
        }
      });
    }
  });
};

/**
 * Schedule: every day at 7:00 AM
 * Cron syntax: minute hour day month weekday
 */
const startReminderJob = () => {
  cron.schedule("0 7 * * *", () => {
    runReminders();
  });
  console.log("⏰ Reminder cron job scheduled — runs daily at 7:00 AM");
};

module.exports = { startReminderJob, runReminders };