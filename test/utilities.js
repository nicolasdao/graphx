/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const assert = require('assert');
const { getLinks } = require('../utilities');

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should extract links info from edges like <-['CREATED']-", () => {
      const link = getLinks("<-['CREATED']-");
      assert.ok(link);
      assert.equal(link.leftnode, 'default');
      assert.equal(link.rightnode, 'default');
      assert.ok(link.link);
      assert.equal(link.link.label, "'CREATED'");
      assert.equal(link.link.direction, "<");
    })));

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should extract links info from edges like (brand)<-['ABOUT']-(posts.data)", () => {
      const link = getLinks("(brand)<-['ABOUT']-(posts.data)");
      assert.ok(link);
      assert.equal(link.leftnode, 'default');
      assert.equal(link.rightnode, 'data');
      assert.ok(link.link);
      assert.equal(link.link.label, "'ABOUT'");
      assert.equal(link.link.direction, "<");
    })));

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should extract links info from edges like (brand)<-['ABOUT']-(posts.data)", () => {
      const link = getLinks("<-['ABOUT']-(posts.data)");
      assert.ok(link);
      assert.equal(link.leftnode, 'default');
      assert.equal(link.rightnode, 'data');
      assert.ok(link.link);
      assert.equal(link.link.label, "'ABOUT'");
      assert.equal(link.link.direction, "<");
    })));

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should extract links info from edges like (post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)", () => {
      const link = getLinks("(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)");
      assert.ok(link);
      assert.equal(link.leftnode, 'default');
      assert.equal(link.rightnode, 'data');
      assert.ok(link.link);
      assert.equal(link.link.label, "(post, user) => 'RATED:' + user.rating");
      assert.equal(link.link.direction, "<");
    })));

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should throw an error if the link's direction is badly formatted.", () => {
      assert.throws(() => getLinks("(post)-[(post, user) => 'RATED:' + user.rating]-(users.data)"), /Failed to extract the link's direction/);
    })));

describe('utilities', () => 
  describe('#getLinks', () => 
    it("Should throw an error if the link is badly formatted.", () => {
      assert.throws(() => getLinks("(post)<-[(post, user) => 'RATED:' + user.rating-(users.data)"), /Failed to extract the link/);
    })));

