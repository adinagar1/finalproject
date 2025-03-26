import { send } from "../utilities";

let usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
let passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
let submitButton = document.getElementById("submitButton") as HTMLButtonElement;
let messageDiv = document.getElementById("messageDiv") as HTMLDivElement;

submitButton.onclick = async function () {
  let userId = await send("signUp", [
    usernameInput.value,
    passwordInput.value,
  ]) as string | null;

  if (userId != null) {
    localStorage.setItem("userId", userId);
    location.href = "index.html";
  } else {
    messageDiv.innerText = "Username is already taken";
  }
};
