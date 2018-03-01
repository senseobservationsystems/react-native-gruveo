//
//  RNGruveo.h
//
//
//  Created by Umar Nizamani on 27/02/2018.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@import GruveoSDK;

NSString *const GruveoSDKEventName = @"GruveoSDK";

// A delegate interface to be used by RNGruveo
@interface GruveoDelegate: NSObject<GruveoCallManagerDelegate>

- (id)init:(RCTEventEmitter*)eventEmitter_ demoTokenSigning:(BOOL)demoTokenSigning_;

@end

// The RNGruveo class
@interface RCT_EXTERN_MODULE(RNGruveo, RCTEventEmitter)

RCT_EXTERN_METHOD(Initialize:(NSString*)clientID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(Call:(BOOL)voiceOnly
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
@end
