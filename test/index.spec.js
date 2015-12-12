"use strict";

/*jshint expr: true, mocha: true, esnext: true */

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

  describe('navigation', function() {
    let router = null;

    beforeEach(function() {
      router = new Router();
      sinon.stub(router, 'pushState');
    });

    afterEach(function() {
      sinon.restore(router.pushState);
    });

    describe('get path', function() {
      it('returns undefined if the route name is not found', function() {
        expect(router.getPath('baz')).to.be.undefined;
      });

      it('returns the interpolated path', function() {
        router.addRoute({
          pattern: '/foo/<bar>/baz/<bam>',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        const path = router.getPath('foobar', {
          bar: 1,
          bam: 2
        });

        expect(path).to.equal('/foo/1/baz/2');
      });
    });

    describe('navigate by name', function() {
      it('does not call this.pushState if a matching route is not found', function() {
        router.navigateByName('foo');
        expect(router.pushState.called).to.be.false;
      });

      it('calls this.pushState with the interpolated route path and callback', function() {
        router.addRoute({
          pattern: '/foo/<bar>/baz/<bam>',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        router.navigateByName('foobar', {
          bar: 1,
          bam: 2
        });
        expect(router.pushState.calledWith(
          '/foo/1/baz/2', 'foobarCallback'
        )).to.be.true;
      });

      it('interpolates undefined for a segment if a matching option is not passed', function() {
        router.addRoute({
          pattern: '/foo/<bar>/baz',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        router.navigateByName('foobar');
        expect(router.pushState.calledWith(
          '/foo//baz', 'foobarCallback'
        )).to.be.true;
      });
    });

    describe('navigate by path', function() {
      it('does not call this.pushState if a matching route is not found', function() {
        router.navigateByPath('/foo');
        expect(router.pushState.called).to.be.false;
      });

      it('calls this.pushState with the path and callback', function() {
        router.addRoute({
          pattern: '/foo/<bar>/baz',
          name: 'foobar',
          cb: 'foobarCallback'
        });
        router.navigateByPath('/foo/1/baz');
        expect(router.pushState.calledWith(
          '/foo/1/baz', 'foobarCallback'
        )).to.be.true;
      });
    });
  });

  describe('push state', function() {

  });

  describe('start history', function() {

  });
});
