import { defineStore } from 'pinia'
import { getInvitations } from '@/api/invitation'

export const useInvitationStore = defineStore('invitation', {
  state: () => ({
    invitations: [],
    pendingInvitations: 0
  }),

  actions: {
    /**
     * 获取邀请列表
     */
    async fetchInvitations() {
      try {
        const res = await getInvitations()
        const data = res.data || res
        const list = Array.isArray(data) ? data : (data.list || data.content || data.records || [])
        this.invitations = list
        this.pendingInvitations = list.filter(inv => inv.status === 0 || inv.status === 'PENDING').length
      } catch (error) {
        console.error('获取邀请失败:', error)
      }
    },

    /**
     * 减少待处理邀请数（当接受/拒绝时调用）
     */
    decrementPendingInvitations() {
      if (this.pendingInvitations > 0) {
        this.pendingInvitations--
      }
    },

    /**
     * 重置待处理邀请数（调用时重新获取）
     */
    resetPendingInvitations() {
      this.fetchInvitations()
    }
  }
})
