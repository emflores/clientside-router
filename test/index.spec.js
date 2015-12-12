const expect = require('chai').expect;
const sinon = require('sinon');

const Router = require('../index.js');


describe('index', function() {
  describe('instantiation', function() {
    it('sets this.routes', function() {
      const router = new Router();
      expect(router.routes).to.deep.equal([]);
    });
  });

  describe('add routes', function() {
    it('calls this.addRoute for each route', function() {
      const router = new Router();
      sinon.stub(router, 'addRoute');
      router.addRoutes([1, 2]);
      expect(router.addRoute.calledTwice).to.be.true;
      expect(router.addRoute.getCall(0).args[0]).to.equal(1);
      expect(router.addRoute.getCall(1).args[0]).to.equal(2);
      sinon.restore(router.addRoute);
    });
  });

  describe('add route', function() {
    it('stores the routes name, callback, and segment tokens', function() {
      const router = new Router();
      router.addRoute({
        pattern: '/foo/<bar>',
        name: 'foobar',
        cb: 'foobarCallback'
      });

      expect(router.routes).to.deep.equal([
        {
          name: 'foobar',
          cb: 'foobarCallback',
          tokens: [
            {
              isLiteral: true,
              value: ''
            },
            {
              isLiteral: true,
              value: 'foo'
            },
            {
              isLiteral: false,
              value: 'bar'
            }
          ]
        }
      ]);
    });

    it('stores routes in the order that they are added', function() {
      const router = new Router();
      router.addRoutes([
        {
          pattern: '/mic/<hael>',
          name: 'michael',
          cb: 'michaelCallback'
        },
        {
          pattern: '/roger/<moz>',
          name: 'roger',
          cb: 'rogerCallback'
        }
      ]);
      router.addRoute({
        pattern: '/foo/<bar>',
        name: 'foobar',
        cb: 'foobarCallback'
      });

      expect(router.routes[0].name).to.equal('michael');
      expect(router.routes[1].name).to.equal('roger');
      expect(router.routes[2].name).to.equal('foobar');
    });
  });

  describe('navigate by name', function() {

  });

  describe('navigate by path', function() {

  });

  describe('start history', function() {

  });
});
