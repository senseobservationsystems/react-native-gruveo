/**
 * Gruveo React Native Sample App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View
} from 'react-native';
import * as Gruveo from 'react-native-gruveo';

type Props = {};
export default class App extends Component<Props> {

  componentDidMount() {
    Gruveo.initialize('demo');
  }

  callWithGruveo() {
    Gruveo.call('thisisanexampleroomcode', true, false, (status, payload) => {
      switch (status) {
        case Gruveo.CallStatus.initFailed:
          this.onCallInitFailed(Number(payload));
          break;
        case Gruveo.CallStatus.initialized:
          console.log("Initialized the room successfully");
          break;
        case Gruveo.CallStatus.requestToSignApiAuthToken:
          console.log("Request to sign token", payload);
          this.signTokenAndAuthorizeGruveo(payload)
          break;
        case Gruveo.CallStatus.callEstablished:
          console.log("Call Established");
          break;
        case Gruveo.CallStatus.callEnd:
          this.OnCallEnd(Number(payload));
          break;
        case Gruveo.CallStatus.recordingStateChanged:
          console.log("Call Recording State Changed");
          break;
        default:
          console.warn("Unknown call status", status, payload)
          break;
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Button onPress={this.callWithGruveo.bind(this)} title="Call With Gruveo!"/>
      </View>
    );
  }

  signTokenAndAuthorizeGruveo(token) {
    fetch('https://api-demo.gruveo.com/signer', {
        method: 'POST',
        body: token,
        headers: { 'Content-Type': 'text/plain' }
    }).then((response) => {
        response.text()
            .then( (signedToken) => {
                Gruveo.authorize(signedToken)
            })
            .catch((error) => {
                console.error(error);

                // To force termination of call lets authorize it with a wrong token
                Gruveo.authorize("");
            })
    }).catch((error) => {
        console.error(error);

        // To force termination of call lets authorize it with a wrong token
        Gruveo.authorize("");
    })
  }

  onCallInitFailed(errorCode) {
    switch (errorCode) {
      case Gruveo.InitiateCallError.MissingClientID:
        console.error("No client ID provided.");
        break;
      case Gruveo.InitiateCallError.InvalidCode:
        console.error("Invalid call code provided");
        break;
      case Gruveo.InitiateCallError.MicrophoneAccessDenied:
        console.error("Microphone access not provided in application");
        break;
      case Gruveo.InitiateCallError.NetworkUnreachable:
        console.error("Unable to connect to the network, are you connected to the internet?");
        break;
      default:
        console.error("An unkown error occurred initiating the call", errorCode)
        break;
    }
  }

  OnCallEnd(endCode) {
    switch (endCode) {
      case Gruveo.CallEndReason.InvalidCredentials:
        console.log("Invalid Credentials for call");;
        break;
      case Gruveo.CallEndReason.HandleUnreachable:
      case Gruveo.CallEndReason.HandleNonExist:
      case Gruveo.CallEndReason.HandleBusy:
        console.log("There is a problem with the callee");
        break;
      case Gruveo.CallEndReason.User:
        console.log("The user finished the call");
        break;
      case Gruveo.CallEndReason.OtherParty:
        console.log("The other party finished the call");
        break;
      case Gruveo.CallEndReason.FreeDemoEnded:
        console.log("Exceeded free demo time");
        break;
      case Gruveo.CallEndReason.RoomLimitReached:
        console.log("Exceeded maximum participants for the room");
        break;
      case Gruveo.CallEndReason.NoConnection:
        console.log("Could not create a connection to the room");
        break;
      case Gruveo.CallEndReason.InternalError:
        console.log("An internal error occured during the call");
        break;
      default:
        console.log("An unknown error occured during the call", endCode);
        break;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});
