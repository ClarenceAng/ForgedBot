const fetch = require("node-fetch");

module.exports = (client) => {
  const token = process.env.CANVAS_TOKEN;
  const base = process.env.CANVAS_BASE;
  const courseId = process.env.CANVAS_COURSE_ID;

  // Parse multiple channels
  const channelIds = process.env.CANVAS_DISCORD_CHANNELS.split(",");

  let lastChecked = new Date();

  async function checkAnnouncements() {
    try {
      const url = `${base}/api/v1/announcements?context_codes[]=course_${courseId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch Canvas announcements:", res.statusText);
        return;
      }

      const data = await res.json();

      // Only new announcements since last check
      const newAnnouncements = data.filter((ann) => {
        const ts = new Date(ann.posted_at || ann.created_at);
        return ts > lastChecked;
      });

      if (newAnnouncements.length > 0) {
        newAnnouncements.forEach((ann) => {
          const embed = {
            title: `📢 New Announcement: ${ann.title}`,
            description: ann.message.replace(/<[^>]*>?/gm, ""), // strip HTML
            url: ann.html_url,
            color: 0x2a9d8f,
            timestamp: ann.posted_at,
          };

          // Send to all channels
          channelIds.forEach((id) => {
            const channel = client.channels.cache.get(id.trim());
            if (channel) {
              channel.send({
                content: "@everyone",
                embeds: [embed],
              });
            }
          });
        });
      }

      lastChecked = new Date();
    } catch (err) {
      console.error("Error checking announcements:", err);
    }
  }

  setInterval(checkAnnouncements, 60 * 1000);
};
