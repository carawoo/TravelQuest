import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { supabase } from '../config/supabase';

const { width, height } = Dimensions.get('window');

// 타일 크기 - 2D 탑다운 뷰 (ZEP 스타일)
const TILE_SIZE = 48; // 타일 크기
const MAP_WIDTH = 35;
const MAP_HEIGHT = 30;
const CHAT_RANGE = 5;
const MOVE_SPEED = 3; // 픽셀 단위 이동 속도

// 캐릭터 스타일 옵션 (귀여운 동물 이모지)
const CHARACTER_STYLES = [
  { id: 1, emoji: '🐰', name: '토끼', color: '#FFB6C1' },
  { id: 2, emoji: '🐻', name: '곰', color: '#DEB887' },
  { id: 3, emoji: '🐱', name: '고양이', color: '#FFE4B5' },
  { id: 4, emoji: '🐶', name: '강아지', color: '#F4A460' },
  { id: 5, emoji: '🐼', name: '판다', color: '#E0E0E0' },
  { id: 6, emoji: '🐨', name: '코알라', color: '#D3D3D3' },
  { id: 7, emoji: '🦊', name: '여우', color: '#FF8C69' },
  { id: 8, emoji: '🐷', name: '돼지', color: '#FFB6D9' },
  { id: 9, emoji: '🐮', name: '소', color: '#E6E6FA' },
  { id: 10, emoji: '🐹', name: '햄스터', color: '#FFDAB9' },
  { id: 11, emoji: '🐭', name: '쥐', color: '#C0C0C0' },
  { id: 12, emoji: '🐯', name: '호랑이', color: '#FFA500' },
];

// 맵 데이터
const MAPS = {
  forest: {
    name: '열린 초원',
    data: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0],
      [0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
};

export default function GameScreen() {
  const [gameState, setGameState] = useState('nickname-input'); // 'nickname-input', 'character-select', 'game'
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [selectedCharacterStyle, setSelectedCharacterStyle] = useState(CHARACTER_STYLES[0]);

  const [currentMap, setCurrentMap] = useState('forest');
  const [player, setPlayer] = useState({
    x: 17 * TILE_SIZE + TILE_SIZE / 2, // 맵 중앙의 안전한 위치
    y: 15 * TILE_SIZE + TILE_SIZE / 2,
    name: '나',
    style: CHARACTER_STYLES[0],
  });
  const [playerId, setPlayerId] = useState(null); // Supabase에서 생성된 플레이어 ID
  const [keysPressed, setKeysPressed] = useState({}); // 현재 눌린 키들
  const [skinModalVisible, setSkinModalVisible] = useState(false);
  const [otherPlayers, setOtherPlayers] = useState([]); // 다른 플레이어들
  const [usedNicknames, setUsedNicknames] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);
  const [playerBubble, setPlayerBubble] = useState(null);
  const playerBubbleTimer = useRef(null);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);
  const lastPositionUpdate = useRef(Date.now());

  // 캐릭터 애니메이션
  const playerBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(playerBounce, {
          toValue: -3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(playerBounce, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 플레이어 나갈 때 정리
  useEffect(() => {
    return () => {
      if (playerId) {
        // 비동기 삭제 (정리 시)
        supabase.from('players').delete().eq('id', playerId);
      }
    };
  }, [playerId]);

  const isWalkable = (pixelX, pixelY, map) => {
    // 캐릭터 히트박스를 작게 만들어 끼임 방지 (중심점 기준 20x20 픽셀)
    const hitboxSize = 10;
    const points = [
      { x: pixelX, y: pixelY }, // 중심
      { x: pixelX - hitboxSize, y: pixelY - hitboxSize }, // 왼쪽 위
      { x: pixelX + hitboxSize, y: pixelY - hitboxSize }, // 오른쪽 위
      { x: pixelX - hitboxSize, y: pixelY + hitboxSize }, // 왼쪽 아래
      { x: pixelX + hitboxSize, y: pixelY + hitboxSize }, // 오른쪽 아래
    ];

    // 모든 점이 걸을 수 있는 타일이어야 함
    for (const point of points) {
      const tileX = Math.floor(point.x / TILE_SIZE);
      const tileY = Math.floor(point.y / TILE_SIZE);

      if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return false;
      const tile = map[tileY][tileX];
      if (tile !== 0 && tile !== 2 && tile !== 4) return false; // 0: 잔디, 2: 꽃, 4: 포털
    }

    return true;
  };

  const checkPortal = (pixelX, pixelY) => {
    const tileX = Math.floor(pixelX / TILE_SIZE);
    const tileY = Math.floor(pixelY / TILE_SIZE);

    const mapData = MAPS[currentMap];
    if (mapData.data[tileY][tileX] === 4) {
      setCurrentMap(mapData.portal.to);
      const newMapData = MAPS[mapData.portal.to];
      setPlayer(prev => ({
        ...prev,
        x: newMapData.portal.x * TILE_SIZE + TILE_SIZE / 2,
        y: newMapData.portal.y * TILE_SIZE + TILE_SIZE / 2,
      }));
    }
  };

  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // 키보드 입력 추적
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (document.activeElement.tagName === 'INPUT') return;
        const key = e.key.toLowerCase();
        if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
          setKeysPressed(prev => ({ ...prev, [key]: true }));
          e.preventDefault();
        }
      };

      const handleKeyUp = (e) => {
        const key = e.key.toLowerCase();
        setKeysPressed(prev => {
          const newKeys = { ...prev };
          delete newKeys[key];
          return newKeys;
        });
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  // 부드러운 이동 루프
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let moved = false;

        // 눌린 키에 따라 이동
        if (keysPressed['w'] || keysPressed['arrowup']) {
          newY -= MOVE_SPEED;
          moved = true;
        }
        if (keysPressed['s'] || keysPressed['arrowdown']) {
          newY += MOVE_SPEED;
          moved = true;
        }
        if (keysPressed['a'] || keysPressed['arrowleft']) {
          newX -= MOVE_SPEED;
          moved = true;
        }
        if (keysPressed['d'] || keysPressed['arrowright']) {
          newX += MOVE_SPEED;
          moved = true;
        }

        if (!moved) return prev;

        const mapData = MAPS[currentMap].data;

        // 대각선 이동 우선 시도
        if (isWalkable(newX, newY, mapData)) {
          checkPortal(newX, newY);
          return { ...prev, x: newX, y: newY };
        }

        // 대각선이 막혔으면 X축만 시도
        if (isWalkable(newX, prev.y, mapData)) {
          checkPortal(newX, prev.y);
          return { ...prev, x: newX };
        }

        // X축도 막혔으면 Y축만 시도
        if (isWalkable(prev.x, newY, mapData)) {
          checkPortal(prev.x, newY);
          return { ...prev, y: newY };
        }

        // 모두 막혔으면 움직이지 않음
        return prev;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [keysPressed, currentMap]);

  // 플레이어 생성 및 실시간 구독
  useEffect(() => {
    if (gameState !== 'game' || !playerId) return;

    let playersChannel;
    let chatChannel;

    const setupRealtimeSubscriptions = async () => {
      // 다른 플레이어들 실시간 구독
      playersChannel = supabase
        .channel('players-channel')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'players' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const playerData = payload.new;
              if (playerData.id !== playerId) {
                setOtherPlayers(prev => {
                  const filtered = prev.filter(p => p.id !== playerData.id);
                  return [...filtered, {
                    id: playerData.id,
                    name: playerData.name,
                    x: playerData.x,
                    y: playerData.y,
                    style: CHARACTER_STYLES[playerData.style_index] || CHARACTER_STYLES[0],
                  }];
                });
              }
            } else if (payload.eventType === 'DELETE') {
              setOtherPlayers(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // 채팅 메시지 실시간 구독
      chatChannel = supabase
        .channel('chat-channel')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const message = payload.new;
            setChatMessages(prev => [...prev, {
              user: message.player_name,
              text: message.message,
              time: new Date(message.created_at).getTime(),
            }]);

            setTimeout(() => {
              chatScrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        )
        .subscribe();

      // 기존 플레이어들 불러오기
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .neq('id', playerId);

      if (existingPlayers) {
        setOtherPlayers(existingPlayers.map(p => ({
          id: p.id,
          name: p.name,
          x: p.x,
          y: p.y,
          style: CHARACTER_STYLES[p.style_index] || CHARACTER_STYLES[0],
        })));
      }

      // 최근 채팅 메시지 불러오기
      const { data: recentMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (recentMessages) {
        setChatMessages(recentMessages.map(m => ({
          user: m.player_name,
          text: m.message,
          time: new Date(m.created_at).getTime(),
        })));

        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    };

    setupRealtimeSubscriptions();

    // 플레이어 위치 업데이트 (0.5초마다)
    const positionInterval = setInterval(async () => {
      if (playerId) {
        await supabase
          .from('players')
          .update({
            x: player.x,
            y: player.y,
            last_seen: new Date().toISOString(),
          })
          .eq('id', playerId);
      }
    }, 500);

    // 정리
    return () => {
      clearInterval(positionInterval);
      if (playersChannel) supabase.removeChannel(playersChannel);
      if (chatChannel) supabase.removeChannel(chatChannel);
    };
  }, [gameState, playerId, player.x, player.y]);

  useEffect(() => {
    // 2D 탑다운 뷰 - 플레이어를 화면 중앙에 배치 (픽셀 기반)
    const viewportWidth = width;
    const viewportHeight = height - 280;

    // 카메라 오프셋 (픽셀 단위)
    const offsetX = Math.max(
      0,
      Math.min(
        MAP_WIDTH * TILE_SIZE - viewportWidth,
        player.x - viewportWidth / 2
      )
    );
    const offsetY = Math.max(
      0,
      Math.min(
        MAP_HEIGHT * TILE_SIZE - viewportHeight,
        player.y - viewportHeight / 2
      )
    );

    setCameraOffset({ x: offsetX, y: offsetY });
  }, [player]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !playerId) {
      console.log('Cannot send message:', { hasInput: !!chatInput.trim(), hasPlayerId: !!playerId });
      return;
    }

    const messageText = chatInput.trim();
    const now = Date.now();

    try {
      // 로컬에 즉시 메시지 추가 (낙관적 업데이트)
      const newMessage = {
        user: player.name,
        text: messageText,
        time: now,
      };
      setChatMessages(prev => [...prev, newMessage]);

      // Supabase에 채팅 메시지 저장
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          player_id: playerId,
          player_name: player.name,
          message: messageText,
        });

      if (error) {
        console.error('Error sending message:', error);
      } else {
        console.log('Message sent successfully:', data);
      }

      // 이전 타이머 취소
      if (playerBubbleTimer.current) {
        clearTimeout(playerBubbleTimer.current);
      }

      setPlayerBubble(messageText);
      // 새로운 타이머 시작
      playerBubbleTimer.current = setTimeout(() => {
        setPlayerBubble(null);
        playerBubbleTimer.current = null;
      }, 5000);

      setChatInput('');

      // 채팅 스크롤
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Exception sending message:', err);
    }
  };

  const handleSelectStyle = (style) => {
    setPlayer({ ...player, style });
    setSkinModalVisible(false);
  };

  const handleNicknameSubmit = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      setNicknameError('닉네임은 2-10자로 입력해주세요.');
      return;
    }

    // Supabase에서 닉네임 중복 체크
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('name')
      .eq('name', trimmedNickname);

    if (existingPlayers && existingPlayers.length > 0) {
      setNicknameError('이미 사용 중인 닉네임입니다.');
      return;
    }

    setNicknameError('');
    setGameState('character-select');
  };

  const handleCharacterSelect = (style) => {
    setSelectedCharacterStyle(style);
  };

  const handleStartGame = async () => {
    const startX = 17 * TILE_SIZE + TILE_SIZE / 2;
    const startY = 15 * TILE_SIZE + TILE_SIZE / 2;

    setPlayer({
      x: startX,
      y: startY,
      name: nickname,
      style: selectedCharacterStyle,
    });

    try {
      // Supabase에 플레이어 생성
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: nickname,
          x: startX,
          y: startY,
          style_index: selectedCharacterStyle.id - 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating player:', error);
        alert('플레이어 생성 실패: ' + error.message + '\n\nSupabase 테이블을 생성해주세요!');
        return;
      }

      if (data) {
        console.log('Player created:', data);
        setPlayerId(data.id);

        // 입장 메시지 추가
        const { error: chatError } = await supabase
          .from('chat_messages')
          .insert({
            player_id: data.id,
            player_name: nickname,
            message: '입장하였습니다.',
          });

        if (chatError) {
          console.error('Error sending join message:', chatError);
        }
      }

      setGameState('game');
    } catch (err) {
      console.error('Exception starting game:', err);
      alert('게임 시작 실패: ' + err.message);
    }
  };

  const handleMapClick = (event) => {
    if (Platform.OS !== 'web') return;

    const { locationX, locationY } = event.nativeEvent;

    // 2D 탑다운 뷰 - 클릭한 픽셀 위치 계산
    const targetPixelX = locationX + cameraOffset.x;
    const targetPixelY = locationY + cameraOffset.y;

    const mapData = MAPS[currentMap].data;
    if (isWalkable(targetPixelX, targetPixelY, mapData)) {
      setTargetPosition({ x: targetPixelX, y: targetPixelY });
    }
  };

  // 자동 이동 로직 (픽셀 단위)
  useEffect(() => {
    if (!targetPosition) return;

    const interval = setInterval(() => {
      setPlayer(prev => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 목표 지점 도착
        if (distance < MOVE_SPEED) {
          setTargetPosition(null);
          return { ...prev, x: targetPosition.x, y: targetPosition.y };
        }

        // 정규화된 방향 벡터
        const dirX = dx / distance;
        const dirY = dy / distance;

        const newX = prev.x + dirX * MOVE_SPEED;
        const newY = prev.y + dirY * MOVE_SPEED;

        const mapData = MAPS[currentMap].data;

        // 대각선 이동 우선 시도
        if (isWalkable(newX, newY, mapData)) {
          checkPortal(newX, newY);
          return { ...prev, x: newX, y: newY };
        }

        // 대각선이 막혔으면 X축만 시도
        if (isWalkable(newX, prev.y, mapData)) {
          checkPortal(newX, prev.y);
          return { ...prev, x: newX };
        }

        // X축도 막혔으면 Y축만 시도
        if (isWalkable(prev.x, newY, mapData)) {
          checkPortal(prev.x, newY);
          return { ...prev, y: newY };
        }

        // 모두 막혔으면 자동 이동 중단
        setTargetPosition(null);
        return prev;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [targetPosition, currentMap]);

  const renderTiles = () => {
    const tiles = [];
    const mapData = MAPS[currentMap].data;

    // 2D 탑다운 뷰 렌더링 (픽셀 기반)
    for (let mapY = 0; mapY < MAP_HEIGHT; mapY++) {
      for (let mapX = 0; mapX < MAP_WIDTH; mapX++) {
        const tileType = mapData[mapY][mapX];

        // 화면 좌표 계산 (픽셀 단위 카메라 오프셋 적용)
        const screenX = mapX * TILE_SIZE - cameraOffset.x;
        const screenY = mapY * TILE_SIZE - cameraOffset.y;

        // 화면 밖의 타일은 렌더링하지 않음 (최적화)
        if (screenX < -TILE_SIZE || screenX > width || screenY < -TILE_SIZE || screenY > height - 280) {
          continue;
        }

        const zIndex = mapY * MAP_WIDTH + mapX;

        if (tileType === 1) {
          // 나무 타일
          tiles.push(
            <View key={`${mapX}-${mapY}`} style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: zIndex,
            }}>
              <View style={styles.treeTile}>
                <Text style={styles.treeIcon}>🌲</Text>
              </View>
            </View>
          );
        } else if (tileType === 3) {
          // 호수 타일
          tiles.push(
            <View key={`${mapX}-${mapY}`} style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: zIndex,
            }}>
              <View style={styles.waterTile} />
            </View>
          );
        } else {
          // 잔디 바닥 타일
          tiles.push(
            <View key={`${mapX}-${mapY}`} style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: zIndex,
            }}>
              <View style={styles.grassTile} />
            </View>
          );

          // 오브젝트 렌더링
          if (tileType === 2) {
            // 꽃
            tiles.push(
              <View key={`obj-${mapX}-${mapY}`} style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: TILE_SIZE,
                height: TILE_SIZE,
                zIndex: zIndex + 10000,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={styles.flowerIcon}>🌸</Text>
              </View>
            );
          }
        }
      }
    }
    return tiles;
  };

  const renderCharacters = () => {
    const characters = [];

    // 다른 플레이어들 렌더링 (픽셀 기반)
    otherPlayers.forEach((otherPlayer) => {
      const screenX = otherPlayer.x - cameraOffset.x - TILE_SIZE / 2;
      const screenY = otherPlayer.y - cameraOffset.y - TILE_SIZE / 2;
      const tileY = Math.floor(otherPlayer.y / TILE_SIZE);
      const tileX = Math.floor(otherPlayer.x / TILE_SIZE);
      const zIndex = tileY * MAP_WIDTH + tileX + 20000;

      characters.push(
        <View
          key={`player-${otherPlayer.id}`}
          style={[
            styles.character,
            {
              left: screenX,
              top: screenY,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: zIndex
            },
          ]}
        >
          <View style={[styles.characterAvatarContainer, { backgroundColor: otherPlayer.style.color || '#5B9BD5' }]}>
            <Text style={styles.characterEmoji}>{otherPlayer.style.emoji || '🐰'}</Text>
          </View>
          <View style={styles.nameTag}>
            <Text style={styles.nameText}>{otherPlayer.name}</Text>
          </View>
        </View>
      );
    });

    // 플레이어 렌더링 (픽셀 기반)
    const playerScreenX = player.x - cameraOffset.x - TILE_SIZE / 2;
    const playerScreenY = player.y - cameraOffset.y - TILE_SIZE / 2;
    const playerTileY = Math.floor(player.y / TILE_SIZE);
    const playerZIndex = playerTileY * MAP_WIDTH + Math.floor(player.x / TILE_SIZE) + 20000;

    characters.push(
      <Animated.View
        key="player"
        style={[
          styles.character,
          {
            left: playerScreenX,
            top: playerScreenY,
            width: TILE_SIZE,
            height: TILE_SIZE,
            zIndex: playerZIndex
          },
          { transform: [{ translateY: playerBounce }] },
        ]}
      >
        {playerBubble && (
          <View style={styles.speechBubble}>
            <Text style={styles.speechBubbleText}>{playerBubble}</Text>
            <View style={styles.bubbleTail} />
          </View>
        )}
        <View style={[styles.characterAvatarContainer, { backgroundColor: player.style.color || '#5B9BD5' }]}>
          <Text style={styles.characterEmoji}>{player.style.emoji || '🐰'}</Text>
        </View>
        <View style={[styles.nameTag, styles.playerNameTag]}>
          <Text style={[styles.nameText, styles.playerNameText]}>
            {player.name}
          </Text>
        </View>
      </Animated.View>
    );

    return characters;
  };

  const getVisibleMessages = () => {
    // 같은 맵에 있는 모든 채팅 메시지 표시
    return chatMessages;
  };

  const renderMinimap = () => {
    const minimapSize = 140;
    const tileScale = minimapSize / MAP_WIDTH;
    const mapData = MAPS[currentMap].data;

    return (
      <View style={styles.minimapContainer}>
        <View style={[styles.minimap, { width: minimapSize, height: minimapSize * (MAP_HEIGHT / MAP_WIDTH) }]}>
          {/* 맵 타일들 */}
          {mapData.map((row, y) =>
            row.map((tile, x) => {
              if (tile === 1) {
                return (
                  <View
                    key={`mini-${x}-${y}`}
                    style={[
                      styles.minimapTile,
                      {
                        left: x * tileScale,
                        top: y * tileScale,
                        width: tileScale,
                        height: tileScale,
                        backgroundColor: '#D0D0D0',
                      },
                    ]}
                  />
                );
              }
              return null;
            })
          )}

          {/* 다른 플레이어 위치 */}
          {otherPlayers.map((otherPlayer) => (
            <View
              key={`mini-player-${otherPlayer.id}`}
              style={[
                styles.minimapDot,
                {
                  left: (otherPlayer.x / TILE_SIZE) * tileScale - 2,
                  top: (otherPlayer.y / TILE_SIZE) * tileScale - 2,
                  backgroundColor: '#999999',
                },
              ]}
            />
          ))}

          {/* 플레이어 위치 */}
          <View
            style={[
              styles.minimapDot,
              {
                left: (player.x / TILE_SIZE) * tileScale - 3,
                top: (player.y / TILE_SIZE) * tileScale - 3,
                backgroundColor: '#5B9BD5',
                width: 6,
                height: 6,
                borderRadius: 3,
              },
            ]}
          />
        </View>

        {/* 방문자 수 */}
        <View style={styles.visitorCount}>
          <Text style={styles.visitorIcon}>👥</Text>
          <Text style={styles.visitorText}>{otherPlayers.length + 1}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.gameView}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleMapClick}
      >
        {renderTiles()}
        {renderCharacters()}
      </View>

      <View style={styles.topBar}>
        <View style={styles.mapInfo}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapName}>{MAPS[currentMap].name}</Text>
        </View>

        <TouchableOpacity
          style={styles.skinButton}
          onPress={() => setSkinModalVisible(true)}
        >
          <View style={[styles.skinButtonAvatarContainer, { backgroundColor: player.style.color || '#5B9BD5' }]}>
            <Text style={styles.skinButtonEmoji}>{player.style.emoji || '🐰'}</Text>
          </View>
          <Text style={styles.skinButtonText}>캐릭터</Text>
        </TouchableOpacity>
      </View>

      {renderMinimap()}

      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>💬 채팅</Text>
          <View style={styles.chatBadge}>
            <Text style={styles.chatCount}>{getVisibleMessages().length}</Text>
          </View>
        </View>

        <ScrollView
          ref={chatScrollRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatMessagesContent}
        >
          {getVisibleMessages().map((msg, index) => (
            <View key={index} style={styles.chatMessage}>
              <Text style={styles.chatUser}>{msg.user}</Text>
              <Text style={styles.chatText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="채팅을 입력하세요..."
            placeholderTextColor="#999999"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={skinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSkinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ 캐릭터 선택</Text>

            <ScrollView style={styles.skinGrid}>
              <View style={styles.skinGridContent}>
                {CHARACTER_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.skinOption,
                      player.style.id === style.id && styles.skinOptionSelected,
                    ]}
                    onPress={() => handleSelectStyle(style)}
                  >
                    <View style={[styles.skinAvatarContainer, { backgroundColor: style.color }]}>
                      <Text style={styles.skinEmoji}>{style.emoji}</Text>
                    </View>
                    <Text style={styles.skinName}>{style.name}</Text>
                    {player.style.id === style.id && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSkinModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 닉네임 입력 모달 */}
      <Modal
        visible={gameState === 'nickname-input'}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>TravelQuest</Text>
            <Text style={styles.modalSubtitle}>닉네임을 입력해주세요</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.nicknameInput}
                placeholder="닉네임 (2-10자)"
                placeholderTextColor="#999999"
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  setNicknameError('');
                }}
                onSubmitEditing={handleNicknameSubmit}
                maxLength={10}
                autoFocus
              />
              {nicknameError ? (
                <Text style={styles.errorText}>{nicknameError}</Text>
              ) : null}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleNicknameSubmit}>
              <Text style={styles.primaryButtonText}>다음</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 캐릭터 선택 모달 */}
      <Modal
        visible={gameState === 'character-select'}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>캐릭터 선택</Text>
            <Text style={styles.modalSubtitle}>{nickname}님의 캐릭터를 선택하세요</Text>

            <ScrollView style={styles.characterSelectScroll}>
              <View style={styles.characterSelectContent}>
                {CHARACTER_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.characterSelectOption,
                      selectedCharacterStyle.id === style.id && styles.characterSelectOptionSelected,
                    ]}
                    onPress={() => handleCharacterSelect(style)}
                  >
                    <View style={[styles.characterSelectAvatarContainer, { backgroundColor: style.color }]}>
                      <Text style={styles.characterSelectEmoji}>{style.emoji}</Text>
                    </View>
                    <Text style={styles.characterSelectName}>{style.name}</Text>
                    {selectedCharacterStyle.id === style.id && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.primaryButton} onPress={handleStartGame}>
              <Text style={styles.primaryButtonText}>입장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  gameView: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
  },
  grassTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#C5D86D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grassDecor: {
    fontSize: 16,
    opacity: 0.4,
  },
  treeTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#558B2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#64B5F6',
  },
  treeIcon: {
    fontSize: 32,
  },
  flowerIcon: {
    fontSize: 24,
  },
  portalIcon: {
    fontSize: 36,
  },
  character: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    overflow: 'hidden',
  },
  characterEmoji: {
    fontSize: 32,
  },
  nameTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(91, 155, 213, 0.5)',
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playerNameTag: {
    backgroundColor: 'rgba(91, 155, 213, 0.95)',
    borderColor: '#5B9BD5',
    borderWidth: 2,
  },
  nameText: {
    fontSize: 10,
    color: '#333333',
    fontWeight: '700',
  },
  playerNameText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  speechBubble: {
    position: 'absolute',
    bottom: TILE_SIZE + 8,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: 400,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  speechBubbleText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  mapIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  mapName: {
    fontSize: 15,
    color: '#333333',
    fontWeight: 'bold',
  },
  skinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  skinButtonAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  skinButtonEmoji: {
    fontSize: 20,
  },
  skinButtonText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: 'bold',
  },
  controlsHint: {
    position: 'absolute',
    bottom: 296,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    lineHeight: 16,
  },
  chatContainer: {
    height: 280,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  chatHeader: {
    padding: 16,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  chatBadge: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
  },
  chatCount: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    padding: 12,
  },
  chatMessagesContent: {
    paddingBottom: 8,
  },
  chatMessage: {
    marginBottom: 10,
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 16,
  },
  chatUser: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5B9BD5',
    marginBottom: 4,
  },
  chatText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 14,
    color: '#333333',
  },
  sendButton: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    width: '85%',
    maxWidth: 420,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  skinGrid: {
    flex: 1,
  },
  skinGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  skinOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  skinOptionSelected: {
    backgroundColor: '#E8F3FF',
    borderWidth: 2,
    borderColor: '#5B9BD5',
  },
  skinAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  skinEmoji: {
    fontSize: 40,
  },
  skinName: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#5B9BD5',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#5B9BD5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginTop: 24,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  minimapContainer: {
    position: 'absolute',
    bottom: 296,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  minimap: {
    position: 'relative',
    backgroundColor: '#F8F6F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  minimapTile: {
    position: 'absolute',
  },
  minimapDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  visitorCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  visitorIcon: {
    fontSize: 14,
  },
  visitorText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  nicknameInput: {
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    fontSize: 16,
    color: '#333333',
    width: '100%',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: '#5B9BD5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  characterSelectScroll: {
    width: '100%',
    maxHeight: 320,
    marginBottom: 24,
  },
  characterSelectContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  characterSelectOption: {
    width: '30%',
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  characterSelectOptionSelected: {
    backgroundColor: '#E8F3FF',
    borderWidth: 2,
    borderColor: '#5B9BD5',
  },
  characterSelectAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  characterSelectEmoji: {
    fontSize: 40,
  },
  characterSelectName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
});
