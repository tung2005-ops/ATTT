
function showPage(id) {
  document.querySelectorAll('.attack-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'"+id+"'")) {
      item.classList.add('active');
    }
  });
  window.scrollTo(0,0);
}
function switchTab(el, contentId) {
  const tabs = el.closest('.tabs').querySelectorAll('.tab');
  const contents = el.closest('.card-body').querySelectorAll('.tab-content');
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(contentId).classList.add('active');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function toHex(n) { return n.toString(16).padStart(2,'0'); }

async function runScaAttack() {
  const secret = document.getElementById('sca-secret').value.toLowerCase();
  if (!/^[0-9a-f]+$/.test(secret)) {
    alert("Vui lòng nhập giá trị Hex hợp lệ (0-9, a-f).");
    return;
  }
  const term = document.getElementById('sca-term');
  const log = document.getElementById('sca-log');
  const res = document.getElementById('sca-result');
  term.style.display = 'block';
  log.innerHTML = '';
  res.className = 'result-box';
  res.innerHTML = '';
  
  let recovered = '';
  let hexChars = '0123456789abcdef';
  
  function simulateTiming(guess, actual) {
    let delay = 0;
    for(let i=0; i<guess.length; i++) {
      delay += 5;
      if (guess[i] !== actual[i]) break;
    }
    if (guess === actual) delay += 10;
    return delay;
  }

  log.innerHTML += '<span class="t-comment">Hệ thống đang khởi tạo phân tích Timing Analysis...</span>\n';
  
  for(let i=0; i<secret.length; i++) {
    let maxTime = -1;
    let bestChar = '';
    
    log.innerHTML += `<span class="t-line">Tiến hành đo lường độ trễ cho byte vị trí ${i}...</span>`;
    await sleep(150);
    
    for(let j=0; j<hexChars.length; j++) {
      let char = hexChars[j];
      let guess = recovered + char + '0'.repeat(secret.length - recovered.length - 1);
      
      let time = simulateTiming(guess, secret);
      time += Math.random() * 2; 
      
      if (time > maxTime) {
        maxTime = time;
        bestChar = char;
      }
    }
    
   // ... (phần trên của vòng lặp for)
    recovered += bestChar;
    log.innerHTML += `<span class="t-line t-ok">[+] Đã trích xuất byte: ${bestChar} (Timing anomaly: ~${maxTime.toFixed(1)}ms)</span>`;
    log.scrollTop = log.scrollHeight;
  }
  
  // ---> THÊM 2 DÒNG NÀY Ở ĐÂY <---
  await sleep(50); // Chờ 50ms để trình duyệt kịp vẽ dòng cuối cùng ra màn hình
  log.scrollTop = log.scrollHeight; // Cuộn xuống lần cuối cùng
  
  res.classList.add('show');
  res.innerHTML = `<strong>Kết quả:</strong> Token bảo mật đã bị thỏa hiệp: <strong>${recovered}</strong> thông qua rò rỉ kênh kề thời gian.`;
}

async function runPaddingOracle() {
  const btn = document.getElementById('po-btn');
  const prog = document.getElementById('po-progress');
  const bar = document.getElementById('po-bar');
  const pct = document.getElementById('po-pct');
  const term = document.getElementById('po-term');
  const log = document.getElementById('po-log');
  const res = document.getElementById('po-result');
  
  btn.disabled = true;
  prog.style.display = 'block';
  term.style.display = 'block';
  log.innerHTML = '';
  res.className = 'result-box';
  
  const target = document.getElementById('po-pt').value;
  let recovered = '';
  
  log.innerHTML += `<span class="t-comment">Đang kết nối đến Oracle service...</span>\n`;
  log.innerHTML += `<span class="t-comment">Bắt đầu truyền tải các khối Ciphertext đã bị chỉnh sửa...</span>\n`;
  
  for(let i=0; i<target.length; i++) {
    await sleep(100);
    
    let tries = Math.floor(Math.random() * 128) + 1;
    recovered += target[i];
    
    let progress = Math.round(((i+1)/target.length)*100);
    bar.style.width = progress + '%';
    pct.innerText = `${progress}% - Đang xử lý giải mã byte ${i+1}/${target.length}`;
    
    log.innerHTML += `<span class="t-line">Offset ${i}: Đã thử nghiệm <span class="t-val">${tries}</span> lần -> Nhận phản hồi <span class="t-ok">Padding Valid</span> -> Trích xuất: <span class="t-ok">'${target[i]}'</span></span>`;
    log.scrollTop = log.scrollHeight;
  }
  
  res.classList.add('show');
  res.innerHTML = `<strong>Kết quả:</strong> Đã khôi phục thành công Plaintext: <strong>${recovered}</strong> mà không cần sử dụng khóa mã hóa gốc.`;
  btn.disabled = false;
}


async function runBruteForce() {
  const dictSize = parseInt(document.getElementById('bf-dict').value);
  const term = document.getElementById('bf-term');
  const log = document.getElementById('bf-log');
  const res = document.getElementById('bf-result');
  
  term.style.display = 'block';
  log.innerHTML = '<span class="t-comment">Đang nạp dữ liệu từ điển mật khẩu phổ biến...</span>\n';
  res.className = 'result-box';
  
  const commonPasswords = ['123456', 'admin', 'qwerty', 'password', '12345678', '111111', '123456789', '12345', '1234567', 'iloveyou'];
  let targetPassword = "password123";
  let found = false;
  
  for(let i=1; i<=dictSize; i++) {
    let guess = i === Math.floor(dictSize * 0.8) ? targetPassword : commonPasswords[Math.floor(Math.random() * commonPasswords.length)];
    
    if (i % 5 === 0 || guess === targetPassword) {
      log.innerHTML += `<span class="t-line">Thực hiện hàm dẫn xuất khóa (PBKDF2) với mẫu: <span class="t-val">${guess}</span>...</span>`;
      log.scrollTop = log.scrollHeight;
      await sleep(80);
    }
    
    if (guess === targetPassword) {
      log.innerHTML += `<span class="t-line t-ok">[+] KHỚP THÀNH CÔNG! Đã xác định được mật khẩu mã hóa tương ứng.</span>`;
      found = true;
      break;
    }
  }
  
  res.classList.add('show');
  if (found) {
    res.innerHTML = `<strong>Kết quả:</strong> Đã bẻ khóa thành công. Mật khẩu gốc được xác định là: <strong>${targetPassword}</strong>`;
  } else {
    res.classList.add('error');
    res.innerHTML = `<strong>Cảnh báo:</strong> Quá trình thất bại. Mật khẩu không tồn tại trong từ điển ${dictSize} mẫu đã chọn.`;
  }
}

async function runCryptanalysis() {
  const k1Input = document.getElementById('mitm-input-k1').value;
  const k2Input = document.getElementById('mitm-input-k2').value;
  
  if (k1Input === '' || k2Input === '') {
    alert("Vui lòng nhập đầy đủ giá trị cho K1 và K2.");
    return;
  }
  
  const TARGET_K1 = parseInt(k1Input);
  const TARGET_K2 = parseInt(k2Input);
  
  if (isNaN(TARGET_K1) || isNaN(TARGET_K2) || TARGET_K1 < 0 || TARGET_K1 > 255 || TARGET_K2 < 0 || TARGET_K2 > 255) {
    alert("Giá trị K1 và K2 phải là số nguyên trong khoảng [0, 255].");
    return;
  }

  const btn = document.getElementById('crypto-btn');
  const term = document.getElementById('crypto-term');
  const log = document.getElementById('crypto-log');
  const res = document.getElementById('crypto-result');
  const stats = document.getElementById('crypto-stats');
  
  btn.disabled = true;
  term.style.display = 'block';
  stats.style.display = 'flex';
  log.innerHTML = '';
  res.className = 'result-box';
  
  log.innerHTML += '<span class="t-comment">Đang khởi tạo chu trình phân tích Meet-in-the-Middle...</span>\n';
  log.innerHTML += '<span class="t-line">Giai đoạn 1: Tạo bảng băm cho các giá trị mã hóa thuận E(k1, P)...</span>';
  
  await sleep(500);
  log.innerHTML += '<span class="t-line t-ok">[+] Hoàn tất lưu 256 trạng thái trung gian vào bộ nhớ RAM.</span>\n';
  
  log.innerHTML += '<span class="t-line">Giai đoạn 2: Xử lý giải mã ngược D(k2, C) và truy vấn đối chiếu bảng băm...</span>';
  
  await sleep(600);
  log.innerHTML += `<span class="t-line t-ok">[+] PHÁT HIỆN SỰ TRÙNG KHỚP! Đã xác định được giao điểm kết nối.</span>`;
  
  const actualOperations = 256 + TARGET_K2 + 1;
  document.getElementById('mitm-k1').innerText = `0x${toHex(TARGET_K1)}`;
  document.getElementById('mitm-k2').innerText = `0x${toHex(TARGET_K2)}`;
  document.getElementById('mitm-q').innerText = actualOperations;
  
  res.classList.add('show');
  res.innerHTML = `<strong>Kết quả:</strong> Kiến trúc Double-AES đã bị vượt qua. Xác định được cả cặp khóa K1 và K2 với ${actualOperations} thao tác thực tế (Tối đa 512) thay vì 65,536 thao tác.`;
  
  btn.disabled = false;
}
