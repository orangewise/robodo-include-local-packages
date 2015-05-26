if (Meteor.isServer) {
 Meteor.startup(function () {

    var path = Npm.require('path');
    var fs = Npm.require('fs-extra');
    var readline = Npm.require('readline');
    var watch = Npm.require('watch');
    var watchPackages = [];


    var parsePackageFile = function (packagesFile, callback) {
      var packages = [];
      readline.createInterface({
          input: fs.createReadStream(packagesFile),
          output: process.stdout,
          terminal: false
      })
      .on('line', function (localPackage) {
        localPackage = localPackage.trim();
        if (localPackage.length) {
          packages.push(localPackage);
        }
      })
      .on('close', function () {
        callback && callback(packages, null);
      });
    };

    var installedPackagesFile = process.env.PWD + '/.meteor/packages';
    var packagesFile = process.env.PWD + '/include-local-packages';
    var packagesPath = path.resolve(packagesFile);

    if(!fs.existsSync(packagesPath)) {
      console.log('\n');
      console.log('-> Creating `include-local-packages for the first time.');
      console.log('-> Add local packages you want to include in your app package folder');
      console.log('-> to file `include-local-packages` and restart your app.');
      console.log();
      fs.writeFileSync(packagesPath, '');
    }


    if (fs.existsSync(packagesPath)) {
      parsePackageFile(packagesFile, function (localPackages) {

        if (localPackages) {
          parsePackageFile(installedPackagesFile, function (installedPackages) {
            watchPackages = _.intersection(localPackages, installedPackages); 
            _.each(watchPackages, function (p) {

              var sourceFolder = process.env.PACKAGE_DIRS + '/' + p;
              var destinationFolder = process.env.PWD + '/packages/include-local-packages-' + p;
              if (!fs.existsSync(destinationFolder)) {
                console.log('create destination folder package', p);
                fs.removeSync(destinationFolder);
                fs.copySync(sourceFolder, destinationFolder);
                // Remove stuff we do not need.
                fs.removeSync(destinationFolder + '/.git');
              }

              watch.watchTree(sourceFolder, {ignoreDotFiles: true}, function (f, curr, prev) {
                if (typeof f == 'object' && prev === null && curr === null) {
                  console.log('robodo:include-local-packages finished walking the '+ p + ' tree...');
                } else if (prev === null) {
                  console.log(f + ' is a new file...');
                  fs.copySync(f, destinationFolder + '/' + path.basename(f));
                } else if (curr.nlink === 0) {
                  console.log(f + ' was removed...');
                  fs.removeSync(destinationFolder + '/' + path.basename(f));
                } else {
                  console.log(f + ' was changed');
                  fs.copySync(f, destinationFolder + '/' + path.basename(f));
                }
              });
             
            });
          });
        }

      });

    } else {
      console.log('-> Error: `include-local-packages` not found.');
    }




 });


}
