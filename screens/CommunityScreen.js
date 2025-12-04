import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useGame } from '../contexts/GameContext';
import { CATEGORY_INFO } from '../data/categories';
import StorageService from '../services/StorageService';

export default function CommunityScreen() {
  const { checkins, userStats } = useGame();
  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [likes, setLikes] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState({});

  useEffect(() => {
    loadPosts();
    loadInteractions();
  }, [checkins]);

  const loadPosts = () => {
    // 체크인 데이터를 피드 포스트로 변환
    const feedPosts = checkins.map((checkin) => ({
      id: checkin.id,
      user: '나',
      level: Math.floor((userStats?.totalPoints || 0) / 100) + 1,
      place: checkin.name,
      content: `${checkin.name}에 체크인했습니다! ${checkin.isFirstDiscovery ? '🎉 첫 방문' : ''}`,
      likes: 0,
      comments: 0,
      rating: 5,
      tags: getTagsForCheckin(checkin),
      timestamp: checkin.timestamp,
      category: checkin.category,
      isMyPost: true,
    }));

    setPosts(feedPosts.sort((a, b) => b.timestamp - a.timestamp));
  };

  const loadInteractions = async () => {
    try {
      const savedLikes = await StorageService.getItem('@community_likes');
      const savedComments = await StorageService.getItem('@community_comments');

      if (savedLikes) setLikes(JSON.parse(savedLikes));
      if (savedComments) setComments(JSON.parse(savedComments));
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const saveInteractions = async (newLikes, newComments) => {
    try {
      await StorageService.setItem('@community_likes', JSON.stringify(newLikes));
      await StorageService.setItem('@community_comments', JSON.stringify(newComments));
    } catch (error) {
      console.error('Error saving interactions:', error);
    }
  };

  const getTagsForCheckin = (checkin) => {
    const tags = [];
    if (checkin.isFirstDiscovery) tags.push('첫방문');
    if (checkin.category) {
      const categoryInfo = CATEGORY_INFO[checkin.category];
      if (categoryInfo) tags.push(categoryInfo.name);
    }
    const hour = new Date(checkin.timestamp).getHours();
    if (hour >= 18 || hour < 6) tags.push('야간');
    const day = new Date(checkin.timestamp).getDay();
    if (day === 0 || day === 6) tags.push('주말');
    return tags;
  };

  const filters = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'recent', name: '최신', icon: '⏰' },
    { id: 'popular', name: '인기', icon: '🔥' },
    { id: 'mine', name: '내 글', icon: '👤' },
  ];

  const getFilteredPosts = () => {
    let filtered = [...posts];

    // 검색 필터
    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post.place.toLowerCase().includes(searchText.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // 정렬 필터
    switch (selectedFilter) {
      case 'recent':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'popular':
        filtered.sort((a, b) => (likes[b.id] || 0) - (likes[a.id] || 0));
        break;
      case 'mine':
        filtered = filtered.filter((post) => post.isMyPost);
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleLike = (postId) => {
    const newLikes = { ...likes };
    newLikes[postId] = (newLikes[postId] || 0) + 1;
    setLikes(newLikes);
    saveInteractions(newLikes, comments);
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const submitComment = () => {
    if (!newComment.trim()) return;

    const newComments = { ...comments };
    if (!newComments[selectedPost.id]) {
      newComments[selectedPost.id] = [];
    }
    newComments[selectedPost.id].push({
      text: newComment,
      timestamp: Date.now(),
      user: '나',
    });

    setComments(newComments);
    saveInteractions(likes, newComments);
    setNewComment('');
    setCommentModalVisible(false);
    Alert.alert('댓글 작성 완료', '댓글이 작성되었습니다.');
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

  const filteredPosts = getFilteredPosts();

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소 또는 태그 검색..."
          placeholderTextColor="#8B7355"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 필터 */}
      <View style={styles.filterContainer}>
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
      </View>

      {/* 게시글 목록 */}
      <ScrollView style={styles.postsList}>
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>아직 피드가 없습니다</Text>
            <Text style={styles.emptySubtext}>장소를 방문하고 체크인해보세요!</Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
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
                <Text style={styles.placeIcon}>
                  {post.category ? CATEGORY_INFO[post.category]?.icon : '📍'}
                </Text>
                <Text style={styles.placeText}>{post.place}</Text>
              </TouchableOpacity>

              {/* 평점 */}
              <Text style={styles.rating}>{getRatingStars(post.rating)}</Text>

              {/* 내용 */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* 태그 */}
              {post.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {post.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 액션 버튼 */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(post.id)}
                >
                  <Text style={styles.actionIcon}>❤️</Text>
                  <Text style={styles.actionText}>{likes[post.id] || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleComment(post)}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>
                    {comments[post.id]?.length || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('공유', '공유 기능은 준비 중입니다')}
                >
                  <Text style={styles.actionIcon}>🔗</Text>
                  <Text style={styles.actionText}>공유</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* 댓글 작성 모달 */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>댓글 작성</Text>

            {/* 기존 댓글 목록 */}
            {selectedPost && comments[selectedPost.id]?.length > 0 && (
              <ScrollView style={styles.commentsList}>
                {comments[selectedPost.id].map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <Text style={styles.commentUser}>{comment.user}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentTime}>
                      {getTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* 새 댓글 입력 */}
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor="#8B7355"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCommentModalVisible(false);
                  setNewComment('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitComment}
              >
                <Text style={styles.submitButtonText}>작성</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE6',
  },
  searchContainer: {
    backgroundColor: '#FFFBF5',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 14,
    color: '#3E2723',
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFBF5',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#D4A574',
    height: 50,
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#8B6914',
    borderWidth: 3,
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 15,
    color: '#6B4423',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFBF5',
    fontWeight: 'bold',
  },
  postsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 70,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B6914',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B4423',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4A574',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 3,
    borderColor: '#8B6914',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  userLevel: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  postTime: {
    fontSize: 11,
    color: '#6B4423',
  },
  placeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  placeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  placeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  rating: {
    fontSize: 16,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3E2723',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  tagText: {
    fontSize: 11,
    color: '#8B6914',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E8DCC4',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#6B4423',
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFBF5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '75%',
    borderTopWidth: 4,
    borderTopColor: '#D4AF37',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#8B6914',
  },
  commentsList: {
    maxHeight: 220,
    marginBottom: 18,
  },
  commentItem: {
    padding: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  commentUser: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#D4AF37',
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#3E2723',
  },
  commentTime: {
    fontSize: 11,
    color: '#6B4423',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
    marginBottom: 18,
    textAlignVertical: 'top',
    color: '#3E2723',
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: '#FFF8F0',
    borderColor: '#D4A574',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B4423',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderColor: '#8B6914',
    borderWidth: 3,
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
