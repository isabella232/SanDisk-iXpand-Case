#!/bin/sh

rm -f "iXpand Case.app.xcent"
rm -f "iXpand Case Share Extension.app.xcent"

RESULT_DIR="./app/iXpand Case.app"

rm -f "$RESULT_DIR/iXpand Case"
rm -rf "$RESULT_DIR"/_CodeSignature
rm -f "$RESULT_DIR"/embedded.mobileprovision
rm -f "$RESULT_DIR"/Info.plist

RESULT_DIR="./app/iXpand Case.app/PlugIns/iXpand Case Share Extension.appex"

rm -f "$RESULT_DIR/iXpand Case Share Extension"
rm -rf "$RESULT_DIR"/_CodeSignature
rm -f "$RESULT_DIR"/embedded.mobileprovision
rm -f "$RESULT_DIR"/Info.plist
