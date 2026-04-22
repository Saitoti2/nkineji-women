import { query } from '../src/db/connection.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const promoteUser = async (email: string) => {
    try {
        console.log(`Searching for role: super_admin...`);
        const roleResult = await query("SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1");
        
        if (roleResult.rows.length === 0) {
            console.error("Error: Role 'super_admin' not found in database.");
            return;
        }
        
        const superAdminRoleId = roleResult.rows[0].id;
        
        console.log(`Promoting user ${email} to super_admin (Role ID: ${superAdminRoleId})...`);
        const result = await query(
            "UPDATE users SET role_id = $1 WHERE email = $2 RETURNING id, email",
            [superAdminRoleId, email]
        );
        
        if (result.rows.length === 0) {
            console.warn(`Warning: User with email ${email} not found.`);
        } else {
            console.log(`Success! User ${email} is now a super_admin.`);
        }
    } catch (error) {
        console.error("Operation failed:", error);
    } finally {
        process.exit(0);
    }
};

const email = process.argv[2] || 'nkinejiwomeninitiative@gmail.com';
promoteUser(email);
