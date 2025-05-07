import { send } from "../utilities";

export async function getUserId() {
  let userId = localStorage.getItem("userId");

  if (userId == null) {
    return null;
  }

  let varified = await send("verifyUserId", userId);

  if (!varified) {
    localStorage.removeItem("userId");
    return null;
  }

  return userId;
}