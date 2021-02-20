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
          id: 1, 
          image: 'silver-evergreen.png',
          genus: 'Aglaonema', 
          size: 'Medium',
          light: 'Low Light',
          price: '60',
          name: 'Silver Evergreen',
          owner_id: 1
        }, 
        {
          id: 2, 
          image: 'dragon-tree.png',
          genus: 'Dracaena marginata',
          size: 'Medium',
          light: 'Medium Light',
          price: '25',
          name: 'Dragon Tree',
          owner_id: 1
        },
        {
          id: 3, 
          image: 'mother-tongue.png',
          genus: 'Sansevieria trifasciata',
          size: 'Medium',
          light: 'Medium Light',
          price: '40',
          name: 'Mother-in-laws Tongue',
          owner_id: 1
        },
        {
          id: 4, 
          image: 'peace-lily.png',
          genus:  'Spathiphyllum',
          size: 'Large',
          light: 'High Light',
          price: '30',
          name:  'Peace - Lily',
          owner_id: 1
        },
        {
          id: 5, 
          image: 'rubber-tree.png',
          genus: 'Ficus elastica',
          size: 'Medium',
          light: 'Low Light',
          price: '35',
          name: 'Rubber Tree',
          owner_id: 1
        },
        {
          id: 6, 
          image: 'aloe-vera.png',
          genus: 'Aloe barbadenis Miller',
          size: 'Medium',
          light: 'High Light',
          price: '15',
          name: 'Aloe Vera',
          owner_id: 1
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
        size: 'Large',
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
  });
});
