
        // 默认数据 - 微软风格
        const defaultData = {
            engines: [
                { 
                    name: "Bing", 
                    prefix: "https://www.bing.com/search?q={q}", 
                    icon: "fab fa-microsoft", 
                    color: "#0078D7" 
                },
                { 
                    name: "Google", 
                    prefix: "https://www.google.com/search?q={q}", 
                    icon: "fab fa-google", 
                    color: "#4285F4" 
                },
                { 
                    name: "百度", 
                    prefix: "https://www.baidu.com/s?wd={q}", 
                    icon: "fab fa-baidu", 
                    color: "#2932e1" 
                },
                { 
                    name: "DuckDuckGo", 
                    prefix: "https://duckduckgo.com/?q={q}", 
                    icon: "fas fa-duck", 
                    color: "#DE5833" 
                }
            ],
            
            cards: [
                { title: "Office", url: "https://www.office.com", letter: "O" },
                { title: "GitHub", url: "https://github.com", letter: "G" },
                { title: "Bilibili", url: "https://bilibili.com", letter: "B" },
                { title: "YouTube", url: "https://youtube.com", letter: "Y" },
            ],
            
            currentEngine: 0,
            blurLevel: 0,
            wallpaper: "default",
            
            collapsedSections: {
                engine: false,
                cards: true,
                wallpaper: false
            }
        };

        // 状态管理
        let appState = {...defaultData};
        let addingNewCard = false;
        let editingCardIndex = -1;
        let addingNewEngine = false;
        let editingEngineIndex = -1;
        let timeInterval; // 用于存储时间更新定时器

        // DOM元素引用
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const closeSettings = document.getElementById('close-settings');
        const engineIcon = document.getElementById('engine-icon');
        const engineList = document.getElementById('engine-list');
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const quickLinks = document.getElementById('quick-links');
        const cardsList = document.getElementById('cards-list');
        const newEngineName = document.getElementById('new-engine-name');
        const newEngineUrl = document.getElementById('new-engine-url');
        const addEngineBtn = document.getElementById('add-engine-btn');
        const cancelEngineBtn = document.getElementById('cancel-engine');
        const cardTitle = document.getElementById('card-title');
        const cardUrl = document.getElementById('card-url');
        const saveCardBtn = document.getElementById('save-card');
        const cancelCardBtn = document.getElementById('cancel-card');
        const blurRange = document.getElementById('blur-range');
        const blurValue = document.getElementById('blur-value');
        const uploadBtn = document.getElementById('upload-btn');
        const wallpaperFile = document.getElementById('wallpaper-file');
        const wallpaperElement = document.getElementById('wallpaper');
        const blurOverlay = document.getElementById('blur-overlay');
        const engineContent = document.getElementById('engine-content');
        const cardsContent = document.getElementById('cards-content');
        const wallpaperContent = document.getElementById('wallpaper-content');
        const cardForm = document.getElementById('card-form');
        const addCardBtn = document.getElementById('add-card-btn');
        const notification = document.getElementById('notification');
        const timeDisplay = document.getElementById('time-display'); // 时间显示元素

        // 初始化应用
        function initApp() {
            loadSettings();
            renderSearchEngines();
            renderCards();
            updateBlurEffect();
            setupEventListeners();
            setupCollapsibleSections();
            startTimeUpdater(); // 启动时间更新器
        }

        // 设置折叠部分
        function setupCollapsibleSections() {
            document.querySelectorAll('.section-header').forEach(header => {
                const section = header.dataset.section;
                const content = document.getElementById(`${section}-content`);
                const icon = header.querySelector('.toggle-icon i');
                
                if (appState.collapsedSections[section]) {
                    content.classList.remove('expanded');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    content.classList.add('expanded');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
                
                header.addEventListener('click', () => {
                    const isCollapsed = !content.classList.contains('expanded');
                    
                    content.classList.toggle('expanded');
                    if (isCollapsed) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                    
                    appState.collapsedSections[section] = !isCollapsed;
                    saveSettings();
                });
            });
        }

        // 加载设置
        function loadSettings() {
            const savedSettings = localStorage.getItem('startPageSettings');
            if (savedSettings) {
                try {
                    appState = JSON.parse(savedSettings);
                    
                    if (!appState.engines || appState.engines.length === 0) {
                        appState.engines = [...defaultData.engines];
                    }
                    
                    if (appState.currentEngine >= appState.engines.length) {
                        appState.currentEngine = 0;
                    }
                    
                    // 迁移旧卡片数据（如果缺少letter属性）
                    if (appState.cards) {
                        appState.cards.forEach(card => {
                            if (!card.letter && card.title) {
                                // 只取首字母，而不是整个单词
                                card.letter = card.title.charAt(0).toUpperCase();
                            }
                        });
                    }
                    
                    // 设置壁纸
                    if (appState.wallpaper && appState.wallpaper !== "default") {
                        wallpaperElement.style.backgroundImage = `url(${appState.wallpaper})`;
                    }
                } catch (e) {
                    appState = {...defaultData};
                }
            }
        }

        // 保存设置
        function saveSettings() {
            localStorage.setItem('startPageSettings', JSON.stringify(appState));
        }

        // 渲染搜索引擎
        function renderSearchEngines() {
            engineList.innerHTML = '';
            
            appState.engines.forEach((engine, index) => {
                const engineItem = document.createElement('div');
                engineItem.className = `engine-item ${index === appState.currentEngine ? 'active' : ''}`;
                engineItem.innerHTML = `
                    <div class="engine-icon" style="background:${engine.color}">
                        <i class="${engine.icon}"></i>
                    </div>
                    <div class="engine-details">
                        <div class="engine-title">${engine.name}</div>
                        <div class="engine-url">${engine.prefix.replace('{q}', '搜索词')}</div>
                    </div>
                    <div class="engine-actions">
                        <button class="edit-engine" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-engine" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                engineItem.addEventListener('click', (e) => {
                    if (!e.target.closest('.engine-actions')) {
                        appState.currentEngine = index;
                        renderSearchEngines();
                        updateCurrentEngine();
                        saveSettings();
                    }
                });
                
                engineList.appendChild(engineItem);
            });
            
            updateCurrentEngine();
            
            // 设置引擎操作事件监听器
            document.querySelectorAll('.edit-engine').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').dataset.index);
                    editEngine(index);
                });
            });
            
            document.querySelectorAll('.delete-engine').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').dataset.index);
                    deleteEngine(index);
                });
            });
        }

        // 编辑搜索引擎
        function editEngine(index) {
            const engine = appState.engines[index];
            newEngineName.value = engine.name;
            newEngineUrl.value = engine.prefix;
            addingNewEngine = false;
            editingEngineIndex = index;
            
            // 确保引擎设置部分展开
            appState.collapsedSections.engine = false;
            engineContent.classList.add('expanded');
            document.querySelector('[data-section="engine"] .toggle-icon i')
                .classList.replace('fa-chevron-down', 'fa-chevron-up');
        }

        // 删除搜索引擎
        function deleteEngine(index) {
            if (appState.engines.length <= 1) {
                showNotification('至少保留一个搜索引擎');
                return;
            }
            
            if (confirm('确定要删除这个搜索引擎吗？')) {
                appState.engines.splice(index, 1);
                if (appState.currentEngine >= index) {
                    appState.currentEngine = Math.max(0, appState.currentEngine - 1);
                }
                renderSearchEngines();
                saveSettings();
                showNotification('搜索引擎已删除');
            }
        }

        // 更新当前引擎
        function updateCurrentEngine() {
            const currentEngine = appState.engines[appState.currentEngine];
            engineIcon.innerHTML = `<i class="${currentEngine.icon}"></i>`;
            engineIcon.style.background = currentEngine.color;
        }

        // 渲染卡片 - 支持无限卡片
        function renderCards() {
            quickLinks.innerHTML = '';
            cardsList.innerHTML = '';
            
            appState.cards.forEach((card, index) => {
                // 主页卡片
                const linkCard = document.createElement('div');
                linkCard.className = 'link-card';
                
                // 使用首字母图标（只显示首字母）
                const letterIcon = document.createElement('div');
                letterIcon.className = 'letter-icon';
                // 确保只显示首字母
                letterIcon.textContent = card.letter ? card.letter.charAt(0) : card.title.charAt(0);
                
                linkCard.appendChild(letterIcon);
                linkCard.innerHTML += `<div class="link-title">${card.title}</div>`;
                
                linkCard.addEventListener('click', () => window.open(card.url, '_blank'));
                quickLinks.appendChild(linkCard);
                
                // 设置面板卡片
                const cardItem = document.createElement('div');
                cardItem.className = 'card-item';
                cardItem.innerHTML = `
                    <div class="card-icon">${card.letter ? card.letter.charAt(0) : card.title.charAt(0)}</div>
                    <div class="card-details">
                        <div class="card-title">${card.title}</div>
                        <div class="card-url">${card.url}</div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-card" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-card" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cardsList.appendChild(cardItem);
            });
            
            // 添加"添加卡片"按钮 - 支持无限添加
            const addCard = document.createElement('div');
            addCard.className = 'link-card add-card';
            addCard.innerHTML = '<i class="fas fa-plus"></i>';
            addCard.addEventListener('click', () => {
                addingNewCard = true;
                editingCardIndex = -1;
                cardTitle.value = '';
                cardUrl.value = '';
                
                // 打开设置面板
                settingsPanel.classList.add('active');
                
                // 展开卡片设置部分
                appState.collapsedSections.cards = false;
                cardsContent.classList.add('expanded');
                document.querySelector('[data-section="cards"] .toggle-icon i')
                    .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
                // 滚动到表单并高亮
                setTimeout(() => {
                    cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardForm.classList.add('highlighted');
                    setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
                }, 300);
            });
            quickLinks.appendChild(addCard);
            
            // 设置卡片操作事件监听器
            document.querySelectorAll('.edit-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').dataset.index);
                    editCard(index);
                });
            });
            
            document.querySelectorAll('.delete-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').dataset.index);
                    deleteCard(index);
                });
            });
        }

        // 编辑卡片
        function editCard(index) {
            const card = appState.cards[index];
            cardTitle.value = card.title;
            cardUrl.value = card.url;
            addingNewCard = false;
            editingCardIndex = index;
            
            // 打开设置面板
            settingsPanel.classList.add('active');
            
            // 展开卡片设置部分
            appState.collapsedSections.cards = false;
            cardsContent.classList.add('expanded');
            document.querySelector('[data-section="cards"] .toggle-icon i')
                .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
            // 滚动到表单并高亮
            setTimeout(() => {
                cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardForm.classList.add('highlighted');
                setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
            }, 300);
        }

        // 删除卡片
        function deleteCard(index) {
            if (confirm('确定要删除这个卡片吗？')) {
                appState.cards.splice(index, 1);
                renderCards();
                saveSettings();
                showNotification('卡片已删除');
            }
        }

        // 显示通知
        function showNotification(message) {
            const icon = notification.querySelector('i');
            const text = notification.querySelector('span');
            
            text.textContent = message;
            icon.className = 'fas fa-check-circle';
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // 保存卡片
        function saveCard() {
            const title = cardTitle.value.trim();
            const url = cardUrl.value.trim();
            
            if (!title || !url) {
                showNotification('请填写标题和网址');
                return;
            }
            
            // 确保URL有协议前缀
            let validUrl = url;
            if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
                validUrl = 'https://' + validUrl;
            }
            
            // 提取首字母作为图标（只取首字母）
            const letter = title.charAt(0).toUpperCase();
            
            if (addingNewCard) {
                // 添加新卡片 - 支持无限添加
                appState.cards.push({ 
                    title, 
                    url: validUrl, 
                    letter
                });
                showNotification('卡片添加成功！');
            } else if (editingCardIndex !== -1) {
                // 更新现有卡片
                appState.cards[editingCardIndex] = { 
                    title, 
                    url: validUrl, 
                    letter
                };
                showNotification('卡片更新成功！');
            }
            
            renderCards();
            saveSettings();
            cardTitle.value = '';
            cardUrl.value = '';
            editingCardIndex = -1;
        }

        // 保存搜索引擎
        function saveEngine() {
            const name = newEngineName.value.trim();
            const url = newEngineUrl.value.trim();
            
            if (!name || !url) {
                showNotification('请填写名称和网址');
                return;
            }
            
            if (!url.includes('{q}')) {
                showNotification('网址中必须包含 {q} 作为查询词占位符');
                return;
            }
            
            if (addingNewEngine) {
                // 添加新引擎
                appState.engines.push({ 
                    name, 
                    prefix: url,
                    icon: 'fas fa-search',
                    color: '#0078D7'
                });
                showNotification('搜索引擎添加成功！');
            } else if (editingEngineIndex !== -1) {
                // 更新现有引擎
                appState.engines[editingEngineIndex] = { 
                    name, 
                    prefix: url,
                    icon: appState.engines[editingEngineIndex].icon || 'fas fa-search',
                    color: appState.engines[editingEngineIndex].color || '#0078D7'
                };
                showNotification('搜索引擎更新成功！');
            }
            
            renderSearchEngines();
            saveSettings();
            newEngineName.value = '';
            newEngineUrl.value = '';
            editingEngineIndex = -1;
        }

        // 更新模糊效果
        function updateBlurEffect() {
            blurOverlay.style.backdropFilter = `blur(${appState.blurLevel}px)`;
            blurOverlay.style.webkitBackdropFilter = `blur(${appState.blurLevel}px)`;
            blurValue.textContent = appState.blurLevel;
            blurRange.value = appState.blurLevel;
        }

        // 更新时间显示
        function updateTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeDisplay.textContent = `${hours}:${minutes}`;
        }

        // 启动时间更新器
        function startTimeUpdater() {
            updateTime(); // 立即更新一次
            timeInterval = setInterval(updateTime, 1000); // 每秒更新一次
        }

        // 设置事件监听
        function setupEventListeners() {
            // 设置面板开关
            settingsBtn.addEventListener('click', () => settingsPanel.classList.add('active'));
            closeSettings.addEventListener('click', () => settingsPanel.classList.remove('active'));
            
            // 搜索功能
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
            
            // 添加搜索引擎
            addEngineBtn.addEventListener('click', saveEngine);
            cancelEngineBtn.addEventListener('click', () => {
                newEngineName.value = '';
                newEngineUrl.value = '';
                editingEngineIndex = -1;
            });
            
            // 卡片操作
            saveCardBtn.addEventListener('click', saveCard);
            cancelCardBtn.addEventListener('click', () => {
                cardTitle.value = '';
                cardUrl.value = '';
                editingCardIndex = -1;
            });
            
            // 模糊控制
            blurRange.addEventListener('input', () => {
                appState.blurLevel = parseInt(blurRange.value);
                updateBlurEffect();
                saveSettings();
            });
            
            // 壁纸上传
            uploadBtn.addEventListener('click', () => wallpaperFile.click());
            
            wallpaperFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        appState.wallpaper = event.target.result;
                        wallpaperElement.style.backgroundImage = `url(${appState.wallpaper})`;
                        saveSettings();
                        showNotification('壁纸设置成功！');
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // 预设壁纸选择
            document.querySelectorAll('.wallpaper-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.wallpaper-item').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                    
                    const url = item.dataset.url;
                    if (url === 'default') {
                        wallpaperElement.style.backgroundImage = '';
                        appState.wallpaper = 'default';
                    } else {
                        wallpaperElement.style.backgroundImage = `url(${url})`;
                        appState.wallpaper = url;
                    }
                    saveSettings();
                    showNotification('壁纸设置成功！');
                });
            });
            
            // 添加新卡片按钮（在设置面板内部）
            addCardBtn.addEventListener('click', () => {
                addingNewCard = true;
                editingCardIndex = -1;
                cardTitle.value = '';
                cardUrl.value = '';
                
                // 确保卡片设置部分展开
                appState.collapsedSections.cards = false;
                cardsContent.classList.add('expanded');
                document.querySelector('[data-section="cards"] .toggle-icon i')
                    .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
                // 滚动到表单并高亮
                setTimeout(() => {
                    cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardForm.classList.add('highlighted');
                    setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
                }, 300);
            });
        }

        // 执行搜索
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                const engine = appState.engines[appState.currentEngine];
                const searchUrl = engine.prefix.replace('{q}', encodeURIComponent(query));
                window.location.href = searchUrl;
            }
        }

        // 清理定时器
        function cleanup() {
            if (timeInterval) {
                clearInterval(timeInterval);
            }
        }

        // 启动应用
        window.addEventListener('DOMContentLoaded', initApp);
        window.addEventListener('beforeunload', cleanup);
