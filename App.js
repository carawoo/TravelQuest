import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GameScreen from './screens/GameScreen';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <GameScreen />
    </View>
  );
}
