// 设备类型常量
const EQUIPMENT_TYPES = {
    'OXYGEN': '制氧机',
    'SUCTION': '抽痰机',
    'WHEELCHAIR': '轮椅',
    'BED': '医疗床',
    'OTHER': '其他设备'
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前年份
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // 初始化页面
    showWelcome();
    
    // 导航菜单事件
    document.getElementById('nav-loan').addEventListener('click', function(e) {
        e.preventDefault();
        showLoanForm();
    });
    
    document.getElementById('nav-return').addEventListener('click', function(e) {
        e.preventDefault();
        showReturnForm();
    });
    
    document.getElementById('nav-query').addEventListener('click', function(e) {
        e.preventDefault();
        showQueryOptions();
    });
});

// 显示欢迎信息
function showWelcome() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="welcome-message text-center py-5 fade-in">
            <h2>欢迎使用医疗设备借用系统</h2>
            <p class="lead">请选择上方导航菜单开始操作</p>
            <img src="/assets/medical-equipment.png" alt="医疗设备" class="img-fluid mt-3" style="max-height: 200px;">
        </div>
    `;
}

// 显示借用表单
function showLoanForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">设备借用登记</h5>
                </div>
                <div class="card-body">
                    <form id="loanForm">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="borrowerName" class="form-label">姓名</label>
                                <input type="text" class="form-control" id="borrowerName" required>
                            </div>
                            <div class="col-md-6">
                                <label for="borrowerPhone" class="form-label">联系电话</label>
                                <input type="tel" class="form-control" id="borrowerPhone" required>
                            </div>
                            <div class="col-12">
                                <label for="borrowerAddress" class="form-label">地址</label>
                                <input type="text" class="form-control" id="borrowerAddress" required>
                            </div>
                            <div class="col-md-6">
                                <label for="loanDate" class="form-label">借用日期</label>
                                <input type="date" class="form-control" id="loanDate" required>
                            </div>
                            <div class="col-md-6">
                                <label for="expectedReturnDate" class="form-label">预计归还日期</label>
                                <input type="date" class="form-control" id="expectedReturnDate" required>
                            </div>
                        </div>
                        
                        <div class="equipment-section mt-4">
                            <h5 class="mb-3">借用设备</h5>
                            <div id="equipmentItems">
                                <!-- 设备条目将在这里动态添加 -->
                            </div>
                            <button type="button" class="btn btn-outline-success mt-2" id="addEquipment">
                                <i class="bi bi-plus"></i> 添加设备
                            </button>
                        </div>
                        
                        <div class="mt-4">
                            <button type="submit" class="btn btn-success">提交借用申请</button>
                            <button type="button" class="btn btn-outline-secondary ms-2" id="cancelLoan">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('loanDate').value = today;
    
    // 添加设备按钮事件
    document.getElementById('addEquipment').addEventListener('click', addEquipmentItem);
    
    // 取消按钮事件
    document.getElementById('cancelLoan').addEventListener('click', showWelcome);
    
    // 表单提交事件
    document.getElementById('loanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitLoanForm();
    });
    
    // 初始添加一个设备条目
    addEquipmentItem();
}

// 添加设备条目
function addEquipmentItem() {
    const equipmentItems = document.getElementById('equipmentItems');
    const itemId = Date.now(); // 使用时间戳作为唯一ID
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'equipment-item row g-3 mb-3';
    itemDiv.dataset.id = itemId;
    
    itemDiv.innerHTML = `
        <div class="col-md-4">
            <label class="form-label">设备类型</label>
            <select class="form-select equipment-type">
                ${Object.entries(EQUIPMENT_TYPES).map(([value, text]) => 
                    `<option value="${value}">${text}</option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <label class="form-label">设备编号</label>
            <input type="text" class="form-control equipment-id" placeholder="如: WH-001" required>
        </div>
        <div class="col-md-3">
            <label class="form-label">数量</label>
            <input type="number" class="form-control equipment-qty" value="1" min="1" required>
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-equipment" title="删除">
                ×
            </button>
        </div>
    `;
    
    equipmentItems.appendChild(itemDiv);
    
    // 添加删除按钮事件
    itemDiv.querySelector('.remove-equipment').addEventListener('click', function() {
        if (document.querySelectorAll('.equipment-item').length > 1) {
            itemDiv.remove();
        } else {
            showModal('提示', '至少需要保留一件设备');
        }
    });
}

// 提交借用表单
async function submitLoanForm() {
    const borrowerName = document.getElementById('borrowerName').value.trim();
    const borrowerPhone = document.getElementById('borrowerPhone').value.trim();
    const borrowerAddress = document.getElementById('borrowerAddress').value.trim();
    const loanDate = document.getElementById('loanDate').value;
    const expectedReturnDate = document.getElementById('expectedReturnDate').value;
    
    // 收集设备信息
    const equipmentItems = [];
    document.querySelectorAll('.equipment-item').forEach(item => {
        const type = item.querySelector('.equipment-type').value;
        const id = item.querySelector('.equipment-id').value.trim();
        const quantity = parseInt(item.querySelector('.equipment-qty').value);
        
        if (id) {
            equipmentItems.push({
                type: type,
                typeName: EQUIPMENT_TYPES[type],
                id: id,
                quantity: quantity
            });
        }
    });
    
    // 验证数据
    if (!borrowerName || !borrowerPhone || !borrowerAddress || !loanDate || !expectedReturnDate) {
        showModal('错误', '请填写所有必填字段');
        return;
    }
    
    if (equipmentItems.length === 0) {
        showModal('错误', '请至少添加一件设备');
        return;
    }
    
    // 创建记录对象
    const record = {
        borrower: {
            name: borrowerName,
            phone: borrowerPhone,
            address: borrowerAddress
        },
        loanDate: loanDate,
        expectedReturnDate: expectedReturnDate,
        actualReturnDate: null,
        equipment: equipmentItems,
        status: '借出',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        // 这里替换为实际的API调用
        // const response = await saveLoanRecord(record);
        
        // 模拟成功响应
        showModal('成功', '设备借用记录已保存！');
        document.getElementById('loanForm').reset();
        
        // 3秒后返回欢迎页
        setTimeout(showWelcome, 3000);
    } catch (error) {
        console.error('保存失败:', error);
        showModal('错误', '保存失败，请重试');
    }
}

// 显示归还表单
function showReturnForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">设备归还</h5>
                </div>
                <div class="card-body">
                    <form id="returnForm">
                        <div class="mb-3">
                            <label for="equipmentIdReturn" class="form-label">输入设备编号</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="equipmentIdReturn" placeholder="如: WH-001" required>
                                <button class="btn btn-success" type="submit">查询</button>
                            </div>
                        </div>
                    </form>
                    
                    <div id="returnResults" class="mt-4">
                        <!-- 查询结果将显示在这里 -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 表单提交事件
    document.getElementById('returnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const equipmentId = document.getElementById('equipmentIdReturn').value.trim();
        if (equipmentId) {
            searchEquipmentForReturn(equipmentId);
        }
    });
}

// 查询设备归还
async function searchEquipmentForReturn(equipmentId) {
    const resultsDiv = document.getElementById('returnResults');
    resultsDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-success"></div><p>查询中...</p></div>';
    
    try {
        // 这里替换为实际的API调用
        // const records = await searchLoanRecords(equipmentId);
        
        // 模拟数据
        const records = [
            {
                id: 'rec123',
                borrower: {
                    name: '张三',
                    phone: '13800138000',
                    address: '北京市朝阳区'
                },
                loanDate: '2023-06-01',
                expectedReturnDate: '2023-07-01',
                equipment: [
                    {
                        type: 'WHEELCHAIR',
                        typeName: '轮椅',
                        id: 'WH-001',
                        quantity: 1
                    },
                    {
                        type: 'OXYGEN',
                        typeName: '制氧机',
                        id: 'O2-005',
                        quantity: 1
                    }
                ],
                status: '借出',
                createdAt: '2023-06-01T10:00:00Z'
            }
        ].filter(record => 
            record.equipment.some(item => item.id === equipmentId) && 
            record.status === '借出'
        );
        
        if (records.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-warning">
                    未找到该设备的未归还记录，请检查编号是否正确。
                </div>
            `;
            return;
        }
        
        // 显示查询结果
        let html = '<h5 class="mb-3">查询结果</h5>';
        
        records.forEach(record => {
            const loanDate = dayjs(record.loanDate).format('YYYY-MM-DD');
            const expectedReturn = dayjs(record.expectedReturnDate).format('YYYY-MM-DD');
            
            html += `
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <strong>借用记录 ID:</strong> ${record.id}
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">借用者信息</h6>
                        <p><strong>姓名:</strong> ${record.borrower.name}</p>
                        <p><strong>电话:</strong> ${record.borrower.phone}</p>
                        <p><strong>地址:</strong> ${record.borrower.address}</p>
                        
                        <hr>
                        
                        <h6 class="card-title mt-3">借用信息</h6>
                        <p><strong>借用日期:</strong> ${loanDate}</p>
                        <p><strong>预计归还:</strong> ${expectedReturn}</p>
                        
                        <hr>
                        
                        <h6 class="card-title mt-3">设备列表</h6>
                        <ul class="list-group">
                            ${record.equipment.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${item.typeName} (${item.id})
                                    <span class="badge bg-primary rounded-pill">${item.quantity}</span>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="mt-3">
                            <button class="btn btn-success return-btn" 
                                    data-record-id="${record.id}"
                                    data-equipment-id="${equipmentId}">
                                确认归还此设备
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
        
        // 添加归还按钮事件
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const recordId = this.dataset.recordId;
                const equipmentId = this.dataset.equipmentId;
                confirmReturn(recordId, equipmentId);
            });
        });
        
    } catch (error) {
        console.error('查询失败:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                查询过程中发生错误，请重试。
            </div>
        `;
    }
}

// 确认归还设备
async function confirmReturn(recordId, equipmentId) {
    try {
        // 这里替换为实际的API调用
        // const result = await processEquipmentReturn(recordId, equipmentId);
        
        // 模拟成功响应
        showModal('成功', `设备 ${equipmentId} 已成功归还！`);
        
        // 清空查询框和结果
        document.getElementById('equipmentIdReturn').value = '';
        document.getElementById('returnResults').innerHTML = '';
        
    } catch (error) {
        console.error('归还失败:', error);
        showModal('错误', '归还过程中发生错误');
    }
}

// 显示查询选项
function showQueryOptions() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="fade-in">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">查询记录</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">按借用者查询</h5>
                                    <p class="card-text">根据姓名或电话查询借用记录</p>
                                    <button class="btn btn-success" id="queryByBorrower">查询</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">按设备查询</h5>
                                    <p class="card-text">根据设备编号查询历史记录</p>
                                    <button class="btn btn-success" id="queryByEquipment">查询</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="queryResults" class="mt-4">
                        <!-- 查询结果将显示在这里 -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加查询按钮事件
    document.getElementById('queryByBorrower').addEventListener('click', function() {
        const name = prompt("请输入借用者姓名或电话:");
        if (name) {
            searchRecords('borrower', name.trim());
        }
    });
    
    document.getElementById('queryByEquipment').addEventListener('click', function() {
        const equipmentId = prompt("请输入设备编号:");
        if (equipmentId) {
            searchRecords('equipment', equipmentId.trim());
        }
    });
}

// 查询记录
async function searchRecords(type, keyword) {
    const resultsDiv = document.getElementById('queryResults');
    resultsDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-success"></div><p>查询中...</p></div>';
    
    try {
        // 这里替换为实际的API调用
        // const records = await searchLoanRecords(type, keyword);
        
        // 模拟数据
        const records = [
            {
                id: 'rec123',
                borrower: {
                    name: '张三',
                    phone: '13800138000',
                    address: '北京市朝阳区'
                },
                loanDate: '2023-06-01',
                expectedReturnDate: '2023-07-01',
                actualReturnDate: null,
                equipment: [
                    {
                        type: 'WHEELCHAIR',
                        typeName: '轮椅',
                        id: 'WH-001',
                        quantity: 1
                    },
                    {
                        type: 'OXYGEN',
                        typeName: '制氧机',
                        id: 'O2-005',
                        quantity: 1
                    }
                ],
                status: '借出',
                createdAt: '2023-06-01T10:00:00Z'
            },
            {
                id: 'rec456',
                borrower: {
                    name: '李四',
                    phone: '13900139000',
                    address: '上海市浦东新区'
                },
                loanDate: '2023-05-15',
                expectedReturnDate: '2023-06-15',
                actualReturnDate: '2023-06-10',
                equipment: [
                    {
                        type: 'BED',
                        typeName: '医疗床',
                        id: 'BD-012',
                        quantity: 1
                    }
                ],
                status: '已归还',
                createdAt: '2023-05-15T09:30:00Z'
            }
        ].filter(record => {
            if (type === 'borrower') {
                return record.borrower.name.includes(keyword) || 
                       record.borrower.phone.includes(keyword);
            } else {
                return record.equipment.some(item => item.id.includes(keyword));
            }
        });
        
        if (records.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-warning">
                    未找到匹配的记录。
                </div>
            `;
            return;
        }
        
        // 显示查询结果
        let html = '<h5 class="mb-3">查询结果</h5>';
        
        records.forEach(record => {
            const loanDate = dayjs(record.loanDate).format('YYYY-MM-DD');
            const expectedReturn = dayjs(record.expectedReturnDate).format('YYYY-MM-DD');
            const actualReturn = record.actualReturnDate ? 
                dayjs(record.actualReturnDate).format('YYYY-MM-DD') : '未归还';
            
            html += `
                <div class="card mb-3">
                    <div class="card-header ${record.status === '借出' ? 'bg-warning' : 'bg-light'}">
                        <strong>记录 ID:</strong> ${record.id} | 
                        <strong>状态:</strong> ${record.status}
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">借用者信息</h6>
                        <p><strong>姓名:</strong> ${record.borrower.name}</p>
                        <p><strong>电话:</strong> ${record.borrower.phone}</p>
                        <p><strong>地址:</strong> ${record.borrower.address}</p>
                        
                        <hr>
                        
                        <h6 class="card-title mt-3">借用信息</h6>
                        <p><strong>借用日期:</strong> ${loanDate}</p>
                        <p><strong>预计归还:</strong> ${expectedReturn}</p>
                        <p><strong>实际归还:</strong> ${actualReturn}</p>
                        
                        <hr>
                        
                        <h6 class="card-title mt-3">设备列表</h6>
                        <ul class="list-group">
                            ${record.equipment.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${item.typeName} (${item.id})
                                    <span class="badge bg-primary rounded-pill">${item.quantity}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('查询失败:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                查询过程中发生错误，请重试。
            </div>
        `;
    }
}

// 显示模态框
function showModal(title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${message}</p>`;
    
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
}

/* 
 * 实际部署时需要实现的API函数
 */

// 保存借用记录
async function saveLoanRecord(record) {
    // 实际部署时替换为Netlify Function调用
    // const response = await fetch('/.netlify/functions/save-loan', {
    //     method: 'POST',
    //     body: JSON.stringify(record)
    // });
    // return await response.json();
}

// 查询借用记录
async function searchLoanRecords(type, keyword) {
    // 实际部署时替换为Netlify Function调用
    // const response = await fetch(`/.netlify/functions/search-loans?type=${type}&q=${keyword}`);
    // return await response.json();
}

// 处理设备归还
async function processEquipmentReturn(recordId, equipmentId) {
    // 实际部署时替换为Netlify Function调用
    // const response = await fetch('/.netlify/functions/process-return', {
    //     method: 'POST',
    //     body: JSON.stringify({ recordId, equipmentId })
    // });
    // return await response.json();
}