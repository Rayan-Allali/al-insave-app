
import api from "@/utils/api"
import { isAxiosError } from "@/utils/axiosError"

export interface DonorId {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  lang: string
  id: string
  createdAt: string
  updatedAt: string
  v: number
}

export interface DonorDetails {
  _id: string
  donorId: DonorId
  sacrifyTo: string[]
}

export interface DonationRecord {
  _id: string
  animalType: string
  assignedTo: string // ObjectId as string
  createdAt: string
  updatedAt: string
  donorsDetails: DonorDetails[]
  preuveDetails: any | null
  status: string
  statusHistory: any[]
  trackingCode: string
  v: number
}

export interface DonationsResponse {
  success: boolean
  message: string
  data: DonationRecord[]
}

export const getAllDonations = async (): Promise<DonationsResponse> => {
  try {
    const response = await api.get("/donationRecord/worker")
    console.log("reponser from me ",response)
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorData = error.response.data as { message?: string }
        throw new Error(errorData.message || "Failed to fetch donations")
      }
    }
    throw new Error("An unexpected error occurred while fetching donations")
  }
}


export const getDonationByIdAPI = async (id:string): Promise<DonationsResponse> => {
  try {
    const response = await api.get(`/donationRecord/${id}`)
    console.log("reponser from me ",response)
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response && error.response.data) {
        const errorData = error.response.data as { message?: string }
        throw new Error(errorData.message || "Failed to fetch donations")
      }
    }
    throw new Error("An unexpected error occurred while fetching donations")
  }
}


