import { ref, reactive } from 'vue'

export function useAchievements() {
  // ─────────── Achievements ────────────
  const achievements = ref([
    { id: 1, name: 'Calm Navigator', desc: 'Complete mood tracking for 3 consecutive days', cat: 'Emotion', progress: 100, stars: 50, done: true },
    { id: 2, name: 'Wellness Explorer', desc: 'Check-in for self-care for 7 consecutive days', cat: 'Mindfulness', progress: 40, stars: 100, done: false },
    { id: 3, name: 'Anon\'s Smile', desc: 'Complete goals for 5 days to unlock Anon\'s CG', cat: 'CG', progress: 80, stars: 120, done: false },
    { id: 4, name: 'Health Tracker', desc: 'Record health data for 30 consecutive days', cat: 'Mindfulness', progress: 50, stars: 150, done: false },
    { id: 5, name: 'The Creator', desc: 'Complete 10 creative tasks', cat: 'Emotion', progress: 20, stars: 200, done: false },
    { id: 6, name: 'Fashion Icon', desc: 'Unlock 5 outfits', cat: 'Outfit', progress: 60, stars: 300, done: false },
    { id: 7, name: 'Night Owl', desc: 'Stay up late for 14 days while keeping progress', cat: 'Emotion', progress: 100, stars: 100, done: true },
    { id: 8, name: 'Mindful Traveler', desc: 'Log meditation data 3 times per week', cat: 'Mindfulness', progress: 80, stars: 120, done: false },
    { id: 9, name: 'Dreamer', desc: 'Sleep on time every night and keep a record', cat: 'Emotion', progress: 100, stars: 200, done: true },
    { id: 10, name: 'Jungle Explorer', desc: 'Visit 10 new places', cat: 'Social', progress: 50, stars: 150, done: false },
    { id: 11, name: 'Perfect Dresser', desc: 'Wear a different outfit every day', cat: 'Outfit', progress: 40, stars: 120, done: false },
    { id: 12, name: 'Healthy Eater', desc: 'Eat vegetarian for 10 consecutive days', cat: 'Mindfulness', progress: 90, stars: 200, done: false },
    { id: 13, name: 'Fast Learner', desc: 'Learn 3 new skills in 30 days', cat: 'Emotion', progress: 60, stars: 180, done: false },
    { id: 14, name: 'Big Thinker', desc: 'Complete 20 personal growth tasks', cat: 'Emotion', progress: 100, stars: 250, done: true },
    { id: 15, name: 'Healthy Mind', desc: 'Meditate for 15 minutes daily', cat: 'Mindfulness', progress: 30, stars: 100, done: false },
    { id: 16, name: 'Social Butterfly', desc: 'Attend at least 2 social events per week', cat: 'Social', progress: 70, stars: 160, done: false },
    { id: 17, name: 'Photo Master', desc: 'Take 100 photos on different themes', cat: 'Social', progress: 50, stars: 150, done: false },
    { id: 18, name: 'Weekend Wanderer', desc: 'Join a travel activity once a month', cat: 'Social', progress: 80, stars: 200, done: false },
    { id: 19, name: 'Runner', desc: 'Run for 30 consecutive days', cat: 'Mindfulness', progress: 100, stars: 180, done: true },
    { id: 20, name: 'Super Chef', desc: 'Try 20 different recipes', cat: 'Social', progress: 40, stars: 130, done: false },
    { id: 21, name: 'Water Drinker', desc: 'Drink 8 cups of water daily for 30 days', cat: 'Mindfulness', progress: 60, stars: 150, done: false },
    { id: 22, name: 'Yogi', desc: 'Do 30 minutes of yoga every day', cat: 'Emotion', progress: 50, stars: 170, done: false },
    { id: 23, name: 'Giver', desc: 'Join 5 charity events', cat: 'Social', progress: 100, stars: 300, done: true },
    { id: 24, name: 'Art Collector', desc: 'Collect 10 artworks', cat: 'Social', progress: 80, stars: 220, done: false },
    { id: 25, name: 'Fashionista', desc: 'Collect 10 CGs', cat: 'CG', progress: 40, stars: 120, done: false },
    { id: 26, name: 'Running Coach', desc: 'Help others complete a running challenge', cat: 'Social', progress: 60, stars: 180, done: false },
    { id: 27, name: 'Artist', desc: 'Create one painting per week', cat: 'Social', progress: 30, stars: 120, done: false },
    { id: 28, name: 'Mindful Designer', desc: 'Design 10 creative works', cat: 'Emotion', progress: 50, stars: 200, done: false },
    { id: 29, name: 'Music Lover', desc: 'Attend 5 concerts', cat: 'Social', progress: 80, stars: 150, done: false },
    { id: 30, name: 'Bookworm', desc: 'Finish reading 30 books', cat: 'Emotion', progress: 70, stars: 210, done: false },
    { id: 31, name: 'Anon\'s Smile', desc: 'Complete goals for 5 days to unlock Anon\'s CG', cat: 'CG', progress: 80, stars: 120, done: false },
    { id: 32, name: 'Tomori\'s Smile', desc: 'Complete goals for 5 days to unlock Tomori\'s CG', cat: 'CG', progress: 80, stars: 120, done: false },
    { id: 33, name: 'Rana\'s Smile', desc: 'Complete goals for 5 days to unlock Rana\'s CG', cat: 'CG', progress: 80, stars: 120, done: false },
    { id: 34, name: 'Soyo\'s Smile', desc: 'Complete goals for 5 days to unlock Soyo\'s CG', cat: 'CG', progress: 80, stars: 120, done: false },
    { id: 35, name: 'Taki\'s Smile', desc: 'Complete goals for 5 days to unlock Taki\'s CG', cat: 'CG', progress: 80, stars: 120, done: false }
  ])

  // categories
  const categories = ['ALL', 'Emotion', 'Mindfulness', 'Social', 'CG']

  const stars = ref(
    achievements.value.filter(a => a.done).reduce((s, a) => s + a.stars, 0)
  )

  return { achievements, categories, stars }
}

export const filters = ['ALL', 'Unlocked', 'Locked']

