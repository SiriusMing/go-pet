import { ref, computed } from 'vue'

// ========== 1. 配置 ==========
const ACHIEVEMENTS_CONFIG = [
  { id: 1,  name: 'Calm Navigator',   desc: 'Mood tracking for 3 consecutive days', cat: 'Emotion',     type: 'mood_streak', params: { days: 3 }, stars: 50 },
  { id: 2,  name: 'Memo Master',      desc: 'Finish 20 memos',                      cat: 'Mindfulness', type: 'memo_total',   params: { total: 20 }, stars: 60 },
  { id: 3,  name: 'Wellness Explorer',desc: 'Check-in for 7 consecutive days',      cat: 'Mindfulness', type: 'memo_streak',  params: { days: 7 }, stars: 100 },
  { id: 4,  name: 'Health Tracker',   desc: 'Mood tracking 30 days in a row',       cat: 'Mindfulness', type: 'mood_streak',  params: { days: 30 }, stars: 150 },
  { id: 5,  name: 'CG Collector',     desc: 'Unlock 10 CGs',                        cat: 'CG',          type: 'cg_unlocked',  params: { total: 10 }, stars: 120 },
  { id: 6,  name: 'Outfit Collector', desc: 'Unlock 5 outfits',                     cat: 'Outfit',      type: 'outfit_unlocked', params: { total: 5 }, stars: 200 },
  { id: 7,  name: 'Photo Master',     desc: 'Take 100 photos',                      cat: 'Social',      type: 'photo_total',  params: { total: 100 }, stars: 150 },
  { id: 8,  name: 'Perfect Dresser',  desc: 'Wear different outfit every day for a week',cat: 'Outfit', type: 'outfit_streak', params: { days: 7 }, stars: 140 },
  { id: 9,  name: 'Big Thinker',      desc: 'Finish 20 growth tasks',               cat: 'Emotion',     type: 'growth_tasks', params: { total: 20 }, stars: 200 },
  { id:10,  name: 'Art Collector',    desc: 'Collect 10 artworks',                  cat: 'Social',      type: 'art_total',    params: { total: 10 }, stars: 120 },
  { id:11,  name: 'Liker',            desc: 'Like 50 items',                        cat: 'Social',      type: 'like_total',   params: { total: 50 }, stars: 80 },
  { id:12,  name: 'Super Chef',       desc: 'Try 20 recipes',                       cat: 'Social',      type: 'recipe_total', params: { total: 20 }, stars: 130 },
  { id:13,  name: 'Healthy Eater',    desc: 'Eat vegetarian 10 days',               cat: 'Mindfulness', type: 'vege_days',    params: { days: 10 }, stars: 90 },
  { id:14,  name: 'Bookworm',         desc: 'Finish reading 30 books',              cat: 'Emotion',     type: 'book_total',   params: { total: 30 }, stars: 210 },
  { id:15,  name: 'Runner',           desc: 'Run for 30 consecutive days',          cat: 'Mindfulness', type: 'run_streak',   params: { days: 30 }, stars: 180 },
  { id:16,  name: 'Music Lover',      desc: 'Attend 5 concerts',                    cat: 'Social',      type: 'concert_total',params: { total: 5 }, stars: 150 },
  { id:17,  name: 'Giver',            desc: 'Join 5 charity events',                cat: 'Social',      type: 'charity_total',params: { total: 5 }, stars: 300 },
  { id:18,  name: 'Fashionista',      desc: 'Collect 10 CGs',                       cat: 'CG',          type: 'cg_unlocked',  params: { total: 10 }, stars: 120 },
  { id:19,  name: 'Fast Learner',     desc: 'Learn 3 new skills',                   cat: 'Emotion',     type: 'skill_total',  params: { total: 3 }, stars: 180 },
  { id:20,  name: 'Big Socializer',   desc: 'Attend 20 social events',              cat: 'Social',      type: 'event_total',  params: { total: 20 }, stars: 160 },
  { id:21,  name: 'Dreamer',          desc: 'Sleep on time 15 days',                cat: 'Emotion',     type: 'sleep_days',   params: { days: 15 }, stars: 110 },
  { id:22,  name: 'Mindful Designer', desc: 'Design 10 creative works',             cat: 'Emotion',     type: 'creative_total',params: { total: 10 }, stars: 200 },
  { id:23,  name: 'Water Drinker',    desc: 'Drink 8 cups of water daily for 30 days',cat: 'Mindfulness',type: 'water_days',   params: { days: 30 }, stars: 150 },
  { id:24,  name: 'Artist',           desc: 'Create one painting per week',         cat: 'Social',      type: 'painting_total',params: { total: 4 }, stars: 120 },
  { id:25,  name: 'Weekend Wanderer', desc: 'Join a travel activity once a month',  cat: 'Social',      type: 'travel_total', params: { total: 12 }, stars: 200 },
  { id:26,  name: 'Running Coach',    desc: 'Help others finish a running challenge',cat: 'Social',     type: 'coach_total',  params: { total: 1 }, stars: 180 },
  { id:27,  name: 'Mindful Traveler', desc: 'Log meditation 3 times per week',      cat: 'Mindfulness', type: 'meditation_week', params: { weeks: 4 }, stars: 120 },
  { id:28,  name: 'Night Owl',        desc: 'Stay up late for 14 days',             cat: 'Emotion',     type: 'late_days',    params: { days: 14 }, stars: 100 },
  { id:29,  name: 'Jungle Explorer',  desc: 'Visit 10 new places',                  cat: 'Social',      type: 'visit_total',  params: { total: 10 }, stars: 150 },
  { id:30,  name: 'Book Collector',   desc: 'Collect 20 books',                     cat: 'Emotion',     type: 'book_collect', params: { total: 20 }, stars: 140 }
]

export const categories = ['ALL', 'Emotion', 'Mindfulness', 'Social', 'CG', 'Outfit']

function calcStreak(datesArr) {
  if (!datesArr.length) return 0
  const sorted = [...new Set(datesArr)].sort((a, b) => new Date(b) - new Date(a))
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i - 1]) - new Date(sorted[i])) / (1000 * 3600 * 24)
    if (diff === 1) streak++
    else if (diff > 1) break
  }
  return streak
}

function getUserData() {
  return {
    moods: Object.values(JSON.parse(localStorage.getItem('moodHistory') || '{}')),
    memos: JSON.parse(localStorage.getItem('memos') || '[]'),
    cgs:        JSON.parse(localStorage.getItem('cgs') || '[]'),
    outfits:    JSON.parse(localStorage.getItem('outfits') || '[]'),
    photos:     JSON.parse(localStorage.getItem('photos') || '[]'),
    likes:      Number(localStorage.getItem('like_count') || 0),
    recipes:    Number(localStorage.getItem('recipe_count') || 0),
    books:      Number(localStorage.getItem('book_count') || 0),
    skills:     Number(localStorage.getItem('skill_count') || 0),
    growthTasks:Number(localStorage.getItem('growth_tasks') || 0),
    travels:    Number(localStorage.getItem('travel_count') || 0),
    creative:   Number(localStorage.getItem('creative_count') || 0),
    paintings:  Number(localStorage.getItem('painting_count') || 0),
    vegeDays:   Number(localStorage.getItem('vege_days') || 0),
    runDays:    Number(localStorage.getItem('run_days') || 0),
    concerts:   Number(localStorage.getItem('concert_count') || 0),
    charityEvents:Number(localStorage.getItem('charity_count') || 0),
    socialEvents: Number(localStorage.getItem('social_event_count') || 0),
    sleepDays:  Number(localStorage.getItem('sleep_days') || 0),
    waterDays:  Number(localStorage.getItem('water_days') || 0),
    bookCollect: Number(localStorage.getItem('book_collect') || 0),
    coaches:    Number(localStorage.getItem('coach_count') || 0),
    meditationWeeks: Number(localStorage.getItem('meditation_weeks') || 0),
    lateDays:   Number(localStorage.getItem('late_days') || 0),
    visits:     Number(localStorage.getItem('visit_count') || 0),
  }
}

// ========== 响应式星星余额 ==========
function getStars() {
  return Number(localStorage.getItem('user_stars') || 1000)
}
const stars = ref(getStars())

// 多页面/多标签页也能同步
window.addEventListener('storage', () => {
  stars.value = getStars()
})

// 消费/奖励星星都用这个方法
function updateStars(newValue) {
  localStorage.setItem('user_stars', String(newValue))
  stars.value = newValue
}

const user = ref(getUserData())

function reloadAchievements() {
  user.value = getUserData()
  stars.value = getStars()
}

const achievements = computed(() =>
  ACHIEVEMENTS_CONFIG.map(a => {
    let progress = 0, done = false

    if (a.type === 'mood_streak') {
      const moodDays = user.value.moods.map(m => m.date)
      const streak = calcStreak(moodDays)
      progress = Math.min((streak / (a.params.days || 1)) * 100, 100)
      done = streak >= a.params.days
    } else if (a.type === 'memo_streak') {
      const memoDoneDates = Array.from(new Set(
        user.value.memos.filter(m => m.done).map(m => m.date)
      ))
      const streak = calcStreak(memoDoneDates)
      progress = Math.min((streak / (a.params.days || 1)) * 100, 100)
      done = streak >= a.params.days
    } else if (a.type === 'memo_total') {
      const total = user.value.memos.filter(m => m.done).length
      progress = Math.min((total / (a.params.total || 1)) * 100, 100)
      done = total >= a.params.total
    } else if (a.type === 'cg_unlocked') {
      const cgNum = Array.isArray(user.value.cgs) ? user.value.cgs.length : 0
      progress = Math.min((cgNum / (a.params.total || 1)) * 100, 100)
      done = cgNum >= a.params.total
    } else if (a.type === 'outfit_unlocked') {
      const outNum = Array.isArray(user.value.outfits) ? user.value.outfits.length : 0
      progress = Math.min((outNum / (a.params.total || 1)) * 100, 100)
      done = outNum >= a.params.total
    } else if (a.type === 'photo_total') {
      progress = Math.min((user.value.photos.length / (a.params.total || 1)) * 100, 100)
      done = user.value.photos.length >= a.params.total
    } else if (a.type === 'outfit_streak') {
      // 需要你根据你的数据实现 outfit streak
      progress = 0
      done = false
    } else if (a.type === 'growth_tasks') {
      progress = Math.min((user.value.growthTasks / (a.params.total || 1)) * 100, 100)
      done = user.value.growthTasks >= a.params.total
    } else if (a.type === 'art_total') {
      progress = Math.min((user.value.paintings / (a.params.total || 1)) * 100, 100)
      done = user.value.paintings >= a.params.total
    } else if (a.type === 'like_total') {
      progress = Math.min((user.value.likes / (a.params.total || 1)) * 100, 100)
      done = user.value.likes >= a.params.total
    } else if (a.type === 'recipe_total') {
      progress = Math.min((user.value.recipes / (a.params.total || 1)) * 100, 100)
      done = user.value.recipes >= a.params.total
    } else if (a.type === 'vege_days') {
      progress = Math.min(((user.value.vegeDays || 0) / (a.params.days || 1)) * 100, 100)
      done = (user.value.vegeDays || 0) >= a.params.days
    } else if (a.type === 'book_total') {
      progress = Math.min((user.value.books / (a.params.total || 1)) * 100, 100)
      done = user.value.books >= a.params.total
    } else if (a.type === 'run_streak') {
      progress = Math.min(((user.value.runDays || 0) / (a.params.days || 1)) * 100, 100)
      done = (user.value.runDays || 0) >= a.params.days
    } else if (a.type === 'concert_total') {
      progress = Math.min((user.value.concerts / (a.params.total || 1)) * 100, 100)
      done = user.value.concerts >= a.params.total
    } else if (a.type === 'charity_total') {
      progress = Math.min((user.value.charityEvents / (a.params.total || 1)) * 100, 100)
      done = user.value.charityEvents >= a.params.total
    } else if (a.type === 'skill_total') {
      progress = Math.min((user.value.skills / (a.params.total || 1)) * 100, 100)
      done = user.value.skills >= a.params.total
    } else if (a.type === 'event_total') {
      progress = Math.min((user.value.socialEvents / (a.params.total || 1)) * 100, 100)
      done = user.value.socialEvents >= a.params.total
    } else if (a.type === 'sleep_days') {
      progress = Math.min(((user.value.sleepDays || 0) / (a.params.days || 1)) * 100, 100)
      done = (user.value.sleepDays || 0) >= a.params.days
    } else if (a.type === 'creative_total') {
      progress = Math.min((user.value.creative / (a.params.total || 1)) * 100, 100)
      done = user.value.creative >= a.params.total
    } else if (a.type === 'water_days') {
      progress = Math.min(((user.value.waterDays || 0) / (a.params.days || 1)) * 100, 100)
      done = (user.value.waterDays || 0) >= a.params.days
    } else if (a.type === 'painting_total') {
      progress = Math.min((user.value.paintings / (a.params.total || 1)) * 100, 100)
      done = user.value.paintings >= a.params.total
    } else if (a.type === 'travel_total') {
      progress = Math.min((user.value.travels / (a.params.total || 1)) * 100, 100)
      done = user.value.travels >= a.params.total
    } else if (a.type === 'coach_total') {
      progress = Math.min((user.value.coaches / (a.params.total || 1)) * 100, 100)
      done = user.value.coaches >= a.params.total
    } else if (a.type === 'meditation_week') {
      progress = Math.min(((user.value.meditationWeeks || 0) / (a.params.weeks || 1)) * 100, 100)
      done = (user.value.meditationWeeks || 0) >= a.params.weeks
    } else if (a.type === 'late_days') {
      progress = Math.min(((user.value.lateDays || 0) / (a.params.days || 1)) * 100, 100)
      done = (user.value.lateDays || 0) >= a.params.days
    } else if (a.type === 'visit_total') {
      progress = Math.min((user.value.visits / (a.params.total || 1)) * 100, 100)
      done = user.value.visits >= a.params.total
    } else if (a.type === 'book_collect') {
      progress = Math.min((user.value.bookCollect / (a.params.total || 1)) * 100, 100)
      done = user.value.bookCollect >= a.params.total
    }
    return { ...a, progress: Math.round(progress), done }
  })
)

export function useAchievements() {
  return {
    achievements,
    categories,
    stars,
    reloadAchievements,
    updateStars,
  }
}

export const filters = ['ALL', 'Unlocked', 'Locked']


