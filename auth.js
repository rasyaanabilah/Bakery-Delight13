

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const defaultUsers = {
    "pelanggan": { password: "123", role: "pelanggan", redirect: "index.html" },
    "kasir": { password: "123", role: "kasir", redirect: "dashboard-kasir.html" },
    "admin": { password: "123", role: "admin", redirect: "dashboard-admin.html" },
  };

  let loginSuccess = false;
  let redirectUrl = "";

  // Cek default user
  if (defaultUsers[username] && defaultUsers[username].password === password) {
    loginSuccess = true;
    redirectUrl = defaultUsers[username].redirect;

    setCookie('userLogin', true, 1);
    setCookie("userRole", defaultUsers[username].role, 1);
    setCookie(`userName_${username}`, username, 1);
    setCookie(`userEmail_${username}`, `${username}@mail.com`, 1);
    setCookie(`userWhatsApp_${username}`, "08xxxxxxxxxx", 1);
    setCookie("userId", username, 1);
  }

  // Cek user dari register
  else {
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      loginSuccess = true;

      if (user.role === "kasir") {
        redirectUrl = "dashboard-kasir.html";
      } else if (user.role === "admin") {
        redirectUrl = "dashboard-admin.html";
      } else {
        redirectUrl = "index.html";
      }

      setCookie('userLogin', true, 1);
      setCookie("userRole", user.role, 1);
      setCookie(`userName_${username}`, user.nama, 1);
      setCookie(`userEmail_${username}`, `${username}@mail.com`, 1);
      setCookie(`userWhatsApp_${username}`, user.whatsapp, 1);
    }
  }

  if (loginSuccess) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("activeUser", username);
    setCookie("userId", username, 1);
    localStorage.removeItem("redirect");

    const namaUser = getCookie(`userName_${username}`) || username;
    tambahLogAktivitas(`${namaUser} login ke sistem.`);

    showToast("Login berhasil!", "success");
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1200);
  } else {
    showToast("Login gagal! Username atau Password salah.", "error");
  }
});

// ✅ Handle login Google
function handleGoogleLogin(response) {
  const userData = parseJwt(response.credential);

  const username = userData.email;
  const name = userData.name;
  const role = "pelanggan";
  const redirectUrl = "index.html";

  // Simpan ke cookie dan localStorage
  setCookie('userLogin', true, 1);
  setCookie("userRole", role, 1);
  setCookie(`userName_${username}`, name, 1);
  setCookie(`userEmail_${username}`, username, 1);
  setCookie(`userWhatsApp_${username}`, "08xxxxxxxxxx", 1);
  setCookie("userId", username, 1);

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("activeUser", username);
  localStorage.removeItem("redirect");

  tambahLogAktivitas(`${name} login dengan Google.`);

  showToast("Login dengan Google berhasil!", "success");

  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1200);
}

// ✅ Parse JWT dari Google
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
  return JSON.parse(jsonPayload);
}

// ✅ Utility
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cookieArr = document.cookie.split('; ');
  for (let cookie of cookieArr) {
    const [key, val] = cookie.split('=');
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

function tambahLogAktivitas(aksi) {
  const waktu = new Date().toLocaleString("id-ID");
  const log = { waktu, aksi };
  const logList = JSON.parse(localStorage.getItem("logAktivitas")) || [];
  logList.unshift(log);
  localStorage.setItem("logAktivitas", JSON.stringify(logList));
}
