#!/bin/sh

XCODE_BASE=/Applications/Xcode.app
export CODESIGN_ALLOCATE=$XCODE_BASE/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/codesign_allocate
export PATH="$XCODE_BASE/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin:$XCODE_BASE/Contents/Developer/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin"

IDENTITY= #use your own identifier

# Share extension

RESULT_DIR="./app/iXpand Case.app/PlugIns/iXpand Case Share Extension.appex"

cp embedded-share-extension.mobileprovision "$RESULT_DIR/embedded.mobileprovision"
cp Info-share-extension.plist "$RESULT_DIR/Info.plist"

$XCODE_BASE/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++ -stdlib=libstdc++ \
 -arch armv7 -arch arm64 \
 -isysroot $XCODE_BASE/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk \
 "iXpand Case.a" \
 -dead_strip -ObjC \
 -Llib -Fframeworks \
 -lbz2 -lc++ -liconv -lsqlite3 -lstdc++ -lxml2 -lz \
 -lCocoaAsyncSocket -lCocoaHTTPServer -lCocoaLumberjack -lDFCache -lFXKeychain -lLocalytics -lNSLogger -lNSLogger-CocoaLumberjack-connector -lRFQuiltLayout -lRHAddressBook -lReachability \
 -lCSStickyHeaderFlowLayout -lSSZipArchive -lSVWebViewController -lapptentive-ios \
 -framework AVFoundation -framework AddressBook -framework AddressBookUI -framework AssetsLibrary -framework AudioToolbox -framework CFNetwork -framework CoreGraphics -framework CoreLocation -framework CoreTelephony -framework CoreText -framework Crashlytics -framework Fabric -framework Foundation -framework HockeySDK -framework MobileCoreServices -framework MobileVLCKit -framework OpenGLES -framework Photos -framework QuartzCore -framework QuickLook -framework Security -framework SystemConfiguration -framework UIKit -weak_framework AdSupport \
 -e _NSExtensionMain -fapplication-extension -fobjc-arc -fobjc-link-runtime -miphoneos-version-min=8.2 \
 -o "$RESULT_DIR/iXpand Case Share Extension"

plutil -convert xml1 -o "iXpand Case Share Extension.app.xcent" "entitlements/Share Extension.entitlements"
/usr/bin/codesign --force --sign $IDENTITY --entitlements "iXpand Case Share Extension.app.xcent" --timestamp=none "$RESULT_DIR"

# App (must be handled last)

RESULT_DIR="./app/iXpand Case.app"

cp embedded-app.mobileprovision "$RESULT_DIR/embedded.mobileprovision"
cp Info-app.plist "$RESULT_DIR/Info.plist"

$XCODE_BASE/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++ -stdlib=libstdc++ \
 -arch armv7 -arch arm64 \
 -isysroot $XCODE_BASE/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk \
 "iXpand Case.a" \
 -dead_strip -ObjC \
 -Llib -Fframeworks \
 -lbz2 -lc++ -liconv -lsqlite3 -lstdc++ -lxml2 -lz \
 -lBlocksKit -lCSStickyHeaderFlowLayout -lCocoaAsyncSocket -lCocoaHTTPServer -lCocoaLumberjack -lDFCache -lFXKeychain -lLocalytics -lNSLogger -lNSLogger-CocoaLumberjack-connector -lRFQuiltLayout -lRHAddressBook -lReachability -lSSZipArchive -lSVWebViewController -lapptentive-ios \
 -framework AVFoundation -framework AddressBook -framework AddressBookUI -framework AssetsLibrary -framework AudioToolbox -framework CFNetwork -framework CoreData -framework CoreGraphics -framework CoreLocation -framework CoreTelephony -framework CoreText -framework Crashlytics -framework Fabric -framework Foundation -framework HockeySDK -framework ImageIO -framework MessageUI -framework MobileCoreServices -framework MobileVLCKit -framework OpenGLES -framework Photos -framework QuartzCore -framework QuickLook -framework Security -framework SystemConfiguration -framework UIKit -weak_framework AdSupport -weak_framework CoreTelephony -weak_framework StoreKit \
 -fobjc-arc -fobjc-link-runtime -miphoneos-version-min=8.2 \
 -o "$RESULT_DIR/iXpand Case"

plutil -convert xml1 -o "iXpand Case.app.xcent" "entitlements/App.entitlements"
/usr/bin/codesign --force --sign $IDENTITY --entitlements "iXpand Case.app.xcent" --timestamp=none "$RESULT_DIR"
