rm hustle.apk
ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore /Users/austinhunter/Documents/My\ Projects/the-hustle/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk hustle
~/Library/Android/sdk/build-tools/29.0.2/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk hustle.apk
