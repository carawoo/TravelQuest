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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
  footer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  commentItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
  },
  commentText: {
    fontSize: 13,
    marginBottom: 3,
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
