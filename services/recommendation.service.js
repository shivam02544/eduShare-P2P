import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";
import Quiz from "@/models/Quiz";

/**
 * Get personalized recommendations for a user
 * @param {string} userId 
 */
export async function getPersonalizedRecommendations(userId) {
  const user = await User.findById(userId).lean();
  if (!user || !user.learningProfile) {
    // Fallback to trending content if no profile
    return getTrendingRecommendations();
  }

  const { weakTopics, mastery } = user.learningProfile;

  // 1. Weak Topic Recommendations
  // We prioritize content that covers the user's weak topics.
  const weakTopicContent = await Promise.all(weakTopics.slice(0, 3).map(topic => 
    findContentForTopic(topic)
  ));

  // 2. Adaptive Difficulty Progressions
  // Find topics where score is high (80+) and suggest advanced quizzes or related harder topics.
  const advancedTopics = mastery
    .filter(m => m.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  // 3. Collaborative Filter (Simplistic)
  // Recommend popular creators in topics the user is interested in.
  const topCreators = await findTopCreatorsForTopics(mastery.map(m => m.topic));

  return {
    remediation: weakTopicContent.flat(),
    progression: advancedTopics,
    suggestedCreators: topCreators
  };
}

/**
 * Find high-relevance content for a specific topic
 * @param {string} topic 
 */
export async function findContentForTopic(topic) {
  // Use regex search for topic in subject or title
  const query = { 
    $or: [
      { subject: { $regex: topic, $options: "i" } },
      { title: { $regex: topic, $options: "i" } }
    ],
    flagged: false
  };

  const [videos, notes, quizzes] = await Promise.all([
    Video.find(query).limit(2).select("title thumbnailUrl subject uploader").populate("uploader", "name").lean(),
    Note.find(query).limit(2).select("title subject uploader").populate("uploader", "name").lean(),
    Quiz.find({ ...query, isPublished: true }).limit(2).select("title topic difficulty").lean()
  ]);

  return [
    ...videos.map(v => ({ ...v, type: "video" })),
    ...notes.map(n => ({ ...n, type: "note" })),
    ...quizzes.map(q => ({ ...q, type: "quiz" }))
  ];
}

async function getTrendingRecommendations() {
  const [videos, notes] = await Promise.all([
    Video.find({ flagged: false }).sort({ views: -1 }).limit(3).lean(),
    Note.find({ flagged: false }).sort({ downloads: -1 }).limit(3).lean()
  ]);
  return {
    trending: [
      ...videos.map(v => ({ ...v, type: "video" })),
      ...notes.map(n => ({ ...n, type: "note" }))
    ]
  };
}

async function findTopCreatorsForTopics(topics) {
  if (!topics.length) return [];
  
  // Find users who have uploaded highly rated/viewed content in these subjects
  const topVideos = await Video.find({ 
    subject: { $in: topics },
    flagged: false 
  }).sort({ views: -1 }).limit(5).populate("uploader", "name image").lean();

  const creators = Array.from(new Set(topVideos.map(v => v.uploader))).filter(Boolean);
  return creators.slice(0, 3);
}
