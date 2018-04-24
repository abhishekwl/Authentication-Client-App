import React from "react";
import { View, StatusBar, StyleSheet, Image, Button, TextInput, Text, TouchableWithoutFeedback, Alert } from 'react-native';
import firebase from "firebase";
import CryptoJS from "crypto-js";

export default class App extends React.Component {
  state = {
    colorCode: "#673AB7",
    email: "",
    password: "",
    progress: false,
    uid: "",
    stage: false
  };

  componentWillMount() {
    const config = {
      apiKey: "AIzaSyCVxplaaD52ZQARrQ11gENihJ6buYdZrTw",
      authDomain: "fir-haxster.firebaseapp.com",
      databaseURL: "https://fir-haxster.firebaseio.com",
      projectId: "firebase-haxster",
      storageBucket: "firebase-haxster.appspot.com",
      messagingSenderId: "365096881394"
    };
    if (firebase.apps.length===0) firebase.initializeApp(config);
    console.ignoredYellowBox = [
      'Setting a timer'
    ];
  }

  render() {
    const {
      containerStyle,
      logoStyle,
      subtitleTextStyle,
      titleTextStyle,
      textInputStyle,
      buttonStyle,
      buttonTextStyle
    } = styles;

    return (
      <View style={ containerStyle }>
        <StatusBar hidden />
        <Image source={{ uri: "https://firebase.google.com/_static/images/firebase/touchicon-180.png"} } style={ logoStyle } />
        <Text style={ titleTextStyle }>{ "Sign in." }</Text>
        <Text style={ subtitleTextStyle }>{ "Two stage Authentication" }</Text>
        <TextInput
          placeholder="EMAIL ADDRESS"
          placeholderTextColor={ "#424242" }
          underlineColorAndroid={ this.state.colorCode }
          onChangeText={ text => this.setState({ email: text }) }
          style={ [textInputStyle, {marginTop: 40}] }
        />
        <TextInput
          secureTextEntry
          placeholder="PASSWORD"
          placeholderTextColor={"#424242"}
          underlineColorAndroid={this.state.colorCode}
          onChangeText={text => this.setState({ password: text })}
          style={[textInputStyle, {marginTop: 16}]}
        />
        <TouchableWithoutFeedback onPress={ this.onSignInButtonPress.bind(this) }>
          <View style={ buttonStyle }>
            <Text style={ buttonTextStyle }>{ (this.state.progress)?"Signing in...":"Sign In" }</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  encryptFun(data) {
    var date = new Date();
    this.setState({ stage: true });

    var key = CryptoJS.enc.Latin1.parse(date.getMinutes());
    var iv = CryptoJS.enc.Latin1.parse(date.getMinutes());
    var encrypted = CryptoJS.AES.encrypt(
      data,
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding }
    );
    //console.log('encrypted: ' + encrypted);
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv, padding: CryptoJS.pad.ZeroPadding }).toString(CryptoJS.enc.Utf8);
    //console.log('decrypted: ' + decrypted.toString(CryptoJS.enc.Utf8));

    Alert.alert("Auth", "ENCRYPTED: "+encrypted+"\nKEY: "+date.getMinutes().toString()+"\nDECRYPTED: "+decrypted, null);
    firebase.database().ref("Users/" +firebase.auth().currentUser.uid).set("COMPLETE");
  }

  onSignInButtonPress() {
    this.setState({ progress: true, stage: false });

    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(user=>{
      this.setState({ progress: false, uid: user.uid });

      firebase.database().ref("Users/"+user.uid).on("value", (snapshot)=>{
        if (snapshot.val()==="ACK") {
          this.encryptFun(user.uid);
        } else if (snapshot.val()==="COMPLETE" && this.state.stage===false)  {
          Alert.alert("Authentication Error", "Please sign in on the Website first.", null);
        }
      });
    }).catch(err=>{
      this.setState({ progress: false });
      Alert.alert("Authentication Error", err.toString(), null);
    });
  }
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20
  },
  logoStyle: {
    height: 136,
    width: 136,
    marginTop: 24
  },
  titleTextStyle: {
    color: "#424242",
    fontSize: 70,
    fontWeight: "bold",
    marginTop: 16
  },
  subtitleTextStyle: {
    color: "#424242",
    fontSize: 32,
    fontFamily: "sans-serif-light"
  },
  textInputStyle: {
    color: "black",
    fontFamily: "sans-serif-light",
    fontSize: 18
  },
  buttonStyle: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: "#673AB7",
    marginTop: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2
  },
  buttonTextStyle: {
    color: "#F5F5F5",
    fontSize: 24,
    fontWeight: "bold"
  }
});