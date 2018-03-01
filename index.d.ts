declare module 'react-native-gruveo' {
    /**
     * Inidicates the type of error that occurred while initiating a call 
     */
    export enum InitiateCallError {
        UnknownError            = -1, // An unknown error has occurred
        None                    = 0,  // Сall created successfully
        CodeCallExist           = 1,  // Current call not ended
        MissingClientID         = 2,  // The clientId value hasn't been set
        InvalidCode             = 3,  // The code value contains invalid characters
        NetworkUnreachable      = 4,  // The device is offline
        MicrophoneAccessDenied  = 5   // Microphone access denied by user
    }

    /**
     * Inidicates the type of error that occurred while ending the call 
     */
    export enum CallEndReason { 
        InvalidCredentials      = 0,  // Invalid token signature provided
        InternalError           = 1,  // Internal error when creating call
        OutdatedProtocolVersion = 2,  // Outdated SDK version
        Busy                    = 3,  // Call room is locked
        HandleUnreachable       = 4,  // Callee is unreachable
        HandleBusy              = 5,  // Callee is busy with another call
        HandleNonExist          = 6,  // Gruveo handle doesn't exist
        FreeDemoEnded           = 7,  // The 5-minute call limit has been reached (when using the demo client ID)
        RoomLimitReached        = 8,  // Room limit of participants has been reached
        NoConnection            = 9,  // Lost connection
        User                    = 10, // Call ended normally from UI
        OtherParty              = 11  // Call ended normally by other party
    }

    /**
     * Inidicates a status change of the current call
     */
    export enum CallStatus { 
        requestToSignApiAuthToken   = 'requestToSignApiAuthToken',      // There is a request to sign the authentication token
        callEstablished             = 'callEstablished',                // Call has established  (2 or more people in room)
        callEnd                     = 'callEnd',                        // Call has finished for us (we finished or everyone has left)
        recordingStateChanged       = 'recordingStateChanged',          // The state of recording the current chat has changed
    }

    /**
     * Initialize Gruveo with the specified clientID
     * @param {string} clientID The clientID for the current client
     */
    export function initialize(clientID: string) : void;

    /**
     * Initiate a call
     * @param {string} code The clientID for the current client
     * @param {bool} enableVideo Whether to enable video in this call
     * @param {bool} enableChat Whether to enable chat in this call
     * @param {callback} statusCallback Returns CallStatus and a corresponding payload if applicable to the status event
     * @return {Promise} Resolves to `true` when successful or returns an InitiateCallError on failure
     */
    export function call(code:string, enableVideo:boolean, enableChat: boolean, statusCallback: ((status: CallStatus, payload: any) => void)): Promise<InitiateCallError>;

    /** 
     * Set authorization token in Gruveo SDK 
     * @param {string} signedToken The signedToken to set in the GruveoSDK
    */
    export function authorize(signedToken: string): void;
        
    /** 
     * Ends the current call.
    */
    export function endCall(): void;

    /**
     * Returns the status of the current call in a promise
     * @return {Promise} Resolves to a boolean with the status of the call
     */
    export function isCallActive(): Promise<boolean>;

    /** 
     * Sets the microphone status.
     * @param {bool} enable
    */
    export function toggleAudio(enable:boolean): void;

    /** 
     * Sets the camera status.
     * @param {bool} enable
    */
    export function toggleVideo(enable:boolean): void;

    /** 
     * Sets the source for the outgoing video stream.
     * @param {bool} useFront
    */
    export function switchCamera(useFront:boolean): void;
    /** 
     * Sets the room lock state.
     * @param {bool} enable
    */
    export function toggleRoomLock(enable:boolean): void;

    /** 
     * Starts or stops call recording.
     * @param {bool} enable
    */
    export function toggleRecording(enable:boolean): void;
}