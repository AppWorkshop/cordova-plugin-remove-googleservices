module.exports = function(context) {
  const path = require('path');
  const propertiesReader = require('properties-reader');
  const PropertiesParser = require('properties-parser');

  console.log('cordova-plugin-remove-googleservices: Running')

  const propertiesFilePath = path.join(context.opts.projectRoot, `platforms/android/project.properties`);

  const properties = propertiesReader(propertiesFilePath);
  let googleServicesPropKey, otherCordovaIncludeProps = [];
  properties.each((key, value) => {
    // called for each item in the reader,
    // console.log('checking prop', key, value);
    if (/cordova-support-google-services/.test(value)) {
      // remove this prop val from the object
      console.log(`Removing properties key in ${propertiesFilePath}: ${key}=${value}`);
      googleServicesPropKey = key;
    } else if (/cordova.gradle.include/.test(key)) {
      console.log(`May need to reindex properties key in ${propertiesFilePath}: ${key}=${value}`);
      otherCordovaIncludeProps.push({key, value});
    }
  });

  if (googleServicesPropKey) {
    const propsEditor = PropertiesParser.createEditor(propertiesFilePath);
    propsEditor.unset(googleServicesPropKey);

    otherCordovaIncludeProps.forEach((propVal, propIndex) => {
      const oldKey = propVal.key;
      const newKey = propVal.key.replace(/[\d]$/, (propIndex + 1));
      console.log(`reindexing ${oldKey} to ${newKey}`);
      propsEditor.unset(oldKey);
      propsEditor.set(newKey, propVal.value);
    })

    propsEditor.save(propertiesFilePath, function(){
      console.log(`${propertiesFilePath} modified.`);
    })
  } else {
    console.log(`cordova-support-google-services property not found in ${propertiesFilePath}; it may have already been removed.`);
  }
  console.log('cordova-plugin-remove-googleservices: Done')
}