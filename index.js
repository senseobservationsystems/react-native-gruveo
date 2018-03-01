/**
 * @providesModule Gruveo
 */
'use strict';
import { NativeModules, NativeEventEmitter } from 'react-native';
const { RNGruveo } = NativeModules;
const nativeEventEmitter = new NativeEventEmitter(RNGruveo);

export var InitiateCallError = {
    'None': 0,              // Сall created successfully
    'CodeCallExist': 1,         // Curretn call not ended
    'MissingClientID': 2,       // The clientId value hasn't been set
    'InvalidCode': 3,           // The code value contains invalid characters
    'NetworkUnreachable': 4,    // The device is offline
    'MicrophoneAccessDenied': 5 // Microphone access denied by user
}

export var CallEndReason = {
    'InvalidCredentials': 0,        // Invalid token signature provided
    'InternalError': 1,                 // Internal error when creating call
    'OutdatedProtocolVersion': 2,       // Outdated SDK version
    'Busy': 3,                          // Call room is locked
    'HandleUnreachable': 4,             // Callee is unreachable
    'HandleBusy': 5,                    // Callee is busy with another call
    'HandleNonExist': 6,                // Gruveo handle doesn't exist
    'FreeDemoEnded': 7,                 // The 5-minute call limit has been reached (when using the demo client ID)
    'RoomLimitReached': 8,              // Room limit of 8 participants has been reached
    'NoConnection': 9,                  // Lost connection
    'User': 10,                          // Call ended normally from UI
    'OtherParty': 11,                     // Call ended normally by other party
}

export var CallStatus = {
    'requestToSignApiAuthToken': 'requestToSignApiAuthToken',       // Invalid token signature provided
    'callEstablished': 'callEstablished',                 // Internal error when creating call
    'callEnd': 'callEnd',                         // Outdated SDK version
    'recordingStateChanged': 'recordingStateChanged'
}

function onGruveoEventFired(body) {
    switch (body.name) {
        case 'requestToSignApiAuthToken':
            // Contains Payload
            break;
        case 'callEstablished':
            break;
        case 'callEnd':
            break;
        case 'recordingStateChanged':
            break;
    }
}

var GruveoSDKCallEventListener = null;

/**
 * Initialize Gruveo with the specified clientID
 * @param {string} clientID The clientID for the current client
 */
export function initialize(clientID) {
    RNGruveo.initialize(clientID, false);
}

/**
 * Initialize Gruveo in demo mode
 * This specifies a client id 'demo' and handles token signing internally to ease testing
 */
export function initializeDemo() {
    RNGruveo.initialize('demo', true);
}

/**
 * Initiate a call
 * @param {string} code The clientID for the current client
 * @param {bool} enableVideo Whether to enable video in this call
 * @param {bool} enableChat Whether to enable chat in this call
 * @param {callback} statusCallback
 * @return {Promise} Resolves to `true` when successful or returns an error code on failure
 */
export function call(code, enableVideo, enableChat, statusCallback)  {
    if (GruveoSDKCallEventListener != null) {
        console.warn("GruveoSDKCallEventListener is not null, did the last call end before you started this call?")
    }

    // Register Call event emitter
    GruveoSDKCallEventListener = nativeEventEmitter.addListener('GruveoSDK', (body) => {
        statusCallback(body.name, body.payload)

        // If this is a call end event, then remove the listener
        if (body.name == 'callEnd') {
            GruveoSDKCallEventListener.remove();
            GruveoSDKCallEventListener = null;
        }
    });

    // Return a promise
    return RNGruveo.call(code, enableVideo, enableChat)
}

/** 
 * Set authorization token in Gruveo SDK 
 * @param {string} signedToken The signedToken to set in the GruveoSDK
*/
export function authorize(signedToken) {
    RNGruveo.authorize(signedToken);
}

/** 
 * Ends the current call.
*/
export function endCall() {
    RNGruveo.endCall();
}

/**
 * Returns the status of the current call in a promise
 * @return {Promise} Resolves to a boolean with the status of the call
 */
export function isCallActive() {
    return RNGruveo.isCallActive();
}

/** 
 * Sets the microphone status.
 * @param {bool} enable
*/
export function toggleAudio(enable) {
    RNGruveo.toggleAudio(enable);
}

/** 
 * Sets the camera status.
 * @param {bool} enable
*/
export function toggleVideo(enable) {
    RNGruveo.toggleVideo(enable);
}

/** 
 * Sets the source for the outgoing video stream.
 * @param {bool} useFront
*/
export function switchCamera(useFront) {
    RNGruveo.switchCamera(useFront);
}

/** 
 * Sets the room lock state.
 * @param {bool} enable
*/
export function toggleRoomLock(enable) {
    RNGruveo.toggleRoomLock(enable);
}

/** 
 * Starts or stops call recording.
 * @param {bool} enable
*/
export function toggleRecording(enable) {
    RNGruveo.toggleRecording(enable);
}