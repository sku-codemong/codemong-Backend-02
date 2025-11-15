// src/friend/dto/friend.request.dto.js

// 사용자 검색 요청 DTO
export class SearchUsersRequestDTO {
  constructor({ currentUserId, keyword }) {
    this.currentUserId = Number(currentUserId);
    this.keyword = typeof keyword === "string" ? keyword : "";
  }
}

// 친구 요청 보내기 요청 DTO
export class CreateFriendRequestRequestDTO {
  constructor({ currentUserId, target_user_id }) {
    this.currentUserId = Number(currentUserId);
    this.target_user_id = Number(target_user_id);
  }
}

// 받은 친구 요청 목록 조회 DTO
export class GetIncomingFriendRequestsRequestDTO {
  constructor({ currentUserId }) {
    this.currentUserId = Number(currentUserId);
  }
}

// 보낸 친구 요청 목록 조회 DTO
export class GetOutgoingFriendRequestsRequestDTO {
  constructor({ currentUserId }) {
    this.currentUserId = Number(currentUserId);
  }
}

// 친구 요청 응답(수락/거절) 요청 DTO
export class RespondFriendRequestRequestDTO {
  constructor({ currentUserId, requestId, action }) {
    this.currentUserId = Number(currentUserId);
    this.requestId = Number(requestId);
    this.action = action; // "accept" | "reject" 그대로 둠
  }
}

// 친구 목록 조회 요청 DTO
export class GetFriendsRequestDTO {
  constructor({ currentUserId }) {
    this.currentUserId = Number(currentUserId);
  }
}

// 친구 삭제 요청 DTO
export class DeleteFriendRequestDTO {
  constructor({ currentUserId, friendUserId }) {
    this.currentUserId = Number(currentUserId);
    this.friendUserId = Number(friendUserId);
  }
}
