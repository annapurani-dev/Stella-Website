const db = require('../db');

async function main() {
  try {
    const targetSpecs = {
      "Brand": "Apple",
      "Model": "iPhone 15 Pro Max",
      "OS": "iOS 17 (Upgradable to iOS 18)",
      "Processor": "A17 Pro Chip (3nm Bionic GPU)",
      "Display": "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
      "Main Camera": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto Zoom",
      "Front Camera": "12MP TrueDepth Camera",
      "Battery": "4441 mAh (Fast Wireless Charging, USB-C 3.0)",
      "Build": "Aerospace-grade Titanium Frame, Ceramic Shield Front",
      "manufacturer_url": "http://localhost:5000/api/mock-manufacturer-page"
    };

    // Update the product with ID = 1 or Name containing "iPhone 15 Pro Max"
    const targetRes = await db.query('SELECT id, name FROM products WHERE name LIKE "%iPhone 15 Pro Max%" OR id = 1 LIMIT 1');
    if (targetRes.rows.length > 0) {
      const p = targetRes.rows[0];
      await db.query('UPDATE products SET specs = ? WHERE id = ?', [JSON.stringify(targetSpecs), p.id]);
      console.log(`Successfully updated specifications for product: "${p.name}" (ID: ${p.id})`);
    } else {
      console.log("iPhone 15 Pro Max not found in database to update specifications.");
    }
  } catch (err) {
    console.error("Error setting specifications:", err);
  } finally {
    await db.end();
  }
}

main();
