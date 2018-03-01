//
//  RNGruveo.m
//
//
//  Created by Umar Nizamani on 27/02/2018.
//

#import <React/RCTViewManager.h>
#import "RNGruveo.h"
@import GruveoSDK;

// Delegate for Gruveo
@implementation GruveoDelegate
{
    RCTEventEmitter *eventEmitter;
    BOOL demoTokenSigning;
}

// Initialize the delegate with an event emitter and specify whether we should enable demo token signing
// NOTE: When demo token signing is enabled, the SDK will sign authentication tokens internally from https://api-demo.gruveo.com
- (id)init:(RCTEventEmitter*)eventEmitter_ demoTokenSigning:(BOOL)demoTokenSigning_
{
    if( self = [super init] )
    {
        eventEmitter = eventEmitter_;
        demoTokenSigning = demoTokenSigning_;
    }
    
    return self;
}

// Callback triggered when there is a request to sign an API token
- (void)requestToSignApiAuthToken:(NSString *)token {
    
    [eventEmitter sendEventWithName:GruveoSDKEventName body:@{@"name": @"requestToSignApiAuthToken", @"payload":token}];
    
    // This flag specifies to enable using demo signing, this makes it easier to test Gruveo without implementing token signing in React Native
    // but does not work for production use cases
    if (demoTokenSigning) {
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://api-demo.gruveo.com/signer"]];
        [request setHTTPMethod:@"POST"];
        [request setValue:@"text/plain" forHTTPHeaderField:@"Content-Type"];
        [request setHTTPBody:[token dataUsingEncoding:NSUTF8StringEncoding]];
        
        NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
        NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration delegate:nil delegateQueue:nil];
        
        [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if ([data isKindOfClass:[NSData class]]) {
                NSString *signedToken = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                [GruveoCallManager authorize:signedToken];
            } else {
                [GruveoCallManager authorize:nil];
            }
        }] resume];
    }
}

// Callback when a call is actually established
- (void)callEstablished
{
    [eventEmitter sendEventWithName:GruveoSDKEventName body:@{@"name": @"callEstablished"}];
}

// Callback when a call has ended with the reason sent as payload
- (void)callEnd:(GruveoCallEndReason)reason
{
    [eventEmitter sendEventWithName:GruveoSDKEventName body:@{@"name": @"callEnd", @"payload":[NSString stringWithFormat: @"%lu", (unsigned long)reason]}];
}

// Callback when the calls recording state has changed
- (void)recordingStateChanged
{
    [eventEmitter sendEventWithName:GruveoSDKEventName body:@{@"name": @"recordingStateChanged"}];
}
@end


// React Native Gruveo SDK
@implementation RNGruveo
{
    GruveoDelegate *delegate;
}

-(NSArray<NSString *>*)supportedEvents
{
    return @[GruveoSDKEventName];
}

// Initialize with ClientID and specify if you want to enable demo token signing
// NOTE: demoTokenSigning is useful if you want to play with Gruveo in a non-produciton system
RCT_EXPORT_METHOD(initialize:(NSString*)clientID demoTokenSigning:(BOOL)demoTokenSigning)
{
    // Initialize and setup a delegate for Gruveo
    delegate = [[GruveoDelegate alloc] init:self demoTokenSigning:demoTokenSigning];
    [GruveoCallManager setDelegate:delegate];
    
    // Set Gruveo ClientID
    [GruveoCallManager setClientId:clientID];
}

RCT_EXPORT_METHOD(call:(NSString *)code videoCall:(BOOL)video textChat:(BOOL)chat resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    // As we are doing a UI operation, run this on the main queue
    dispatch_sync(dispatch_get_main_queue(), ^{
        
        // Get the root view controller from the application itself
        UIViewController* rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
        
        [GruveoCallManager callCode:code videoCall:video textChat:chat onViewController:rootViewController callCreationCompletion:^(CallInitError creationError) {
            if (creationError != CallInitErrorNone) {
                reject([NSString stringWithFormat: @"%lu", (unsigned long)creationError], @"Error Creating Gruveo Room", nil);
            } else {
                resolve(nil);
            }
        }];
    });
}

// Supplies the signed token to the SDK
RCT_EXPORT_METHOD(authorize:(NSString*)signedToken)
{
    [GruveoCallManager authorize:signedToken];
}

// Ends the current call.
RCT_EXPORT_METHOD(endCall)
{
    [GruveoCallManager endCall];
}

// Returns the status of the current call in a promise
RCT_EXPORT_METHOD(isCallActive:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    BOOL status = [GruveoCallManager isCallActive];
    
    // We convert to an NSNumber which is automatically converted as a boolean in JS
    resolve([NSNumber numberWithBool:status]);
}

// Sets the microphone status.
RCT_EXPORT_METHOD(toggleAudio:(BOOL)enable)
{
    [GruveoCallManager toggleAudio:enable];
}

// Sets the camera status.
RCT_EXPORT_METHOD(toggleVideo:(BOOL)enable)
{
    [GruveoCallManager toggleVideo:enable];
}

// Sets the source for the outgoing video stream.
RCT_EXPORT_METHOD(switchCamera:(BOOL)useFront)
{
    [GruveoCallManager switchCamera:useFront];
}

// Sets the room lock state.
RCT_EXPORT_METHOD(toggleRoomLock:(BOOL)enable)
{
    [GruveoCallManager toggleRoomLock:enable];
}

// Starts or stops call recording.
RCT_EXPORT_METHOD(toggleRecording:(BOOL)enable)
{
    [GruveoCallManager toggleRecording:enable];
}

@end

