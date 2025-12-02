import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

// 커뮤니티 더미 데이터 (실제로는 백엔드에서 가져와야 함)
const DUMMY_POSTS = [
  {
    id: '1',
    user: '여행가123',
    level: 7,
    place: '남이섬',
    content: '가을 단풍이 정말 예뻤어요! 사진 찍기 최고의 장소입니다.',
    likes: 42,
    comments: 12,
    rating: 5,
    tags: ['단풍', '사진명소', '데이트'],
    timestamp: Date.now() - 3600000,
  },
  {
    id: '2',
    user: '산악인99',
    level: 9,
    place: '설악산',
    content: '대청봉 등반 성공! 날씨가 좋아서 경치가 환상적이었습니다. 등산 초보자에게는 힘들 수 있으니 준비 잘 하세요.',
    likes: 87,
    comments: 23,
    rating: 5,
    tags: ['등산', '단풍', '등산초보주의'],
    timestamp: Date.now() - 7200000,
  },
  {
    id: '3',
    user: '바다러버',
    level: 5,
    place: '해운대 해수욕장',
    content: '주차가 정말 힘들어요 ㅠㅠ 대중교통 이용을 추천합니다. 하지만 바다는 역시 최고!',
    likes: 34,
    comments: 8,
    rating: 4,
    tags: ['주차어려움', '대중교통추천', '여름'],
    timestamp: Date.now() - 10800000,
  },
  {
    id: '4',
    user: '숨은명소헌터',
    level: 10,
    place: '강화도 석모도',
    content: '숨은 명소 발견! 사람이 많지 않아서 조용히 힐링하기 좋습니다. 펜션도 저렴하고 깨끗해요.',
    likes: 156,
    comments: 45,
    rating: 5,
    tags: ['숨은명소', '힐링', '조용함', '가성비'],
    timestamp: Date.now() - 14400000,
  },
];

export default function CommunityScreen() {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filters = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'popular', name: '인기', icon: '🔥' },
    { id: 'recent', name: '최신', icon: '⏰' },
    { id: 'nearby', name: '근처', icon: '📍' },
  ];

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소 또는 태그 검색..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 게시글 목록 */}
      <ScrollView style={styles.postsList}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* 작성자 정보 */}
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.user.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{post.user}</Text>
                  <Text style={styles.userLevel}>Lv.{post.level}</Text>
                </View>
              </View>
              <Text style={styles.postTime}>{getTimeAgo(post.timestamp)}</Text>
            </View>

            {/* 장소 정보 */}
            <TouchableOpacity style={styles.placeTag}>
              <Text style={styles.placeIcon}>📍</Text>
              <Text style={styles.placeText}>{post.place}</Text>
            </TouchableOpacity>

            {/* 평점 */}
            <Text style={styles.rating}>{getRatingStars(post.rating)}</Text>

            {/* 내용 */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* 태그 */}
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* 액션 버튼 */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(post.id)}
              >
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>🔗</Text>
                <Text style={styles.actionText}>공유</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.footer} />
      </ScrollView>

      {/* 글쓰기 버튼 */}
      <TouchableOpacity style={styles.writeButton}>
        <Text style={styles.writeButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  postsList: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userLevel: {
    fontSize: 11,
    color: '#666',
  },
  postTime: {
    fontSize: 11,
    color: '#999',
  },
  placeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 8,
  },
  placeIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  placeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  rating: {
    fontSize: 14,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  writeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  writeButtonText: {
    fontSize: 28,
  },
  footer: {
    height: 80,
  },
});
