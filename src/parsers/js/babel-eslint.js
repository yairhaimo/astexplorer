import defaultParserInterface from './utils/defaultESTreeParserInterface';
import pkg from 'acorn-to-esprima/package.json';

const ID = 'acorn-to-esprima';
const name = 'babel-eslint';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: name,
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['loc', 'start', 'end']),

  loadParser(callback) {
    require(['acorn-to-esprima', 'babel-core'], (acornToEsprima, {acorn: {tokTypes}, traverse, parse}) => {
      callback({
        ...acornToEsprima,
        tokTypes,
        traverse,
        parse,
      });
    });
  },

  parse(parser, code) {
    const opts = {
      locations: true,
      ranges: true,
    };

    const comments = opts.onComment = [];
    const tokens = opts.onToken = [];

    let ast = parser.parse(code, opts);

    ast.tokens = parser.toTokens(tokens, parser.tokTypes);
    parser.convertComments(comments);
    ast.comments = comments;
    parser.attachComments(ast, comments, ast.tokens);
    parser.toAST(ast, parser.traverse);

    return ast;
  },

  nodeToRange(node) {
    if (typeof node.start !== 'undefined') {
      return [node.start, node.end];
    }
  },

  _ignoredProperties: new Set([
    '_paths',
    '_babelType',
    '__clone',
  ]),
};
