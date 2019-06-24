package com.reactnativegruveo;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.gruveo.sdk.Gruveo;
import com.gruveo.sdk.model.CallEndReason;


import javax.annotation.Nullable;

public class GruveoModule extends ReactContextBaseJavaModule implements Gruveo.EventsListener {

    private static final String TAG = "RNGruveo";
    private static String clientID = "";

    public GruveoModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void initialize(String clientID) {
        GruveoModule.clientID = clientID;
    }

    @ReactMethod
    public void call(String code, boolean videoCall, boolean textChat) {
        final Bundle extras = new Bundle();
        extras.putBoolean(Gruveo.GRV_EXTRA_DISABLE_CHAT, !textChat);

        String result = new Gruveo.Builder(getCurrentActivity())
                .clientId(this.clientID)
                .callCode(code)
                .videoCall(videoCall)
                .otherExtras(extras)
                .eventsListener(this)
                .build();

        if (result.equals(Gruveo.GRV_INIT_OK)) {
            sendEvent("initialized", null);
        } else {
            // Check if there were any errors and reject the promise
            // We use the same error codes as specified in the iOS SDK for uniformity
            switch (result) {
                case Gruveo.GRV_INIT_MISSING_CLIENT_ID:
                    sendEvent("initFailed", "2");
                    break;
                case Gruveo.GRV_INIT_MISSING_CALL_CODE:
                case Gruveo.GRV_INIT_INVALID_CALL_CODE:
                    sendEvent("initFailed", "3");
                    break;
                case Gruveo.GRV_INIT_OFFLINE:
                    sendEvent("initFailed", "4");
                    break;
                default:
                    sendEvent("initFailed", "-1");
                    break;
            }
        }
    }

    @ReactMethod
    public void authorize(String token) {
        Gruveo.Companion.authorize(token);
    }

    @ReactMethod
    public void endCall() {
        new Handler(getReactApplicationContext().getMainLooper()).post(
            new Runnable() {
                @Override
                public void run() {
                    Gruveo.Companion.endCall();
                }
            });
    }

    @ReactMethod
    public void isCallActive(Promise promise) {
        promise.resolve(Gruveo.Companion.isCallActive());
    }

    @ReactMethod
    public void toggleAudio(boolean enable) {
        Gruveo.Companion.toggleAudio(enable);
    }

    @ReactMethod
    public void toggleVideo(boolean enable) {
        Gruveo.Companion.toggleVideo(enable);
    }

    @ReactMethod
    public void switchCamera(boolean useFront) {
        Gruveo.Companion.switchCamera(useFront);
    }

    @ReactMethod
    public void toggleRoomLock(boolean enable) {
        Gruveo.Companion.toggleRoomLock(enable);
    }

    @ReactMethod
    public void toggleRecording(boolean enable, int layout) {
        Gruveo.Companion.toggleRecording(enable, layout);
    }

    // Callbacks from Gruveo Event Listener
    @Override
    public void callInit(boolean videoCall, String code) {
        // Ignoring to avoid confusion as iOS does not have this event
    }

    @Override
    public void requestToSignApiAuthToken(String token) {
        sendEvent("requestToSignApiAuthToken", token);
    }

    @Override
    public void callEstablished(String code) {
        sendEvent("callEstablished", code);
    }

    @Override
    public void callEnd(Intent data, boolean isInForeground) {
        parseCallExtras(data);
    }

    @Override
    public void recordingStateChanged(boolean us, boolean them) {
        sendEvent("recordingStateChanged", null);
    }

    @Override
    public void recordingFilename(String filename) {
        sendEvent("recordingFilename", filename);
    }

    private void parseCallExtras(Intent data) {
        CallEndReason endReason = (CallEndReason) data.getSerializableExtra(Gruveo.GRV_RES_CALL_END_REASON);

        switch (endReason) {
            case INVALID_CREDENTIALS: {
                sendEvent("callEnd", "0");
                break;
            }
            case UNSUPPORTED_PROTOCOL_VERSION: {
                sendEvent("callEnd", "2");
                break;
            }
            case BUSY: {
                sendEvent("callEnd", "3");
                break;
            }
            case HANDLE_UNREACHABLE: {
                sendEvent("callEnd", "4");
                break;
            }
            case HANDLE_BUSY: {
                sendEvent("callEnd", "5");
                break;
            }
            case HANDLE_NONEXIST: {
                sendEvent("callEnd", "6");
                break;
            }
            case FREE_MULTIPARTY_ENDED:
            case FREE_DEMO_ENDED: {
                sendEvent("callEnd", "7");
                break;
            }
            case ROOM_LIMIT_REACHED: {
                sendEvent("callEnd", "8");
                break;
            }
            case NO_CONNECTION: {
                sendEvent("callEnd", "9");
                break;
            }
            case USER: {
                sendEvent("callEnd", "10");
                break;
            }
            case OTHER_PARTY: {
                sendEvent("callEnd", "11");
                break;
            }
            default: {
                // We consider all other use cases as internal error
                sendEvent("callEnd", "1");
                break;
            }
        }
    }

    // Helper class to send events to the JS bridge
    private void sendEvent(String name, @Nullable String payload) {

        // Create parameter map
        WritableMap params = Arguments.createMap();
        params.putString("name", name);
        if (payload != null) {
            params.putString("payload", payload);
        }

        // Send to react
        this.getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(TAG, params);
    }
}