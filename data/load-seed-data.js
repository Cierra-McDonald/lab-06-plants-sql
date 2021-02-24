const client = require('../lib/client');
// import our seed data:
const plants = require('./plants.js');
const sizesData = require('./sizes.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();
    
    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    
    const plantSizes = await Promise.all(
      sizesData.map(size => { 
        return client.query(`
        INSERT INTO sizes (sizes)
         VALUES ($1) 
         RETURNING *;
         `, 
        [size.size]);
      })
    );
    
    const user = users[0].rows[0];
    
    const sizes = plantSizes.map(({ rows }) => rows[0]);
    console.log(sizes);

    await Promise.all(
      plants.map(plant => {
        return client.query(`
                    INSERT INTO plants (image, genus, sizes_id, light, price, name, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [plant.image, plant.genus, plant.sizes_id, plant.light, plant.price, plant.name, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
