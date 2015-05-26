Package.describe({
  name: 'robodo:include-local-packages',
  summary: 'Include private packages in your meteor app `packages` folder.',
  version: '0.0.1',
  git: 'https://github.com/orangewise/robodo-include-local-packages',
  debugOnly: true
});

Npm.depends({
  'watch': '0.16.0',
  'fs-extra': '0.18.4'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('watch.js', 'server');
});
