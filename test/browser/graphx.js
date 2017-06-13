/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
var isbrowser = typeof(chai) != 'undefined';
var assert = isbrowser ? chai.assert : null;

var runtest = function(graphx, graphqls2s, assert) {

  var getSchemaAST = graphqls2s.getSchemaAST;
  var extractNodes = graphx.extractNodes;
  var d3Flatten = graphx.d3Flatten;
  var getQueryAST = graphx.getQueryAST;
  var compileGraphDataToD3 = graphx.compileGraphDataToD3; 

  var resultset = {
    "data": {
      "brands": {
        "data": [
          {
            "id": "-KkL9EdTh9abV9xAwHUa",
            "name": "Alineala llc",
            "posts": {
              "data": [
                {
                  "author": {
                    "username": "edytherutkowski"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "edythemillard"
                      },
                      {
                        "rating": "LOVE",
                        "username": "benedictallmond"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "edytherutkowski"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "roseannedelancey"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "edythecantor"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "jolandadelancey"
                      },
                      {
                        "rating": "LOVE",
                        "username": "janetteterrio"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "marceldao"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "chancepeart"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "burtonwarrick"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "borisendicott"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "burtonwarrick"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "cythiasurface"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "sherillallmond"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "forrestjohnson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "sherillallmond"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "pamilaneisler"
                      },
                      {
                        "rating": "LOVE",
                        "username": "sallywetherbee"
                      },
                      {
                        "rating": "LOVE",
                        "username": "annaleeiannuzzi"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "sherillallmond"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "olivarutkowski"
                      },
                      {
                        "rating": "LOVE",
                        "username": "katherynbelles"
                      },
                      {
                        "rating": "LOVE",
                        "username": "katherynbertucci"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "burtonmccolley"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "christinefurman"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "burtonmccolley"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "addieasuncion"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "burtonmccolley"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "pamilaabsher"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "deannclemens"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "venettabattle"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "hubertcantor"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "olivagaunce"
                      },
                      {
                        "rating": "LOVE",
                        "username": "annaleeasuncion"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "hubertcantor"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "noeliadey"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "geneviepuga"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "jolandaberak"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "geneviepuga"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "armidadelancey"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "roseannefenderson"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "venettaterrio"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "roseannefenderson"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "alaynamohn"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "roseannefenderson"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "olivajohnson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "edythefenderson"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "roseannefenderson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "kaleighangevine"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "burtonneisler"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "ginnyrutkowski"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "marthabertucci"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "ginnyrutkowski"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "katherynsurface"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "ginnyrutkowski"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "mohamedpasquariello"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "margrettdao"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "boristowell"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "margrettdao"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "armidakonrad"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "christinebresler"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "delorseendicott"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "dorcasdankert"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "gabrieldey"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "dorcasdankert"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "forrestjohnson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "hangsurface"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "aguedamillard"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "cythiafogal"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "christinekonrad"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "cythiafogal"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "benedictfenderson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "jamisonabsher"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "macmahon"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "jamisonabsher"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "douglasdey"
                      },
                      {
                        "rating": "LOVE",
                        "username": "mohamedknepp"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "jamisonabsher"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "margrettpasquariello"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "clintonbelles"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "noeliajohnson"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "clintonbelles"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "jolandadelancey"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "clintonbelles"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "susyendicott"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "clintonbelles"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "janetterutkowski"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "clintonbelles"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "pamilapuga"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "dorcaswetherbee"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "kaleighnance"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "nicolasallmond"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "armidaiannuzzi"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "armidarivenburg"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "clintonwetherbee"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "armidarivenburg"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "noeliapuga"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "armidarivenburg"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "susyendicott"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "susyneisler"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "noeliacantor"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "susyneisler"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "susyallmond"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "susyneisler"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "genevieknepp"
                      }
                    ]
                  }
                },
                {
                  "author": {
                    "username": "geneviemaynez"
                  },
                  "users": {
                    "data": [
                      {
                        "rating": "LOVE",
                        "username": "marcelbelles"
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }

  var query_cajYlQ207 = `
  query {
    brands(
      # some comments to make things harder to parse
      where:{id: '-KkL9EdTh9abV9xAwHUa'}, 
      page:{first:10}) { # { some comments to make things harder to parse
      data {
        id
        name
        # some comments to make things harder to parse
        posts(where:{rating:LOVE}){
          data {
            author {
              username
            }
            users(have:{id: "-TiL9Eddwd&9abV9xAwHUa", rated:LOVE}){
              data {
                rating
                username
              }
            }
          }
        }
      }
    }
  }`

  var schema_dxbahT5 = `
  type Paged<T> {
    data: [T]
    cursor: ID
  }

  @node
  type User {
    id: ID!
    username: ID!
  }

  type UserWithRating inherits User {
    rating: UserRating
  }

  @node
  type Post {
    id: ID!
    name: String!
    text: String

    @edge(<-['CREATED']-)
    author: User

    @edge(-['ABOUT']->)
    brand: Brand

    @edge((post)<-[(post, user) => 'RATED:' + user.rating]-(users.data))
    users(where: WhereUserInput, page: PagegInput): Paged<UserWithRating>
  }

  @node
  type Brand {
    id: ID!
    name: String!

    @edge((brand)<-['ABOUT']-(posts.data))
    posts(where: WherePostInput, page: PagegInput): Paged<Post>
  }

  enum UserRating {
    LOVE
    LIKE
    NEUTRAL
    DISLIKE
    HATE
  }

  input PagegInput {
    first: Int
  }

  input WhereBrandInput {
    id: ID
  }

  input WherePostInput {
    rating: UserRating
  }

  input WhereUserInput {
    rating: UserRating
  }

  type Query {
    brands(where: WhereBrandInput, page: PagegInput): Paged<Brand>
  }
  `
  describe('index', () => 
    describe('#astParse', () => 
      it("Should create an AST from any string GraphQL query.", () => {
          var schemaAST = getSchemaAST(schema_dxbahT5);
          var queryAST = getQueryAST(query_cajYlQ207, schemaAST);
          assert.isOk(queryAST);
          assert.equal(queryAST.length, 1);
          assert.equal(queryAST[0].name, 'brands');
          assert.equal(queryAST[0].type, 'PagedBrand');
          assert.equal(queryAST[0].isNode, false);
          assert.isOk(!queryAST[0].edge);
          assert.isOk(queryAST[0].args);
          assert.isOk(queryAST[0].args.where);
          assert.isOk(queryAST[0].args.page);
          assert.equal(queryAST[0].args.where.id, "-KkL9EdTh9abV9xAwHUa");
          assert.equal(queryAST[0].args.page.first, 10);
          var brandsProps = queryAST[0].properties;
          assert.isOk(brandsProps);
          assert.equal(brandsProps.length, 1);
          var data = brandsProps[0];
          assert.equal(data.name, "data");
          assert.equal(data.type, "[Brand]");
          assert.equal(data.isNode, true);
          assert.isOk(!data.args);
          assert.isOk(!data.edge);
          var dataProps = data.properties;
          assert.isOk(dataProps);
          assert.equal(dataProps.length, 3);
          var posts = dataProps[2];
          assert.equal(posts.name, "posts");
          assert.equal(posts.type, "PagedPost");
          assert.equal(posts.isNode, false);
          assert.equal(posts.edge, "(brand)<-['ABOUT']-(posts.data)");
          assert.isOk(posts.args);
          assert.isOk(posts.args.where);
          assert.equal(posts.args.where.rating, "LOVE");
      })));

  describe('index', () => 
    describe('#extractNodes', () => 
      it("Should extract all nodes(schema types marked with the '@node' attribute) for each query. Each node should also contains their successors with their edge.", () => {
        var schemaAST = getSchemaAST(schema_dxbahT5);
        var queryAST = getQueryAST(query_cajYlQ207, schemaAST);
        var queryResponse = resultset;
        var brandsQuery = queryAST[0];
        var brandsQueryResp = resultset.data[brandsQuery.name];
        assert.isOk(brandsQueryResp);
        var result = extractNodes(brandsQuery, brandsQueryResp);
        assert.isOk(result);
        assert.equal(result.length, 1);
        assert.equal(result[0]._node, "Brand");
        assert.equal(result[0].id, "-KkL9EdTh9abV9xAwHUa");
        assert.equal(result[0].name, "Alineala llc");
        assert.isOk(!result[0]._edge);
        assert.isOk(result[0]._successors);
        assert.equal(result[0]._successors.length, 50);
        var post = result[0]._successors[0];
        assert.equal(post._node, "Post");
        assert.isOk(post._successors);
        assert.equal(post._successors.length, 3);
        assert.isOk(post._successors[0]._edge);
        assert.isOk(post._successors[1]._edge);
        assert.isOk(post._successors[2]._edge);
        assert.equal(post._successors[0]._edge.name, "CREATED");
        assert.equal(post._successors[1]._edge.name, "RATED:LOVE");
        assert.equal(post._successors[2]._edge.name, "RATED:LOVE");
        assert.equal(post._successors[0]._edge.direction, "<");
        assert.equal(post._successors[1]._edge.direction, "<");
        assert.equal(post._successors[2]._edge.direction, "<");
      })));

  describe('index', () => 
    describe('#d3Flatten', () => 
      it("Should format all nodes extracted by the 'extractNodes' so they can be ingested by D3.", () => {
        var schemaAST = getSchemaAST(schema_dxbahT5);
        var queryAST = getQueryAST(query_cajYlQ207, schemaAST);
        var queryResponse = resultset;
        var brandsQuery = queryAST[0];
        var brandsQueryResp = resultset.data[brandsQuery.name];
        var nodes = extractNodes(brandsQuery, brandsQueryResp);
        var d3Resp = d3Flatten(nodes);
        assert.isOk(d3Resp);
          assert.isOk(d3Resp.nodes);
          assert.isOk(d3Resp.edges);
          assert.equal(d3Resp.nodes.length, 159);
          assert.equal(d3Resp.edges.length, 158);
          assert.equal(d3Resp.nodes[0]._node, "Brand");
          assert.equal(d3Resp.nodes[0].id, "-KkL9EdTh9abV9xAwHUa");
          assert.equal(d3Resp.nodes[0].name, "Alineala llc");
          assert.equal(d3Resp.nodes[1]._node, "Post");
          assert.equal(d3Resp.nodes[2]._node, "User");
          assert.equal(d3Resp.edges[0].source, 1);
          assert.equal(d3Resp.edges[0].target, 0);
          assert.equal(d3Resp.edges[0].name, "ABOUT");
      }))); 

  describe('index', () => 
    describe('#compileGraphDataToD3', () => 
      it("Should format all nodes extracted by the 'extractNodes' so they can be ingested by D3.", () => {
          var d3Resp_1 = compileGraphDataToD3(query_cajYlQ207, resultset, schema_dxbahT5);
          var schemaAST = getSchemaAST(schema_dxbahT5);
          var d3Resp_2 = compileGraphDataToD3(query_cajYlQ207, resultset, schemaAST);

          var validate = d3Resp => {
              assert.isOk(d3Resp);
              assert.isOk(d3Resp.nodes);
              assert.isOk(d3Resp.edges);
              assert.equal(d3Resp.nodes.length, 159);
              assert.equal(d3Resp.edges.length, 158);
              assert.equal(d3Resp.nodes[0]._node, "Brand");
              assert.equal(d3Resp.nodes[0].id, "-KkL9EdTh9abV9xAwHUa");
              assert.equal(d3Resp.nodes[0].name, "Alineala llc");
              assert.equal(d3Resp.nodes[1]._node, "Post");
              assert.equal(d3Resp.nodes[2]._node, "User");
              assert.equal(d3Resp.edges[0].source, 1);
              assert.equal(d3Resp.edges[0].target, 0);
              assert.equal(d3Resp.edges[0].name, "ABOUT");
          };

          validate(d3Resp_1);
          //validate(d3Resp_2);
      })));
}

if (isbrowser) runtest(graphx, graphqls2s, assert)
if (typeof(module) != 'undefined') 
  module.exports = {
    runtest
  }