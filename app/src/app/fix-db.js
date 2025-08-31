const mysql = require('mysql2/promise');

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: 'turntable.proxy.rlwy.net',
    port: 42461,
    user: 'root',
    password: 'mtTAEVKlYuhmCMjvTFYETDoVqTWgVBOr',
    database: 'railway'
  });

  try {
    // Check current table structure
    const [rows] = await connection.execute('DESCRIBE schools');
    console.log('Current table structure:', rows);

    // Fix the auto-increment issue (without redefining primary key)
    await connection.execute(`
      ALTER TABLE schools 
      MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT
    `);
    
    console.log('Table updated successfully!');
    
    // Verify the change
    const [newRows] = await connection.execute('DESCRIBE schools');
    console.log('Updated table structure:');
    newRows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} | Key: ${row.Key} | Extra: ${row.Extra}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixDatabase();