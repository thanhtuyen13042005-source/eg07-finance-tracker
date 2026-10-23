// Khởi tạo dữ liệu từ LocalStorage (Bài 3)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Hàm chống XSS bảo mật đầu vào - Escape HTML strings (Bài 4)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Định dạng tiền tệ VNĐ
function formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

// Thêm giao dịch mới (Bài 2 & Bài 4 Validation)
function addTransaction(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const rawDesc = document.getElementById('description').value.trim();
    const amountInput = document.getElementById('amount').value;
    const date = document.getElementById('date').value;

    // Kiểm tra không để trống dữ liệu
    if (!rawDesc || !amountInput || !date) {
        alert('Vui lòng điền đầy đủ tất cả các trường thông tin!');
        return;
    }

    // Kiểm tra số tiền phải lớn hơn 0
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
        alert('Số tiền nhập vào phải lớn hơn 0!');
        return;
    }

    // Escape HTML chống XSS
    const description = escapeHTML(rawDesc);

    const newTransaction = {
        id: Date.now(),
        type,
        description,
        amount,
        date
    };

    transactions.push(newTransaction);
    saveAndRender();

    // Reset form
    document.getElementById('transactionForm').reset();
}

// Xóa giao dịch
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndRender();
}

// Lưu vào LocalStorage và cập nhật giao diện (Bài 3)
function saveAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderApp();
}

// Render dữ liệu lên bảng và tính toán tổng quan (Bài 1 & 3)
function renderApp() {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td><span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">${t.type === 'income' ? 'Thu' : 'Chi'}</span></td>
            <td class="${t.type === 'income' ? 'text-success' : 'text-danger'} fw-bold">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${t.id})">Xóa</button></td>
        `;
        tableBody.appendChild(row);
    });

    const totalBalance = totalIncome - totalExpense;

    document.getElementById('totalIncome').innerText = formatCurrency(totalIncome);
    document.getElementById('totalExpense').innerText = formatCurrency(totalExpense);
    
    const balanceEl = document.getElementById('totalBalance');
    balanceEl.innerText = formatCurrency(totalBalance);
    balanceEl.className = `fw-bold mb-0 ${totalBalance >= 0 ? 'text-primary' : 'text-danger'}`;

    // Vẽ biểu đồ thu chi dạng Progress Bar (Bài 3)
    const total = totalIncome + totalExpense;
    let incomePercent = 50;
    let expensePercent = 50;
    if (total > 0) {
        incomePercent = (totalIncome / total) * 100;
        expensePercent = (totalExpense / total) * 100;
    }

    document.getElementById('incomeProgress').style.width = `${incomePercent}%`;
    document.getElementById('expenseProgress').style.width = `${expensePercent}%`;
}

// Chạy hiển thị khi tải trang
renderApp();