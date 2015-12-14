"use strict";

/*jshint expr: true, mocha: true, esnext: true */

const expect = require('chai').expect;
const pquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const Router = pquire('../index.js', {
  './browser-shim': {}
});


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
        pattern: '/foo/<bar>/?/bam?/*',
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
              isWildcard: false,
              isOptional: false,
              value: ''
            },
            {
              isLiteral: true,
              isWildcard: false,
              isOptional: false,
              value: 'foo'
            },
            {
              isLiteral: false,
              isWildcard: false,
              isOptional: false,
              value: 'bar'
            },
            {
              isLiteral: true,
              isWildcard: false,
              isOptional: true,
              value: ''
            },
            {
              isLiteral: true,
              isWildcard: false,
              isOptional: true,
              value: 'bam'
            },
            {
              isLiteral: true,
              isWildcard: true,
              isOptional: false,
              value: '*'
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

      it('includes optional segments', function() {
        router.addRoute({
          pattern: '/foo/bar?/<baz>',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        const path = router.getPath('foobar', {
          baz: 2
        });

        expect(path).to.equal('/foo/bar/2');
      });

      it('returns everything up to the wildcard symbol (if present)', function() {
        router.addRoute({
          pattern: '/foo/bar/*',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        const path = router.getPath('foobar', {
          baz: 2
        });

        expect(path).to.equal('/foo/bar/');
      });
    });

    describe('navigate by name', function() {
      it('does not call this.pushState if a matching route is not found', function() {
        router.navigateByName('foo');
        expect(router.pushState.called).to.be.false;
      });

      it('calls this.pushState with the interpolated route path', function() {
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
          '/foo/1/baz/2'
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
          '/foo//baz'
        )).to.be.true;
      });
    });

    describe('navigate by path', function() {
      describe('sad path', function() {
        it('does not call this.pushState if a matching route is not found', function() {
          router.navigateByPath('/foo');
          expect(router.pushState.called).to.be.false;
        });

        it('does not call this.pushState if the path partially matches the pattern', function() {
          router.addRoute({
            pattern: '/foo/bar/baz',
            name: 'foobar',
            cb: 'foobarCallback'
          });
          router.navigateByPath('/foo/bar');
          expect(router.pushState.called).to.be.false;
        });

        it('does not call this.pushState if the pattern partially matches the path', function() {
          router.addRoute({
            pattern: '/foo/bar',
            name: 'foobar',
            cb: 'foobarCallback'
          });
          router.navigateByPath('/foo/bar/baz');
          expect(router.pushState.called).to.be.false;
        });
      });

      it('calls this.pushState with the matching path', function() {
        router.addRoute({
          pattern: '/foo/<bar>/baz',
          name: 'foobar',
          cb: 'foobarCallback'
        });
        router.navigateByPath('/foo/1/baz');
        expect(router.pushState.calledWith(
          '/foo/1/baz'
        )).to.be.true;
      });

      it('respects wildcard routes', function() {
        router.addRoute({
          pattern: '/foo/<bar>/*',
          name: 'foobar',
          cb: 'foobarCallback'
        });

        router.navigateByPath('/foo/1/');
        router.navigateByPath('/foo/1/baz');

        expect(router.pushState.getCall(0).calledWith(
          '/foo/1/'
        )).to.be.true;
        expect(router.pushState.getCall(1).calledWith(
          '/foo/1/baz'
        )).to.be.true;
      });

      describe('optional segments', function() {
        it('skips the optional segment if the segment of the target path does not match', function() {
          router.addRoute({
            pattern: '/foo/bat?/baz',
            name: 'foobar',
            cb: 'foobarCallback'
          });

          router.navigateByPath('/foo/bat/baz');
          router.navigateByPath('/foo/baz');

          expect(router.pushState.getCall(0).calledWith(
            '/foo/bat/baz'
          )).to.be.true;
          expect(router.pushState.getCall(1).calledWith(
            '/foo/baz'
          )).to.be.true;
        });

        it('respects an "optional-only" segment', function() {
          router.addRoute({
            pattern: '/foo/?',
            name: 'foobar',
            cb: 'foobarCallback'
          });

          router.navigateByPath('/foo/');
          router.navigateByPath('/foo');

          expect(router.pushState.getCall(0).calledWith(
            '/foo/'
          )).to.be.true;
          expect(router.pushState.getCall(1).calledWith(
            '/foo'
          )).to.be.true;
        });
      });
    });
  });

  describe('push state', function() {

  });

  describe('start history', function() {

  });
});
