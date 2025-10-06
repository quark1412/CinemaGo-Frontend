import { Review } from "@/types/review";
import instance from "@/configs/axiosConfig";

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  movieId?: string;
  rating?: number;
  userId?: string;
  type?: string;
  status?: string;
  isActive?: boolean;
}

export interface ReviewsResponse {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Review[];
}

// GraphQL query for getting reviews
const GET_REVIEWS_QUERY = `
  query GetReviews(
    $page: Int
    $limit: Int
    $movieId: String
    $rating: Float
    $userId: String
    $type: String
    $status: String
  ) {
    getReviews(
      page: $page
      limit: $limit
      movieId: $movieId
      rating: $rating
      userId: $userId
      type: $type
      status: $status
    ) {
      pagination {
        totalItems
        totalPages
        currentPage
        pageSize
        hasNextPage
        hasPrevPage
      }
      data {
        id
        userId
        movieId
        rating
        content
        status
        response {
          userId
          content
          createdAt
        }
        isActive
        type
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_REVIEW_BY_ID_QUERY = `
  query GetReviewById($reviewId: String!) {
    getReviewById(reviewId: $reviewId) {
      id
      userId
      movieId
      rating
      content
      status
      response {
        userId
        content
        createdAt
      }
      isActive
      type
      createdAt
      updatedAt
    }
  }
`;

const REPLY_TO_REVIEW_MUTATION = `
  mutation ReplyToReview($reviewId: String!, $content: String!) {
    replyToReview(reviewId: $reviewId, content: $content) {
      id
      userId
      movieId
      rating
      content
      status
      response {
        userId
        content
        createdAt
      }
      isActive
      type
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_REVIEW_MUTATION = `
  mutation UpdateReviewById($reviewId: String!, $content: String, $rating: Float) {
    updateReviewById(reviewId: $reviewId, content: $content, rating: $rating) {
      id
      userId
      movieId
      rating
      content
      status
      response {
        userId
        content
        createdAt
      }
      isActive
      type
      createdAt
      updatedAt
    }
  }
`;

const HIDE_REVIEW_MUTATION = `
  mutation HideReviewById($reviewId: String!) {
    hideReviewById(reviewId: $reviewId) {
      id
      userId
      movieId
      rating
      content
      status
      response {
        userId
        content
        createdAt
      }
      isActive
      type
      createdAt
      updatedAt
    }
  }
`;

const UNHIDE_REVIEW_MUTATION = `
  mutation UnhideReviewById($reviewId: String!) {
    unhideReviewById(reviewId: $reviewId) {
      id
      userId
      movieId
      rating
      content
      status
      response {
        userId
        content
        createdAt
      }
      isActive
      type
      createdAt
      updatedAt
    }
  }
`;

export const getAllReviews = async (
  params?: GetReviewsParams
): Promise<ReviewsResponse> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: GET_REVIEWS_QUERY,
        variables: params,
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.getReviews;
  } catch (error) {
    throw error;
  }
};

export const getReviewById = async (id: string): Promise<Review> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: GET_REVIEW_BY_ID_QUERY,
        variables: { reviewId: id },
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.getReviewById;
  } catch (error) {
    throw error;
  }
};

export const replyToReview = async (
  reviewId: string,
  content: string
): Promise<Review> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: REPLY_TO_REVIEW_MUTATION,
        variables: { reviewId, content },
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.replyToReview;
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (
  id: string,
  reviewData: {
    content?: string;
    rating?: number;
  }
): Promise<Review> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: UPDATE_REVIEW_MUTATION,
        variables: { reviewId: id, ...reviewData },
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.updateReviewById;
  } catch (error) {
    throw error;
  }
};

export const hideReview = async (id: string): Promise<Review> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: HIDE_REVIEW_MUTATION,
        variables: { reviewId: id },
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.hideReviewById;
  } catch (error) {
    throw error;
  }
};

export const unhideReview = async (id: string): Promise<Review> => {
  try {
    const response = await instance.post(
      "/reviews/graphql",
      {
        query: UNHIDE_REVIEW_MUTATION,
        variables: { reviewId: id },
      },
      {
        requiresAuth: true,
      } as any
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.unhideReviewById;
  } catch (error) {
    throw error;
  }
};
