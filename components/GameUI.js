import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// 경험치 바 컴포넌트
export function ExperienceBar({ current, max, level }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = (current / max) * 100;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [percentage]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.expBarContainer}>
      <View style={styles.expBarBg}>
        <Animated.View
          style={[
            styles.expBarFill,
            { width: widthInterpolation },
          ]}
        />
        <View style={styles.expBarGlow} />
      </View>
      <View style={styles.expBarInfo}>
        <Text style={styles.expBarLevel}>Lv.{level}</Text>
        <Text style={styles.expBarText}>
          {current} / {max} XP
        </Text>
      </View>
    </View>
  );
}

// 레벨업 애니메이션
export function LevelUpAnimation({ visible, level, onComplete }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 50,
            friction: 5,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
        Animated.delay(2000),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.levelUpContainer,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.levelUpGlow,
          {
            opacity: glowAnim,
          },
        ]}
      />
      <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
      <Text style={styles.levelUpLevel}>{level}</Text>
      <Text style={styles.levelUpSubtitle}>새로운 레벨 달성!</Text>
    </Animated.View>
  );
}

// 보상 팝업
export function RewardPopup({ visible, rewards, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(onClose);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible || !rewards) return null;

  return (
    <Animated.View
      style={[
        styles.rewardPopup,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <Text style={styles.rewardTitle}>🎁 보상 획득!</Text>
      {rewards.points && (
        <Text style={styles.rewardText}>+{rewards.points} XP</Text>
      )}
      {rewards.achievement && (
        <Text style={styles.rewardAchievement}>
          {rewards.achievement.icon} {rewards.achievement.title}
        </Text>
      )}
    </Animated.View>
  );
}

// 콤보 카운터
export function ComboCounter({ combo, visible }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && combo > 1) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.5,
          useNativeDriver: true,
          tension: 80,
          friction: 4,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [combo, visible]);

  if (!visible || combo <= 1) return null;

  return (
    <Animated.View
      style={[
        styles.comboContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.comboText}>COMBO</Text>
      <Text style={styles.comboNumber}>×{combo}</Text>
    </Animated.View>
  );
}

// 퀘스트 진행바
export function QuestProgress({ title, current, max, reward }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isComplete = current >= max;

  return (
    <View style={styles.questContainer}>
      <View style={styles.questHeader}>
        <Text style={styles.questTitle}>{title}</Text>
        <Text style={styles.questReward}>+{reward} XP</Text>
      </View>
      <View style={styles.questBarBg}>
        <View style={[styles.questBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.questProgress}>
        {current} / {max} {isComplete && '✓'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // 경험치 바
  expBarContainer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  expBarBg: {
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    position: 'absolute',
  },
  expBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  expBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  expBarLevel: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expBarText: {
    color: '#fff',
    fontSize: 12,
  },

  // 레벨업
  levelUpContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    zIndex: 1000,
  },
  levelUpGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    opacity: 0.3,
  },
  levelUpTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#FF6B00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  levelUpLevel: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  levelUpSubtitle: {
    fontSize: 16,
    color: '#aaa',
  },

  // 보상
  rewardPopup: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: -120,
    width: 240,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rewardAchievement: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },

  // 콤보
  comboContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(255, 107, 0, 0.9)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    zIndex: 998,
  },
  comboText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  comboNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },

  // 퀘스트
  questContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  questReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  questBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  questBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  questProgress: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
  },
});
