import User from "@/models/User";
import { getCache, setCache } from "@/lib/cache";

export async function getLeaderboard() {
  const CACHE_KEY = "global:leaderboard";

  // 1. Attempt to resolve Leaderboard directly from Redis Memory
  const cachedUsers = await getCache(CACHE_KEY);
  if (cachedUsers) {
    return cachedUsers;
  }

  // 2. Fall-through to Database aggregation (expensive)
  const users = await User.find({})
    .sort({ credits: -1 })
    .limit(20)
    .select("name image firebaseUid credits skills");

  // 3. Commit the array payload into Redis for the next 5 minutes
  await setCache(CACHE_KEY, users, 300);

  return users;
}
