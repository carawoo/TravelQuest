import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import { GameProvider } from './contexts/GameContext';

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Screens
import MapScreen from './screens/MapScreen';
import QuestsScreen from './screens/QuestsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GameProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
              paddingBottom: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          }}
        >
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              tabBarLabel: '탐험',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="🗺️" color={color} size={size} />
              ),
              headerTitle: '🧭 TravelQuest',
            }}
          />
          <Tab.Screen
            name="Quests"
            component={QuestsScreen}
            options={{
              tabBarLabel: '퀘스트',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="🎯" color={color} size={size} />
              ),
              headerTitle: '🎯 퀘스트',
            }}
          />
          <Tab.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              tabBarLabel: '업적',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="🏆" color={color} size={size} />
              ),
              headerTitle: '🏆 업적',
            }}
          />
          <Tab.Screen
            name="Community"
            component={CommunityScreen}
            options={{
              tabBarLabel: '커뮤니티',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="👥" color={color} size={size} />
              ),
              headerTitle: '👥 커뮤니티',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: '프로필',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="👤" color={color} size={size} />
              ),
              headerTitle: '👤 내 프로필',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}

// 탭 아이콘 컴포넌트
function TabIcon({ icon, color, size }) {
  return (
    <Text style={{ fontSize: size || 24, opacity: color === '#999' ? 0.6 : 1 }}>
      {icon}
    </Text>
  );
}
