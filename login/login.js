function register(){
    const errorText = document.getElementById("error_text");
    if(errorText) errorText.style.display = "none";

    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    
    const confirmPassElement = document.getElementById("confirm_pass");
    const confirmPass = confirmPassElement ? confirmPassElement.value.trim() : "";
    
    function showError(msg) {
        if(errorText) {
            errorText.style.display = "block";
            errorText.innerText = msg;
        } else {
            alert(msg);
        }
    }

    if(!user || !pass){
        showError("Vui lòng nhập đầy đủ Username và Password.");
        return;
    }
    
    if(confirmPassElement && pass !== confirmPass) {
        showError("Mật khẩu xác nhận không khớp.");
        return;
    }

    // Validation rules
    const userRegex = /^[a-zA-Z0-9]{4,}$/; // Alphanumeric, at least 4 chars
    if(!userRegex.test(user)) {
        showError("Username không hợp lệ. Phải từ 4 ký tự trở lên và không chứa ký tự đặc biệt/khoảng trắng.");
        return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/; // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    if(!passRegex.test(pass)) {
        showError("Mật khẩu yếu. Phải từ 8 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số.");
        return;
    }

    // lấy danh sách tài khoản
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // kiểm tra tài khoản đã tồn tại chưa
    const exist = users.find(u => u.username === user);

    if(exist){
        showError("Tài khoản đã tồn tại. Vui lòng chọn tên khác.");
        return;
    }

    // thêm tài khoản mới
    users.push({
        username: user,
        password: pass
    });

    // lưu lại
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công!");

    window.location.href = "login.html";
}

function login(){
    const errorText = document.getElementById("error_text");
    if(errorText) errorText.style.display = "none";

    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();

    function showError(msg) {
        if(errorText) {
            errorText.style.display = "block";
            errorText.innerText = msg;
        } else {
            alert(msg);
        }
    }

    if(!user || !pass){
        showError("Vui lòng nhập đầy đủ Username và Password.");
        return;
    }

    // lấy danh sách tài khoản
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // tìm tài khoản đúng
    const found = users.find(
        u => u.username === user && u.password === pass
    );

    if(found){

        localStorage.setItem("loggedIn","true");

        localStorage.setItem("currentUser", user);

        alert("Đăng nhập thành công");

        window.location.href = "../AES/aes.html";

    }else{
        showError("Sai tài khoản hoặc mật khẩu");
    }
}

function logout(){

    localStorage.removeItem("loggedIn");

    localStorage.removeItem("currentUser");

    window.location.href = "../login/login.html";
}