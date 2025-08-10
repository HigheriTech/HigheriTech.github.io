
        // Ĭ������ - ΢����
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
                    name: "�ٶ�", 
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

        // ״̬����
        let appState = {...defaultData};
        let addingNewCard = false;
        let editingCardIndex = -1;
        let addingNewEngine = false;
        let editingEngineIndex = -1;
        let timeInterval; // ���ڴ洢ʱ����¶�ʱ��

        // DOMԪ������
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
        const timeDisplay = document.getElementById('time-display'); // ʱ����ʾԪ��

        // ��ʼ��Ӧ��
        function initApp() {
            loadSettings();
            renderSearchEngines();
            renderCards();
            updateBlurEffect();
            setupEventListeners();
            setupCollapsibleSections();
            startTimeUpdater(); // ����ʱ�������
        }

        // �����۵�����
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

        // ��������
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
                    
                    // Ǩ�ƾɿ�Ƭ���ݣ����ȱ��letter���ԣ�
                    if (appState.cards) {
                        appState.cards.forEach(card => {
                            if (!card.letter && card.title) {
                                // ֻȡ����ĸ����������������
                                card.letter = card.title.charAt(0).toUpperCase();
                            }
                        });
                    }
                    
                    // ���ñ�ֽ
                    if (appState.wallpaper && appState.wallpaper !== "default") {
                        wallpaperElement.style.backgroundImage = `url(${appState.wallpaper})`;
                    }
                } catch (e) {
                    appState = {...defaultData};
                }
            }
        }

        // ��������
        function saveSettings() {
            localStorage.setItem('startPageSettings', JSON.stringify(appState));
        }

        // ��Ⱦ��������
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
                        <div class="engine-url">${engine.prefix.replace('{q}', '������')}</div>
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
            
            // ������������¼�������
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

        // �༭��������
        function editEngine(index) {
            const engine = appState.engines[index];
            newEngineName.value = engine.name;
            newEngineUrl.value = engine.prefix;
            addingNewEngine = false;
            editingEngineIndex = index;
            
            // ȷ���������ò���չ��
            appState.collapsedSections.engine = false;
            engineContent.classList.add('expanded');
            document.querySelector('[data-section="engine"] .toggle-icon i')
                .classList.replace('fa-chevron-down', 'fa-chevron-up');
        }

        // ɾ����������
        function deleteEngine(index) {
            if (appState.engines.length <= 1) {
                showNotification('���ٱ���һ����������');
                return;
            }
            
            if (confirm('ȷ��Ҫɾ���������������')) {
                appState.engines.splice(index, 1);
                if (appState.currentEngine >= index) {
                    appState.currentEngine = Math.max(0, appState.currentEngine - 1);
                }
                renderSearchEngines();
                saveSettings();
                showNotification('����������ɾ��');
            }
        }

        // ���µ�ǰ����
        function updateCurrentEngine() {
            const currentEngine = appState.engines[appState.currentEngine];
            engineIcon.innerHTML = `<i class="${currentEngine.icon}"></i>`;
            engineIcon.style.background = currentEngine.color;
        }

        // ��Ⱦ��Ƭ - ֧�����޿�Ƭ
        function renderCards() {
            quickLinks.innerHTML = '';
            cardsList.innerHTML = '';
            
            appState.cards.forEach((card, index) => {
                // ��ҳ��Ƭ
                const linkCard = document.createElement('div');
                linkCard.className = 'link-card';
                
                // ʹ������ĸͼ�ֻ꣨��ʾ����ĸ��
                const letterIcon = document.createElement('div');
                letterIcon.className = 'letter-icon';
                // ȷ��ֻ��ʾ����ĸ
                letterIcon.textContent = card.letter ? card.letter.charAt(0) : card.title.charAt(0);
                
                linkCard.appendChild(letterIcon);
                linkCard.innerHTML += `<div class="link-title">${card.title}</div>`;
                
                linkCard.addEventListener('click', () => window.open(card.url, '_blank'));
                quickLinks.appendChild(linkCard);
                
                // ������忨Ƭ
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
            
            // ���"��ӿ�Ƭ"��ť - ֧���������
            const addCard = document.createElement('div');
            addCard.className = 'link-card add-card';
            addCard.innerHTML = '<i class="fas fa-plus"></i>';
            addCard.addEventListener('click', () => {
                addingNewCard = true;
                editingCardIndex = -1;
                cardTitle.value = '';
                cardUrl.value = '';
                
                // ���������
                settingsPanel.classList.add('active');
                
                // չ����Ƭ���ò���
                appState.collapsedSections.cards = false;
                cardsContent.classList.add('expanded');
                document.querySelector('[data-section="cards"] .toggle-icon i')
                    .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
                // ��������������
                setTimeout(() => {
                    cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardForm.classList.add('highlighted');
                    setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
                }, 300);
            });
            quickLinks.appendChild(addCard);
            
            // ���ÿ�Ƭ�����¼�������
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

        // �༭��Ƭ
        function editCard(index) {
            const card = appState.cards[index];
            cardTitle.value = card.title;
            cardUrl.value = card.url;
            addingNewCard = false;
            editingCardIndex = index;
            
            // ���������
            settingsPanel.classList.add('active');
            
            // չ����Ƭ���ò���
            appState.collapsedSections.cards = false;
            cardsContent.classList.add('expanded');
            document.querySelector('[data-section="cards"] .toggle-icon i')
                .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
            // ��������������
            setTimeout(() => {
                cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardForm.classList.add('highlighted');
                setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
            }, 300);
        }

        // ɾ����Ƭ
        function deleteCard(index) {
            if (confirm('ȷ��Ҫɾ�������Ƭ��')) {
                appState.cards.splice(index, 1);
                renderCards();
                saveSettings();
                showNotification('��Ƭ��ɾ��');
            }
        }

        // ��ʾ֪ͨ
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

        // ���濨Ƭ
        function saveCard() {
            const title = cardTitle.value.trim();
            const url = cardUrl.value.trim();
            
            if (!title || !url) {
                showNotification('����д�������ַ');
                return;
            }
            
            // ȷ��URL��Э��ǰ׺
            let validUrl = url;
            if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
                validUrl = 'https://' + validUrl;
            }
            
            // ��ȡ����ĸ��Ϊͼ�ֻ꣨ȡ����ĸ��
            const letter = title.charAt(0).toUpperCase();
            
            if (addingNewCard) {
                // ����¿�Ƭ - ֧���������
                appState.cards.push({ 
                    title, 
                    url: validUrl, 
                    letter
                });
                showNotification('��Ƭ��ӳɹ���');
            } else if (editingCardIndex !== -1) {
                // �������п�Ƭ
                appState.cards[editingCardIndex] = { 
                    title, 
                    url: validUrl, 
                    letter
                };
                showNotification('��Ƭ���³ɹ���');
            }
            
            renderCards();
            saveSettings();
            cardTitle.value = '';
            cardUrl.value = '';
            editingCardIndex = -1;
        }

        // ������������
        function saveEngine() {
            const name = newEngineName.value.trim();
            const url = newEngineUrl.value.trim();
            
            if (!name || !url) {
                showNotification('����д���ƺ���ַ');
                return;
            }
            
            if (!url.includes('{q}')) {
                showNotification('��ַ�б������ {q} ��Ϊ��ѯ��ռλ��');
                return;
            }
            
            if (addingNewEngine) {
                // ���������
                appState.engines.push({ 
                    name, 
                    prefix: url,
                    icon: 'fas fa-search',
                    color: '#0078D7'
                });
                showNotification('����������ӳɹ���');
            } else if (editingEngineIndex !== -1) {
                // ������������
                appState.engines[editingEngineIndex] = { 
                    name, 
                    prefix: url,
                    icon: appState.engines[editingEngineIndex].icon || 'fas fa-search',
                    color: appState.engines[editingEngineIndex].color || '#0078D7'
                };
                showNotification('����������³ɹ���');
            }
            
            renderSearchEngines();
            saveSettings();
            newEngineName.value = '';
            newEngineUrl.value = '';
            editingEngineIndex = -1;
        }

        // ����ģ��Ч��
        function updateBlurEffect() {
            blurOverlay.style.backdropFilter = `blur(${appState.blurLevel}px)`;
            blurOverlay.style.webkitBackdropFilter = `blur(${appState.blurLevel}px)`;
            blurValue.textContent = appState.blurLevel;
            blurRange.value = appState.blurLevel;
        }

        // ����ʱ����ʾ
        function updateTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeDisplay.textContent = `${hours}:${minutes}`;
        }

        // ����ʱ�������
        function startTimeUpdater() {
            updateTime(); // ��������һ��
            timeInterval = setInterval(updateTime, 1000); // ÿ�����һ��
        }

        // �����¼�����
        function setupEventListeners() {
            // ������忪��
            settingsBtn.addEventListener('click', () => settingsPanel.classList.add('active'));
            closeSettings.addEventListener('click', () => settingsPanel.classList.remove('active'));
            
            // ��������
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
            
            // �����������
            addEngineBtn.addEventListener('click', saveEngine);
            cancelEngineBtn.addEventListener('click', () => {
                newEngineName.value = '';
                newEngineUrl.value = '';
                editingEngineIndex = -1;
            });
            
            // ��Ƭ����
            saveCardBtn.addEventListener('click', saveCard);
            cancelCardBtn.addEventListener('click', () => {
                cardTitle.value = '';
                cardUrl.value = '';
                editingCardIndex = -1;
            });
            
            // ģ������
            blurRange.addEventListener('input', () => {
                appState.blurLevel = parseInt(blurRange.value);
                updateBlurEffect();
                saveSettings();
            });
            
            // ��ֽ�ϴ�
            uploadBtn.addEventListener('click', () => wallpaperFile.click());
            
            wallpaperFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        appState.wallpaper = event.target.result;
                        wallpaperElement.style.backgroundImage = `url(${appState.wallpaper})`;
                        saveSettings();
                        showNotification('��ֽ���óɹ���');
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Ԥ���ֽѡ��
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
                    showNotification('��ֽ���óɹ���');
                });
            });
            
            // ����¿�Ƭ��ť������������ڲ���
            addCardBtn.addEventListener('click', () => {
                addingNewCard = true;
                editingCardIndex = -1;
                cardTitle.value = '';
                cardUrl.value = '';
                
                // ȷ����Ƭ���ò���չ��
                appState.collapsedSections.cards = false;
                cardsContent.classList.add('expanded');
                document.querySelector('[data-section="cards"] .toggle-icon i')
                    .classList.replace('fa-chevron-down', 'fa-chevron-up');
                
                // ��������������
                setTimeout(() => {
                    cardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardForm.classList.add('highlighted');
                    setTimeout(() => cardForm.classList.remove('highlighted'), 1500);
                }, 300);
            });
        }

        // ִ������
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                const engine = appState.engines[appState.currentEngine];
                const searchUrl = engine.prefix.replace('{q}', encodeURIComponent(query));
                window.location.href = searchUrl;
            }
        }

        // ����ʱ��
        function cleanup() {
            if (timeInterval) {
                clearInterval(timeInterval);
            }
        }

        // ����Ӧ��
        window.addEventListener('DOMContentLoaded', initApp);
        window.addEventListener('beforeunload', cleanup);
