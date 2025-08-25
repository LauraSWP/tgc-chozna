import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running card definitions migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/004_add_card_definitions.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the migration worked
    const { data: cardCount, error: countError } = await supabase
      .from('card_definitions')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('Error checking card count:', countError);
    } else {
      console.log(`Total card definitions in database: ${cardCount?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
