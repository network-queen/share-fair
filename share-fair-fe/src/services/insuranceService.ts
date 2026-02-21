import api from './api'
import type { InsuranceClaim, InsurancePolicy, CoverageType } from '../types'

const insuranceService = {
  async addInsurance(transactionId: string, coverageType: CoverageType): Promise<InsurancePolicy> {
    const { data } = await api.post('/insurance', { transactionId, coverageType })
    return data.data
  },

  async getPolicyForTransaction(transactionId: string): Promise<InsurancePolicy> {
    const { data } = await api.get(`/insurance/transaction/${transactionId}`)
    return data.data
  },

  async fileClaim(policyId: string, description: string, claimAmount: number): Promise<InsuranceClaim> {
    const { data } = await api.post(`/insurance/${policyId}/claims`, { description, claimAmount })
    return data.data
  },

  async getClaims(policyId: string): Promise<InsuranceClaim[]> {
    const { data } = await api.get(`/insurance/${policyId}/claims`)
    return data.data
  },

  calculatePremium(totalAmount: number, coverageType: CoverageType): number {
    const rates: Record<CoverageType, number> = { BASIC: 0.02, STANDARD: 0.05, PREMIUM: 0.08 }
    const premium = totalAmount * rates[coverageType]
    return Math.max(1, Math.round(premium * 100) / 100)
  },

  getMaxCoverage(totalAmount: number, coverageType: CoverageType): number {
    const multipliers: Record<CoverageType, number> = { BASIC: 1, STANDARD: 2, PREMIUM: 3 }
    return Math.round(totalAmount * multipliers[coverageType] * 100) / 100
  },
}

export default insuranceService
