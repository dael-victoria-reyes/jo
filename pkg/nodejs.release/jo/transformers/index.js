//#jopkg{"files":["class-hierarcy.js","file-local-vars.js","modules.js"],"imports":["../util","npmjs.com/babel"],"exports":["ClassHierarchyTransformer","ImportError","ModuleTransformer","ReferenceError","FileLocalVarsTransformer"],"babel-runtime":["core-js"],"version":"ibs7sh7a"}
var _$import = function(ref) { var m = require(ref); return m && m.__esModule ? m["default"] || m : m;}
, _$importWC = function(ref) { var m = require(ref); return m && m.__esModule ? m : {"default":m};}
  , _core = _$import("babel-runtime/core-js")
  , _$$0 = _$import("../util")
  , _modules_js$repr = _$$0.repr
  , _modules_js$JSIdentifier = _$$0.JSIdentifier
  , _modules_js$SrcError = _$$0.SrcError
  , _modules_js$SrcLocation = _$$0.SrcLocation
  , _file_local_vars_js$SrcLocation = _$$0.SrcLocation
  , _file_local_vars_js$SrcError = _$$0.SrcError
  , _$$1 = _$import("npmjs.com/babel")
  , _modules_js$t = _$$1.types
  , _file_local_vars_js$t = _$$1.types;
"use strict";

var __DEV__ = true;

function ImportError(file, node, message, fixSuggestion, related) {
  return _modules_js$SrcError("ImportError", _modules_js$SrcLocation(node, file), message, fixSuggestion, related);
}

var implicitExportNameRe = /^[A-Z]/;

function isImplicitExportName(name) {
  return name.match(implicitExportNameRe);
}

var ModuleTransformer = {

  ImportDeclaration: function ImportDeclaration(node, parent, scope, file) {
    if (node.isType) {
      return;
    }if (node.range && node.range[0] > file.joFirstNonImportOffset) {
      throw ImportError(file.jofile, node, "unexpected import below non-import statement");
    }

    if (node.source.value.substr(0, 14) === "babel-runtime/") {
      node.jo_isRuntimeHelper = true;
    } else {
      if (node.specifiers.length) {
        var hasDefault = false;
        for (var i = 0, L = node.specifiers.length; i !== L; ++i) {
          var spec = node.specifiers[i];
          var origName = undefined;
          if (spec.name) {
            origName = spec.name.name;
            spec.name = file.joLocalizeIdentifier(spec.name.name);
          } else {
            origName = spec.id.name;
            spec.id._origName = spec.id.name;
            spec.name = file.joLocalizeIdentifier(spec.id.name);
          }
          if (spec.type === "ImportBatchSpecifier") {
            var rtHelperNode = {
              _blockHoist: 3,
              type: "ImportDeclaration",
              specifiers: [{ type: "ImportSpecifier",
                id: { type: "Identifier", name: "default" },
                name: { type: "Identifier", name: "_interopRequireWildcard" } }],
              source: { type: "Literal", value: "babel-runtime/helpers/interop-require-wildcard" },
              jo_isRuntimeHelper: true };

            file.scope.registerBinding("module", rtHelperNode);
            file.joImports.push(rtHelperNode);
          }
          spec.name._origName = origName;
          if (spec["default"]) {
            hasDefault = true;
          }
        }
      } else {
        var _name = _modules_js$JSIdentifier.fromString(node.source.value);
        if (!_name || !_modules_js$JSIdentifier.isValid(_name)) {
          throw ImportError(file.jofile, node.source, "failed to infer module identifier");
        }
        var id = file.joLocalizeIdentifier(_name);
        node.specifiers = [_modules_js$t.importSpecifier(_modules_js$t.identifier("default"), id)];
        node.specifiers[0]["default"] = true;
      }
    }

    file.joImports.push(node);
    try {
      file.scope.registerBinding("module", node);
    } catch (e) {}
    return [];
  },

  VariableDeclaration: function VariableDeclaration(node, parent, scope, file) {
    if (parent.type === "Program") {
      if (node.range && node.range[0] < file.joFirstNonImportOffset) {
        file.joFirstNonImportOffset = node.range[0];
      }
      var i,
          id,
          decls = node.declarations,
          exportDecls = [];
      for (i = 0; i !== decls.length; ++i) {
        id = decls[i].id;
        if (isImplicitExportName(id.name)) {
          file.joRegisterExport(id.name, decls[i].id, true);
        }
      }
    }
  },

  FunctionDeclaration: function FunctionDeclaration(node, parent, scope, file) {
    if (parent.type === "Program") {
      if (node.range && node.range[0] < file.joFirstNonImportOffset) {
        file.joFirstNonImportOffset = node.range[0];
      }
      if (isImplicitExportName(node.id.name)) {
        file.joRegisterExport(node.id.name, node.id, true);
      }
    }
  },

  ExportDeclaration: function ExportDeclaration(node, parent, scope, file) {

    if (node.range && node.range[0] < file.joFirstNonImportOffset) {
      file.joFirstNonImportOffset = node.range[0];
    }

    if (node.declaration) {
      if (node["default"]) {
        file.joRegisterExport("default", node.declaration);
      } else {
        _modules_js$t.assertVariableDeclaration(node.declaration);
        var decl = node.declaration.declarations[0];
        _modules_js$t.assertVariableDeclarator(decl);
        file.joRegisterExport(decl.id.name, decl.id);
        return node.declaration;
      }
    } else {
      node.specifiers.forEach(function (spec) {
        file.joRegisterExport(spec.name ? spec.name.name : spec.id.name, spec.id);
      });
    }
    return [];
  } };
"use strict";

function ReferenceError(file, node, message, related) {
  return _file_local_vars_js$SrcError("ReferenceError", _file_local_vars_js$SrcLocation(node, file), message, null, related);
}

var FileLocalVarsTransformer = {

  IfStatement: function IfStatement(node, parent, scope, file) {
    var test = node.test;
    if (test.type === "Identifier" && test.name === "__DEV__" && !scope.getBindingInfo(test.name)) {
      if (node.consequent.type === "BlockStatement" && !node.consequent._letReferences) {
        return node.consequent.body;
      }
      return node.consequent;
    }
  },

  Identifier: function Identifier(node, parent, scope, file) {
    if (node.name === "__DEV__" && !scope.getBindingInfo(node.name)) {
      return _file_local_vars_js$t.literal(file.joTarget.isDevMode);
    }
  },

  FunctionDeclaration: function FunctionDeclaration(node, parent, scope, file) {
    if (node.id && node.id.type === "Identifier" && node.id.name === "init" && parent.type === "Program") {
      node.id = file.joLocalizeIdentifier(node.id.name);
      file.jofile.initFuncName = node.id.name;
    }
  },

  post: function post(file) {
    _core.Object.keys(file.joRemappedIdentifiers).forEach(function (oldName) {
      file.scope.rename(oldName, file.joRemappedIdentifiers[oldName]);
    });

    var undefinedSymbolResolvers = {

      React: function (node, parent, scope) {
        file.joAddImplicitImport("react", { "default": "React" }, node);
        return true;
      },

      ReactComponent: function (node, parent, scope) {
        file.joAddImplicitImport("react", { Component: "ReactComponent" }, node);
        return true;
      } };

    var verifyReference = function (name, node, parent, scope) {
      if (!(node.name in file.joTarget.globals)) {
        var info = scope.getBindingInfo(node.name);
        if (!info) {
          var resolver = undefinedSymbolResolvers[node.name];
          if (!resolver || !resolver(node, parent, scope)) {
            if (!file.jofile.unresolvedIDs) {
              file.jofile.unresolvedIDs = {};
            }
            if (!file.jofile.unresolvedIDs[node.name]) {
              file.jofile.unresolvedIDs[node.name] = { node: node };
            }
            if (file.jofile.superclassReferences) {
              var superclassRef = file.jofile.superclassReferences[node.name];
              if (superclassRef) {
                if (!file.jofile.unresolvedSuperclassIDs) {
                  file.jofile.unresolvedSuperclassIDs = {};
                }
                file.jofile.unresolvedSuperclassIDs[node.name] = superclassRef;
              }
            }
          }
        }
      }
    };

    file.scope.traverse(file.scope.block, {
      enter: function enter(node, parent, scope) {
        if (parent.type === "BreakStatement") {
          return;
        }
        if (_file_local_vars_js$t.isReferencedIdentifier(node, parent)) {
          verifyReference(node.name, node, parent, scope);
        }
      }
    });

    if (file.joPkg.exports["default"]) {
      file.scope.traverse(file.joPkg.exports["default"].node, {
        enter: function enter(node, parent, scope) {
          if (_file_local_vars_js$t.isReferencedIdentifier(node, parent)) {
            var _name = node.name;
            if (!(_name in file.joTarget.globals) && !(_name in file.scope.globals)) {
              var info = scope.getBindingInfo(_name);
              if (!info) {
                var remapped = file.joRemappedIdentifiers[_name];
                if (remapped) {
                  node.name = remapped;
                }
              }
            }
          }
        }
      });
    }

    _core.Object.keys(file.scope.bindings).forEach(function (name) {
      var binding = file.scope.bindings[name];
      if (binding && (binding.kind === "var" || binding.kind === "let" || binding.kind === "const" || binding.kind === "hoisted")) {

        if (!file.jofile.definedIDs) {
          file.jofile.definedIDs = {};
        }
        if (!file.jofile.definedIDs[name]) {
          file.jofile.definedIDs[name] = binding;
        }

        if (!file.joPkg.definedIDs) {
          file.joPkg.definedIDs = {};
        } else if (file.joPkg.definedIDs[name]) {
          var existingDecl = file.joPkg.definedIDs[name];

          var bindingKind = binding.kind;
          var otherBindingKind = existingDecl.binding.kind;
          var node = binding.node;
          var otherNode = existingDecl.binding.node;

          if (bindingKind === "hoisted") {
            bindingKind = "function";
            node = node.id;
          }

          if (otherBindingKind === "hoisted") {
            otherBindingKind = "function";
            otherNode = otherNode.id;
          }

          throw ReferenceError(file.jofile, node, "duplicate identifier in " + bindingKind + " declaration", [{ message: "" + otherBindingKind + " declared here",
            srcloc: _file_local_vars_js$SrcLocation(otherNode, existingDecl.file)
          }]);
        }

        file.joPkg.definedIDs[name] = { binding: binding, file: file.jofile };

        if (name === "main" && binding.node.type === "FunctionDeclaration") {
          file.joPkg.mainFunc = { node: binding.node, file: file.jofile };
        }
      }
    });
  }

};
"use strict";

var ClassHierarchyTransformer = {

  ClassDeclaration: function ClassDeclaration(node, parent, scope, file) {
    if (!file.jofile.classDeclaration) {
      file.jofile.classDeclaration = {};
    }
    file.jofile.classDeclaration[node.id.name] = node.superClass || null;

    if (node.superClass) {
      if (!file.jofile.superclassReferences) {
        file.jofile.superclassReferences = {};
      }
      file.jofile.superclassReferences[node.superClass.name] = node;
    }
  }

};
exports.ClassHierarchyTransformer = ClassHierarchyTransformer;
exports.ImportError = ImportError;
exports.ModuleTransformer = ModuleTransformer;
exports.ReferenceError = ReferenceError;
exports.FileLocalVarsTransformer = FileLocalVarsTransformer;
//#sourceMappingURL=index.js.map
