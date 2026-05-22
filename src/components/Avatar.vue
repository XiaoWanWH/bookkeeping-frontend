<template>
  <el-avatar :size="size" :src="avatarUrl" :style="avatarStyle">
    <span class="avatar-text">{{ firstLetter }}</span>
  </el-avatar>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 头像URL */
  avatar: {
    type: String,
    default: ''
  },
  /** 用户名（用于生成默认头像首字母） */
  username: {
    type: String,
    default: ''
  },
  /** 昵称（优先用于生成默认头像首字母） */
  nickname: {
    type: String,
    default: ''
  },
  /** 头像尺寸 */
  size: {
    type: Number,
    default: 40
  }
})

const avatarUrl = computed(() => {
  return props.avatar || ''
})

const displayName = computed(() => {
  return props.nickname || props.username || ''
})

const firstLetter = computed(() => {
  if (!displayName.value) return '?'
  return displayName.value.charAt(0).toUpperCase()
})

const avatarStyle = computed(() => {
  if (!props.avatar) {
    const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#1abc9c']
    const index = displayName.value.charCodeAt(0) % colors.length
    return {
      backgroundColor: colors[index],
      color: '#fff',
      fontSize: props.size > 50 ? '20px' : '14px',
      fontWeight: '600'
    }
  }
  return {}
})
</script>

<style scoped>
.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
