import { AxiosError } from "axios";

export function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "response" in error
}