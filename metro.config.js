const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver ?? {};

const originalResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix: @expo/vector-icons ESM barrel can't resolve ./createIconSet on Windows web bundling.
  // Redirect the import to the absolute path so Metro finds it regardless of cwd.
  if (moduleName === './createIconSet' || moduleName === './createMultiStyleIconSet') {
    const vectorIconsBuild = path.join(
      __dirname,
      'node_modules',
      '@expo',
      'vector-icons',
      'build'
    );
    if (context.originModulePath.includes(path.join('@expo', 'vector-icons', 'build'))) {
      return {
        filePath: path.join(vectorIconsBuild, moduleName.replace('./', '') + '.js'),
        type: 'sourceFile',
      };
    }
  }
  if (originalResolver) return originalResolver(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
