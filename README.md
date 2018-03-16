# react-native-gruveo

[Gruveo](https://www.gruveo.com/) SDK for React Native. 

## Usage

```js
import * as Gruveo from 'react-native-gruveo';

// Initialize Gruveo
Gruveo.initialize('demo');

// Call with Gruveo
Gruveo.call('example', true, false, (status, payload) => {
    switch (status) {
        case Gruveo.CallStatus.requestToSignApiAuthToken:
            fetch('https://api-demo.gruveo.com/signer', {
                method: 'POST',
                body: payload,
                headers: { 'Content-Type': 'text/plain' }
            })
            .then((response) => response.text())
            .then((signedToken) => Gruveo.authorize(signedToken));
            break;
    }
});
```

## Installation

Install the NPM package: `npm install --save react-native-gruveo`

### iOS

* Add the following to your `Podfile` in all the targets you wish to build and run `pod update`:
```
 pod 'GruveoSDK' 
```
* Right click on Libraries, select **Add files to "…"** and select `node_modules/react-native-gruveo/ios/RNGruveo.xcodeproj`
* Select your project and under **Build Phases** -> **Link Binary With Libraries**, press the + and select `libRNGruveo.a`.
* Set a deployment target >= 9.0 in your project
* In your info.plist you should add `NSCameraUsageDescription` and `NSMicrophoneUsageDescription` keys as [described here](https://about.gruveo.com/developers/ios-sdk/setup-usage/)
* Set “Enable Bitcode” to NO in Target -> Build Settings -> Enable Bitcode

### Android

* Edit `android/build.gradle` to look like this (without the +):

```diff
allprojects {
    repositories {
        mavenLocal()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
+       maven { url "https://jitpack.io" }
+       maven { url "https://maven.google.com" }
    }
}
```

* Edit `android/settings.gradle` to look like this (without the +):

```diff
rootProject.name = 'MyApp'

include ':app'

+ include ':react-native-gruveo'
+ project(':react-native-gruveo').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-gruveo/android')
```

* Edit `android/app/build.gradle` (note: **app** folder) to look like this: 

```diff
apply plugin: 'com.android.application'

android {
...
+    compileSdkVersion 26        // Atleast 26+ for compaitbile support compat library
+    buildToolsVersion "26.0.0"  // Atleast 26+ for compaitbile support compat library

    defaultConfig {
+        minSdkVersion 17 // Needed for video call
+        multiDexEnabled true // Needed to include Gruveo SDK
    ...
    }
...
}

dependencies {
  compile fileTree(dir: 'libs', include: ['*.jar'])
  compile 'com.android.support:appcompat-v7:23.0.1'
  compile 'com.facebook.react:react-native:+'
+ compile project(':react-native-gruveo')
}
```

* Edit your `MainApplication.java` (deep in `android/app/src/main/java/...`) to look like this (note **two** places to edit):

```diff
package com.myapp;

+import com.reactnativegruveo.GruveoPackage;

....

public class MainActivity extends extends ReactActivity {

  @Override
  protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
+             new GruveoPackage()
      );
  }
  ...
}
```

- Edit your `manifest.xml` and add the Gruveo activity to it:

```diff
...
     <application ...>
+    <activity
+        android:name="com.gruveo.sdk.ui.CallActivity"
+        android:configChanges="orientation|screenSize"/>
     </application>
...
```

## License

MIT © Umar Nizamani 2016-2018
