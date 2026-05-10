import User from "@/models/User";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";

/**
 * Update user mastery based on quiz attempt
 * @param {string} userId 
 * @param {string} quizId 
 * @param {Object} results - Graded results from attemptQuiz
 */
export async function updateTopicMastery(userId, quizId, results) {
  const quiz = await Quiz.findById(quizId).select("topic questions");
  if (!quiz) return;

  const user = await User.findById(userId);
  if (!user) return;

  const topic = quiz.topic || "General";
  const score = Math.round((results.filter(r => r.correct).length / quiz.questions.length) * 100);

  // Initialize learningProfile if missing
  if (!user.learningProfile) {
    user.learningProfile = { mastery: [], weakTopics: [], streaks: { current: 0, longest: 0 } };
  }

  // Find or create mastery record for this topic
  let masteryRecord = user.learningProfile.mastery.find(m => m.topic === topic);
  
  if (!masteryRecord) {
    masteryRecord = { topic, score, attempts: 1, lastTested: new Date() };
    user.learningProfile.mastery.push(masteryRecord);
  } else {
    // Moving average for score to track progress
    masteryRecord.score = Math.round((masteryRecord.score * 0.4) + (score * 0.6));
    masteryRecord.attempts += 1;
    masteryRecord.lastTested = new Date();
  }

  // Update weak topics list
  // If score < 70, it's a weak topic. If > 85, remove from weak topics.
  const weakSet = new Set(user.learningProfile.weakTopics);
  if (score < 70) {
    weakSet.add(topic);
  } else if (score >= 85) {
    weakSet.delete(topic);
  }
  user.learningProfile.weakTopics = Array.from(weakSet);

  await user.save();
  return user.learningProfile;
}

/**
 * Update user learning streak
 * @param {string} userId 
 */
export async function updateLearningStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const lastActivity = user.learningProfile?.streaks?.lastActivity;
  
  if (!user.learningProfile) {
    user.learningProfile = { streaks: { current: 1, longest: 1, lastActivity: now } };
  } else {
    const streaks = user.learningProfile.streaks;
    
    if (!lastActivity) {
      streaks.current = 1;
    } else {
      const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streaks.current += 1;
      } else if (diffDays > 1) {
        streaks.current = 1;
      }
      // if diffDays === 0, same day, do nothing
    }
    
    if (streaks.current > streaks.longest) {
      streaks.longest = streaks.current;
    }
    streaks.lastActivity = now;
  }

  await user.save();
  return user.learningProfile.streaks;
}

/**
 * Get intelligent learning gap analysis
 * @param {string} userId 
 */
export async function getLearningAnalysis(userId) {
  const user = await User.findById(userId).lean();
  if (!user || !user.learningProfile) return null;

  const { mastery, weakTopics, streaks } = user.learningProfile;

  // Identify "Critical Gaps" (Weak topics with many attempts)
  const criticalGaps = mastery.filter(m => weakTopics.includes(m.topic) && m.attempts > 1);

  // Identify "Strengths" (High score)
  const strengths = mastery.filter(m => m.score >= 90);

  return {
    mastery,
    weakTopics,
    streaks,
    criticalGaps,
    strengths,
    totalTopics: mastery.length
  };
}
