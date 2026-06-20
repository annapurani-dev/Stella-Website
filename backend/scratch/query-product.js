const db = require('../db');

async function main() {
  try {
    const res = await db.query('SELECT name, image_url, additional_images, specs FROM products WHERE id = 1');
    if (res.rows.length > 0) {
      console.log("Product:", JSON.stringify(res.rows[0], null, 2));
    } else {
      console.log("Product ID 1 not found");
    }
  } catch (err) {
    console.error("Error querying product:", err);
  } finally {
    await db.end();
  }
}

main();
