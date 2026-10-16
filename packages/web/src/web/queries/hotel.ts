import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "../lib/api";
export const useReviews = () => useQuery(orpc.hotel.reviews.queryOptions());
export const useReview = () => useMutation(orpc.hotel.review.mutationOptions());
export const useReservation = () => useMutation(orpc.hotel.reserve.mutationOptions());
