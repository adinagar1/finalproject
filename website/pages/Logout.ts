import { send } from "../utilities";

let usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
let passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
let logout = document.getElementById("logout") as HTMLButtonElement;
let messageDiv = document.getElementById("messageDiv") as HTMLDivElement;

logout.onclick = async function () {
  let userId = await send("logout", [
    usernameInput.value,
    passwordInput.value,]) as string | null;

if(userId = null) {
localStorage.removeItem("userId");
top!.location.reload();
messageDiv.innerText = "Your user name has been logout";
}

else{
  messageDiv.innerText = "Your user name or password are wrong";
}
};
