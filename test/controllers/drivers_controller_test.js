const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app')
const Driver = mongoose.model('driver')

describe('Driver controller', () => {

  it('Post to /api/drivers creates a new driver', (done) => {
    Driver.count().then(count => {
      request(app)
        .post('/api/drivers')
        .send({ email: 'test@test.com' })
        .end(() => {
          Driver.count().then(newCount => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  it('Post to /api/drivers requires an email', (done) => {
    request(app)
      .post('/api/drivers')
      .send({})
      .end((err, res) => {
        assert(res.body.error);
        done();
      });
  });

  it('PUT to /api/drivers/id edits an existing driver', (done) => {
    const driver = new Driver({ email: 't@t.com', driving: false });

    driver.save().then(() => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end(() => {
          Driver.findOne({ email: 't@t.com' })
            .then(driver => {
              assert(driver.driving === true);
              done();
            });
        });
    });
  });

  it('DELETE to /api/drivers/id can delete a driver', (done) => {
    const driver = new Driver({ email: 't@t.com', driving: false });

    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end(() => {
          Driver.findOne({ email: 't@t.com' })
            .then(driver => {
              assert(driver === null);
              done();
            });
        });
    });
  });

  it('GET to /api/drivers finds drivers in a location', (done) => {
    const seattleDriver = new Driver({
      email: 'seattle@test.com',
      geometry: { type: 'Point', coordinates: [-122.4759902, 47.4167628] }
    });
    const miamyDriver = new Driver({
      email: 'miamy@test.com',
      geometry: { type: 'Point', coordinates: [-80.253, 25.791] }
    });

    Promise.all([seattleDriver.save(), miamyDriver.save()])
      .then(() => {
        request(app)
          .get('/api/drivers?lng=-80&lat=25')
          .end((err, response) => {
            assert(response.body.length === 1);
            assert(response.body[0].obj.email === 'miamy@test.com');
            done();
          });
      });
  });
});
