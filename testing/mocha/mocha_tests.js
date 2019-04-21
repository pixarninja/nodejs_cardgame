var request = require('supertest');

var app = require('../nodejscardgame_app_1').app;

describe('Card Game Load Test', function(){
  it('Connect User', function(done){
    request(app)
      .get("/")
      .set('Accept', 'text/plain')
      .expect('Content-Type', 'text/plain')
      .expect(200, {})
      .end(function (err) {
        if(err) {
          print('Mocha error!')
          return done(err);
        }
        return done();
      })
  });
});
