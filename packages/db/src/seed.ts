import { Pool } from 'pg';
import { getTemplateSeeds } from './seeders/getTemplateSeeds';

async function seed() {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  try {
    await pool.query('BEGIN');

    // Tenant
    await pool.query(`INSERT INTO tenants(id, name) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING`, ['t_demo', 'Demo Tenant']);

    // Users
    const users = [
      { id: 'u_1', email: 'alice@example.com', phone: '+15550001111', locale: 'en', tz: 'UTC' },
      { id: 'u_2', email: 'bob@example.com', phone: '+15550002222', locale: 'en', tz: 'America/Los_Angeles' }
    ];
    for (const u of users) {
      await pool.query(
        `INSERT INTO users(id, tenant_id, email, phone, locale, timezone) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, 't_demo', u.email, u.phone, u.locale, u.tz]
      );
    }

    // Channel preferences (enabled by default); add quiet hours for u_2
    for (const u of users) {
      for (const ch of ['email','inapp','sms','push']) {
        await pool.query(
          `INSERT INTO channel_preferences(tenant_id, user_id, channel, enabled, quiet_hours)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (tenant_id, user_id, channel) DO NOTHING`,
          [
            't_demo',
            u.id,
            ch,
            true,
            u.id === 'u_2' ? { start: '22:00', end: '07:00' } : null
          ]
        );
      }
    }

    // Template overrides: disable invoice email for u_2 to test preferences
    await pool.query(
      `INSERT INTO template_overrides(tenant_id, user_id, template_key, enabled)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (tenant_id, user_id, template_key) DO NOTHING`,
      ['t_demo', 'u_2', 'billing.invoice.created', false]
    );

    // Templates from core event template seeds (auto-extend when new events are added in core)
    // Switch to migrations
    for (const t of getTemplateSeeds()) {
      if (t.subject) {
        await pool.query(
          `INSERT INTO templates(key, version, channel, locale, subject, body)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (key, version, channel, locale) DO NOTHING`,
          [t.key, t.version, t.channel, t.locale, t.subject, t.body]
        );
      } else {
        await pool.query(
          `INSERT INTO templates(key, version, channel, locale, body)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (key, version, channel, locale) DO NOTHING`,
          [t.key, t.version, t.channel, t.locale, t.body]
        );
      }
    }

    await pool.query('COMMIT');
    console.log('Seed complete.');
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Seed failed', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

