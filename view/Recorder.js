'use strict';
import React, { PureComponent } from 'react';
import { ActivityIndicator, AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from "axios"
import { BACKEND, PORT } from 'react-native-dotenv'

const API = `${BACKEND}:${PORT}`

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

class Recorder extends PureComponent {
  constructor() {
    super()
    this.state = {
      recording: false,
      processing: false,
      cameraReady: false,
    }
    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)
    this.handleReady = this.handleReady.bind(this)
  }

  componentDidMount() {
    console.log("mounted", API)
    axios.get(`${API}`)
      .then(data => {
        console.log("data", data)
      })
      .catch(err => {
        console.log("err", err)
      })
  }

  async startRecording() {
    this.setState({ recording: true });
    // default to mp4 for android as codec is not set
    const { uri, codec = "mp4" } = await this.camera.recordAsync();
    this.setState({ recording: false, processing: true });
    const type = `video/${codec}`;
  
    const data = new FormData();
    data.append("video", {
      name: "mobile-video-upload",
      type,
      uri
    });
  
    try {
      await fetch(API, {
        method: "post",
        body: data
      });
    } catch (e) {
      console.error(e);
    }
  
    this.setState({ processing: false });
  }

  stopRecording() {
    this.camera.stopRecording();
  }

  handleRecordingEnd(e) {
    console.log("e", e)
  }

  handleReady() {
    this.setState({cameraReady: true})
  }

    render() {
      const { recording, processing } = this.state;
  
      let button = (
        <TouchableOpacity
          onPress={this.startRecording.bind(this)}
          style={styles.capture}
        >
          <Text style={{ fontSize: 14 }}> RECORD </Text>
        </TouchableOpacity>
      );
  
      if (recording) {
        button = (
          <TouchableOpacity
            onPress={this.stopRecording.bind(this)}
            style={styles.capture}
          >
            <Text style={{ fontSize: 14 }}> STOP </Text>
          </TouchableOpacity>
        );
      }
  
      if (processing) {
        button = (
          <View style={styles.capture}>
            <ActivityIndicator animating size={18} />
          </View>
        );
      }
  
      return (
        <View style={styles.container}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
          />
          <View
            style={{ flex: 0, flexDirection: "row", justifyContent: "center" }}
          >
            {button}
          </View>
        </View>
      );
    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});


export default Recorder