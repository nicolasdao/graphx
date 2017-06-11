/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const assert = require('assert');
const { getEdge, log, set } = require('../utilities');

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like <-['CREATED']-", () => {
      const edge = getEdge("<-['CREATED']-");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'default');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'CREATED'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like (brand)<-['ABOUT']-(posts.data)", () => {
      const edge = getEdge("(brand)<-['ABOUT']-(posts.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'ABOUT'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from relations like (brand)<-['ABOUT']-(posts.data)", () => {
      const edge = getEdge("<-['ABOUT']-(posts.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'ABOUT'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like (post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)", () => {
      const edge = getEdge("(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "(post, user) => 'RATED:' + user.rating");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should throw an error if the relation's direction is badly formatted.", () => {
      assert.throws(() => getEdge("(post)-[(post, user) => 'RATED:' + user.rating]-(users.data)"), /Failed to extract the relation's direction/);
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should throw an error if the relation is badly formatted.", () => {
      assert.throws(() => getEdge("(post)<-[(post, user) => 'RATED:' + user.rating-(users.data)"), /Failed to extract the relation/);
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should generate a dynamic relation for edges like <-['CREATED']-", () => {
      const edge = getEdge("<-['CREATED']-");
      assert.ok(edge);
      assert.ok(edge.relation);
      assert.equal(edge.relation.generate(null, { rating:'love' }), "CREATED");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should generate a dynamic relation for edges like (post)<-[(post, user) => 'RATED:' + user.rating-(users.data)", () => {
      const edge = getEdge("(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)");
      assert.ok(edge);
      assert.ok(edge.relation);
      assert.equal(edge.relation.generate(null, { rating:'love' }), "RATED:love");
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should set a specific property of an object to a specific value (e.g. set(a, 'name', 'Peter'))", () => {
      const a = {};
      const b = set(a, 'name', 'Peter');
      assert.equal(b.name, "Peter");
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should set a specific properties of an object to a set of specific values (e.g. set(a, ['name', 'age'], ['Peter', 3]))", () => {
      const a = {};
      const b = set(a, ['name', 'age'], ['Peter', 3]);
      assert.equal(b.name, "Peter");
      assert.equal(b.age, 3);
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should mutate an object if a mutate function is passed as the 4th argument", () => {
      const a = { array:[] };
      const b = set(a, ['name', 'age'], ['Peter', 3], x => x.array.push(2));
      assert.equal(b.name, "Peter");
      assert.equal(b.age, 3);
      assert.equal(a.array.length, 1);
      assert.equal(a.array[0], 2);
    })));

