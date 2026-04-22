import { query } from '../src/db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const promoteUser = async (email: string) => {
    try {
        const roleResult = await query("SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1");
        if (roleResult.rows.length === 0) return;
        const superAdminRoleId = roleResult.rows[0].id;
        await query(
            "UPDATE users SET role_id = $1 WHERE email = $2 RETURNING id, email",
            [superAdminRoleId, email]
        );
        console.log(`Success! User ${email} is now a super_admin.`);
    } catch (error) {
        console.error("Operation failed:", error);
    } finally {
        process.exit(0);
    }
};

promoteUser(process.argv[2] || 'saitotinjapit2@gmail.com');
