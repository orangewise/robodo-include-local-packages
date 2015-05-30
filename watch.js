if (Meteor.isServer) {
 Meteor.startup(function () {

    var path = Npm.require('path');
    var fs = Npm.require('fs-extra');
    var readline = Npm.require('readline');
    var watch = Npm.require('watch');
    var watchPackages = [];


    var walkSync = function(dir, filelist) {
      var files = fs.readdirSync(dir);
      filelist = filelist || [];
      files.forEach(function(file) {
         
        // Skip some files.
        if (file !== '.git' && 
            file !== '.npm' && 
            // exclude folder with example app
            file.substring(file.length-8,file.length) !== 'example' &&
            file.substring(0,7) !== '.build.' &&
            file !== '.DS_Store')
        {

          if (fs.statSync(dir + file).isDirectory()) 
          {
            filelist = walkSync(dir + file + '/', filelist);
          }
          else {
            filelist.push(dir + file);
            console.log('include',file);
          }
        }
      });
      return filelist;
    };

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

    var packageName = 'robodo:include-local-packages';
    var installedPackagesFile = process.env.PWD + '/.meteor/packages';
    var packagesFile = process.env.PWD + '/include-local-packages';
    var packagesPath = path.resolve(packagesFile);

    if(!fs.existsSync(packagesPath)) {
      console.log('\n');
      console.log(packageName + '-> Creating `include-local-packages for the first time.');
      console.log(packageName + '-> Add local packages you want to include in your app package folder');
      console.log(packageName + '-> to file `include-local-packages` and restart your app.');
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
              var files = walkSync(sourceFolder + '/');

              if (!fs.existsSync(destinationFolder)) {
                console.log(packageName + '-> init files...', p);
                _.each(files, function(f) {
                  fs.copySync(f, destinationFolder + '/' + f.substring(sourceFolder.length+1,f.length));
                });
              } else {
                console.log('refresh package.js');
                _.each([sourceFolder + '/package.js'], function(f) {
                  fs.copySync(f , destinationFolder + '/' + f.substring(sourceFolder.length+1,f.length));
                });
              }

              watch.watchTree(sourceFolder, {ignoreDotFiles: true}, function (f, curr, prev) {
                if (typeof f == 'object' && prev === null && curr === null) {
                  console.log(packageName + '-> finished walking the '+ p + ' tree...');
                } else if (prev === null) {
                  console.log(packageName + '-> '+ f + ' is a new file...');
                  fs.copySync(f, destinationFolder + '/' + f.substring(sourceFolder.length+1,f.length));
                } else if (curr.nlink === 0) {
                  console.log(packageName + '-> '+ f + ' was removed...');
                  fs.removeSync(destinationFolder + '/' + f.substring(sourceFolder.length+1,f.length));
                } else {
                  console.log(packageName + '-> '+ f + ' was changed');
                  fs.copySync(f, destinationFolder + '/' + f.substring(sourceFolder.length+1,f.length));
                }
              });
             
            });
          });
        }

      });

    } else {
      console.log(packageName + '-> Error: `include-local-packages` not found.');
    }




 });


}
