function showToast(message, type = "success") {
  const settings = JSON.parse(localStorage.getItem("systemSettings")) || {};
  if (!settings.notif) return;

  let toast = document.getElementById("toast");
  let toastMessage;

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      color: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      font-weight: bold;
      z-index: 9999;
      display: none;
      transition: opacity 0.5s ease;
    `;

    const messageSpan = document.createElement("span");
    messageSpan.id = "toast-message";
    toast.appendChild(messageSpan);

    document.body.appendChild(toast);
  }

  toastMessage = document.getElementById("toast-message");
  toastMessage.innerText = message;

  toast.style.backgroundColor = {
    success: "#27ae60",
    error: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db"
  }[type] || "#333";

  toast.style.display = "block";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 500);
  }, 3000);
}
