const builder = require('electron-builder');

builder.build({
  targets: builder.Platform.WINDOWS.createTarget('nsis'),
  config: {
    appId: 'com.ai.timeline-creator',
    productName: 'Storyloom',
    directories: {
      output: 'release',
    },
    files: [
      'dist/**/*',
      'dist-server/**/*',
      'electron-out/**/*',
      'drizzle/**/*',
      'shared/**/*',
      'package.json',
    ],
    asarUnpack: [
      'node_modules/better-sqlite3/**/*',
    ],
    electronDist: 'node_modules/electron/dist',
    publish: {
      provider: 'github',
      owner: 'YJLZSL',
      repo: 'Storyloom',
    },
    win: {
      target: 'nsis',
      icon: 'public/icon.ico',
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
    },
  },
})
  .then(() => {
    console.log('Build completed successfully');
  })
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
