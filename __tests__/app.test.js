require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns plants', async() => {

      const expectation = [
        {
          'id': 6,
          'image': 'aloe-vera.png',
          'genus': 'Aloe barbadenis Miller',
          'sizes_id': 2,
          'sizes': 'Medium',
          'light': 'High Light',
          'price': '15',
          'name': 'Aloe Vera',
          'owner_id': 1
        },
        {
          'id': 5,
          'image': 'rubber-tree.png',
          'genus': 'Ficus elastica',
          'sizes_id': 2,
          'sizes': 'Medium',
          'light': 'Low Light',
          'price': '35',
          'name': 'Rubber Tree',
          'owner_id': 1
        },
        {
          'id': 3,
          'image': 'mother-tongue.png',
          'genus': 'Sansevieria trifasciata',
          'sizes_id': 2,
          'sizes': 'Medium',
          'light': 'Medium Light',
          'price': '40',
          'name': 'Mother-in-laws Tongue',
          'owner_id': 1
        },
        {
          'id': 2,
          'image': 'dragon-tree.png',
          'genus': 'Dracaena marginata',
          'sizes_id': 2,
          'sizes': 'Medium',
          'light': 'Medium Light',
          'price': '25',
          'name': 'Dragon Tree',
          'owner_id': 1
        },
        {
          'id': 1,
          'image': 'silver-evergreen.png',
          'genus': 'Aglaonema',
          'sizes_id': 2,
          'sizes': 'Medium',
          'light': 'Low Light',
          'price': '60',
          'name': 'Silver Evergreen',
          'owner_id': 1
        },
        {
          'id': 4,
          'image': 'peace-lily.png',
          'genus': 'Spathiphyllum',
          'sizes_id': 3,
          'sizes': 'Large',
          'light': 'High Light',
          'price': '30',
          'name': 'Peace - Lily',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/plants')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });

    test('returns a single plant with the matching id', async() => {

      const expectation = {
        id: 4, 
        image: 'peace-lily.png',
        genus:  'Spathiphyllum',
        sizes_id: 3,
        sizes: 'Large',
        light: 'High Light',
        price: '30',
        name:  'Peace - Lily',
        owner_id: 1
      };
  
      const data = await fakeRequest(app)
        .get('/plants/4')
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(data.body[0]).toEqual(expectation);


    });

    test('creates a new plant and is added to the plant inventory', async() => { 

      const newPlant = {

        image: 'snake-plant.png',
        genus:  'Sansevieria cylindrical',
        sizes_id: 2,
        sizes: 'Medium',
        light: 'Indirect',
        price: '15',
        name:  'Cylindrical Snake Plant',
        owner_id: 1
      };
      const expectation = {
        ...newPlant,
        id: 7,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/plants')
        .send(newPlant)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const allPlants = await fakeRequest(app)

        .get('/plants')
        .expect('Content-Type', /json/)
        .expect(200);

      const snakePlant = allPlants.body.find(plant => plant.name === 'Cylindrical Snake Plant');
      
      expect(snakePlant).toEqual(expectation);
    });

    test('updates a plant in the inventory', async() => { 
      
      const existingPlant = {  
        image: 'mother-tongue.png',
        genus: 'Sansevieria trifasciata',
        sizes_id: 2,
        sizes: 'Medium',
        light: 'Medium Light',
        price: '25',
        name: 'Mother-in-laws Tongue',
        
      };

      const expectation = { 
        ...existingPlant,
        owner_id: 1,
        id: 3

      };

      await fakeRequest(app)
        .put('/plants/3')
        .send(existingPlant)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedPlant = await fakeRequest(app)
        .get('/plants/3')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(updatedPlant.body[0]).toEqual(expectation);

    });

    test('deletes a plant from the plant directory', async() => { 
      
      const deletedPlant = { 
       
        id: 5, 
        image: 'rubber-tree.png',
        genus: 'Ficus elastica',
        sizes_id: 2,
        light: 'Low Light',
        price: '35',
        name: 'Rubber Tree',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .delete('/plants/5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(deletedPlant);

      const nothing = await fakeRequest(app)
        .get('/plants/5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(nothing.body).toEqual([]);
    });

    test('returns plants sizes', async() => {

      const expectation = [
        {
          'id': 1,
          'sizes': 'Small'
        },
        {
          'id': 2,
          'sizes': 'Medium'
        },
        {
          'id': 3,
          'sizes': 'Large'
        }
      ];

      const data = await fakeRequest(app)
        .get('/sizes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });
  });
});


