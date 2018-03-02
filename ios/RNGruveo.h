//
//  RNGruveo.h
//
//
//  Created by Umar Nizamani on 27/02/2018.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@import GruveoSDK;

NSString *const GruveoSDKEventName = @"RNGruveo";

// A delegate interface to be used by RNGruveo
@interface GruveoDelegate: NSObject<GruveoCallManagerDelegate>

- (id)init:(RCTEventEmitter*)eventEmitter_;

@end

// The RNGruveo class
@interface RCT_EXTERN_MODULE(RNGruveo, RCTEventEmitter)
@end
