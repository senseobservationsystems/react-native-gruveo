//
//  RNGruveo.m
//
//
//  Created by Umar Nizamani on 27/02/2018.
//

#import "RNGruveo.h"
@import GruveoSDK;

// Delegate for Gruveo
@implementation GruveoDelegate
{
    RCTEventEmitter *eventEmitter;
}

// Initialize the delegate with an event emitter to send events to react
- (id)init:(RCTEventEmitter*)eventEmitter_
{
    if( self = [super init] )
    {
        eventEmitter = eventEmitter_;
    }
    
    return self;
}

// Callback triggered when there is a request to sign an API token
- (void)requestToSignApiAuthToken:(NSString *)token {
    
    [eventEmitter sendEventWithName:GruveoSDKEventName body:@{@"name": @"requestToSignApiAuthToken", @"payload":token}];
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

// Initialize with ClientID
RCT_EXPORT_METHOD(initialize:(NSString*)clientID)
{
    // Initialize and setup a delegate for Gruveo
    delegate = [[GruveoDelegate alloc] init:self];
    [GruveoCallManager setDelegate:delegate];
    
    // Set Gruveo ClientID
    [GruveoCallManager setClientId:clientID];
}

RCT_EXPORT_METHOD(call:(NSString *)code videoCall:(BOOL)video textChat:(BOOL)chat)
{
    // As we are doing a UI operation, run this on the main queue
    dispatch_sync(dispatch_get_main_queue(), ^{
        
        // Get the root view controller from the application itself
        UIViewController* rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
        
        [GruveoCallManager callCode:code videoCall:video textChat:chat onViewController:rootViewController callCreationCompletion:^(CallInitError creationError) {
            if (creationError != CallInitErrorNone) {
                [self sendEventWithName:GruveoSDKEventName body:@{@"name": @"initFailed", @"payload":[NSString stringWithFormat: @"%lu", (unsigned long)creationError]}];
            } else {
                [self sendEventWithName:GruveoSDKEventName body:@{@"name": @"initialized"}];
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

