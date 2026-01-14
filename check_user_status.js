const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envVars = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            envVars[key] = val;
        }
    });
} catch (e) {
    console.log("Could not read .env.local");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
// Try service role key first, then anon key (but anon key can't list users usually, but let's see)
// Actually we need service role key to list users.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("No service role key found. Cannot verify user.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = 'tazhenxinjian2@gmail.com';
    console.log(`Checking user: ${email}...`);

    // admin.listUsers() is paginated but likely small number for now
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("List users error:", error);
        return;
    }

    const user = data.users.find(u => u.email === email);
    if (user) {
        console.log(`User Found! ID: ${user.id}`);
        console.log(`Providers: ${JSON.stringify(user.app_metadata.providers)}`);
        console.log(`Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`Last Sign In: ${user.last_sign_in_at}`);
    } else {
        console.log("User NOT found in Supabase Auth.");
        console.log("Total users checked:", data.users.length);
    }
}

main();
